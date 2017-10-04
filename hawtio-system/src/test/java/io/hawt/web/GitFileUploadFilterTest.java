package io.hawt.web;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class GitFileUploadFilterTest {


    List<GlobalFileUploadFilter.MagicNumberFileFilter> gitFilters;
    private static final String GIT_CONFIG = "signature=504B0304,offset=0,maxSize=10mb,exc=[@ [ ] # * / & % ? ; $]";

    @Before
    public void setUp() {
        gitFilters = new ArrayList<>(GlobalFileUploadFilter.constructFilters(GIT_CONFIG, new ArrayList<>()));
    }

    @Test
    public void testFabricProfileUpload_GoodContent() throws IOException {
        byte[] profileBytes = getFabricProfile();
        boolean result = GlobalFileUploadFilter.accept(profileBytes, gitFilters);
        assertTrue(result);
    }

    @Test
    public void testFileContainsExceptions_1() {
        String fileContent = "mem.pools.*.used";
        byte[] fileByteContent = fileContent.getBytes();
        Set<String> prohibitedList = GlobalFileUploadFilter.getFinalProhibitedList(gitFilters);
        boolean result = GlobalFileUploadFilter.isAsciiContentDangerous(getFileContentByteStreams(fileByteContent), prohibitedList);
        assertFalse(result);
    }

    @Test
    public void testFabricProfileUpload_BadContent() throws IOException {
        String fileContent = "rem   lets enable stand alone mode";
        byte[] fileByteContent = fileContent.getBytes();
        Set<String> prohibitedList = GlobalFileUploadFilter.getFinalProhibitedList(gitFilters);
        boolean result = GlobalFileUploadFilter.isAsciiContentDangerous(getFileContentByteStreams(fileByteContent), prohibitedList);
        assertTrue(result);
    }

    @Test
    public void testShouldPreventExcessiveFileSize() throws IOException {
        String GIT_CONFIG = "signature=504B0304,offset=0,maxSize=20kb,exc=[@ [ ] # * / & % ? ; $]";
        byte[] profileBytes = getFabricProfile();
        List<GlobalFileUploadFilter.MagicNumberFileFilter> filters =
            GlobalFileUploadFilter.constructFilters(GIT_CONFIG, new ArrayList<>());
        long maxFileSizeAllowed = GlobalFileUploadFilter.getMaxFileSizeAllowed(filters);
        assertTrue(!(profileBytes.length <= maxFileSizeAllowed));

    }

    private ByteArrayOutputStream getFileContentByteStreams(byte[] fileByteContent) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(fileByteContent.length);
        outputStream.write(fileByteContent, 0, fileByteContent.length);
        return outputStream;
    }

    private byte[] getFabricProfile() throws IOException {
        File profile = new File("src/test/resources/data/default.zip");
        FileInputStream profileInputStream = new FileInputStream(profile);
        return IOUtils.toByteArray(profileInputStream);
    }
}
