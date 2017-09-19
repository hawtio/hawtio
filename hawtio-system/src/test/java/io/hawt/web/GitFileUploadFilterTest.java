package io.hawt.web;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Set;

import org.apache.commons.io.IOUtils;
import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class GitFileUploadFilterTest {

    @Test
    public void testFabricProfileUpload_GoodContent() throws IOException {
        File profile = new File("src/test/resources/data/default.zip");
        FileInputStream profileInputStream = new FileInputStream(profile);
        byte[] profileBytes = IOUtils.toByteArray(profileInputStream);

        GitFileUploadFilter filter = GitFileUploadFilter.newGitFileUploadFilter();
        boolean result = GlobalFileUploadFilter.accept(profileBytes, filter.getGitFilters());
        assertTrue(result);
    }

    @Test
    public void testFileContainsExceptions_1() {
        String fileContent = "mem.pools.*.used";
        byte[] fileByteContent = fileContent.getBytes();
        GitFileUploadFilter filter = GitFileUploadFilter.newGitFileUploadFilter();
        Set<String> prohibitedList = GlobalFileUploadFilter.getFinalProhibitedList(filter.getGitFilters());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(fileByteContent.length);
        outputStream.write(fileByteContent, 0, fileByteContent.length);
        boolean result = GlobalFileUploadFilter.isAsciiContentDangerous(outputStream, prohibitedList);
        assertFalse(result);
    }

    @Test
    public void testFabricProfileUpload_BadContent() throws IOException {
        String fileContent = "rem   lets enable stand alone mode";
        byte[] fileByteContent = fileContent.getBytes();
        GitFileUploadFilter filter = GitFileUploadFilter.newGitFileUploadFilter();
        Set<String> prohibitedList = GlobalFileUploadFilter.getFinalProhibitedList(filter.getGitFilters());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(fileByteContent.length);
        outputStream.write(fileByteContent, 0, fileByteContent.length);
        boolean result = GlobalFileUploadFilter.isAsciiContentDangerous(outputStream, prohibitedList);
        assertTrue(result);
    }
}
