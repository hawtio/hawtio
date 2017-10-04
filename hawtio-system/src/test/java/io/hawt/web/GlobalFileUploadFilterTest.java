package io.hawt.web;

import java.io.IOException;
import java.io.FileInputStream;
import java.io.File;
import java.io.ObjectOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.zip.ZipInputStream;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.junit.Test;

import static org.junit.Assert.*;

public class GlobalFileUploadFilterTest {

    @Test
    public void testPreventsJavaSerializedFileUpload() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=D0CF11E0A1B11AE1,offset=2,maxSize=250kb");
        GlobalFileUploadFilter uploadFilter = GlobalFileUploadFilter.newFileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertFalse(uploadFilter.accept(bytes, uploadFilter.getFilterConfig()));
    }

    @Test
    public void testAllowsJavaSerializedFileUpload() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=ACED,offset=0,maxSize=250bytes");
        GlobalFileUploadFilter uploadFilter = GlobalFileUploadFilter.newFileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertTrue(uploadFilter.accept(bytes, uploadFilter.getFilterConfig()));
    }

    @Test
    public void testAllowsTarFileUploadButBlocksJarFileWithSizeRestriction() throws IOException {
        System.setProperty("hawtio.upload.filter",
            "signature=7573746172,offset=257,maxSize=10kb-signature=504B0304,offset=0,maxSize=1kb");

        GlobalFileUploadFilter uploadFilter = GlobalFileUploadFilter.newFileUploadFilter();

        File jarFile = new File("src/test/resources/data/jar-file-1.0.jar");
        assertNotNull(jarFile);
        FileInputStream jarInputStream = new FileInputStream(jarFile);
        byte[] jarBytes = IOUtils.toByteArray(jarInputStream);
        assertFalse(uploadFilter.accept(jarBytes, uploadFilter.getFilterConfig()));
        jarInputStream.close();

        File tarFile = new File("src/test/resources/data/test.tar");
        assertNotNull(jarFile);

        FileInputStream tarInputStream = new FileInputStream(tarFile);
        byte[] tarBytes = IOUtils.toByteArray(tarInputStream);
        assertTrue(uploadFilter.accept(tarBytes, uploadFilter.getFilterConfig()));
        tarInputStream.close();
    }

    @Test
    public void testAllowsJavaSerializedFileExceedsFileSizeUpload() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=ACED,offset=0,maxSize=100bytes");
        GlobalFileUploadFilter uploadFilter = GlobalFileUploadFilter.newFileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertFalse(uploadFilter.accept(bytes, uploadFilter.getFilterConfig()));
    }

    @Test
    public void testGetsFileSize() throws IOException {
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertEquals("134 bytes", FileUtils.byteCountToDisplaySize(bytes.length));
    }

    @Test
    public void testMaxFileSize() {
        String configs = "signature=7573746172,offset=257,maxSize=10kb-signature=504B0304,offset=0,maxSize=1kb-" +
            "signature=504B0304,offset=0,maxSize=25mb";
        List<GlobalFileUploadFilter.MagicNumberFileFilter> filters =
            GlobalFileUploadFilter.constructFilters(configs, new ArrayList<>());
        long max = GlobalFileUploadFilter.getMaxFileSizeAllowed(filters);
        assertEquals(26214400L, max);
    }

    @Test
    public void testExceptions() {
        String configs = "signature=7573746172,offset=257,maxSize=10kb,exc=[` ^ ...]-signature=504B0304,offset=0,maxSize=1kb-" +
            "signature=504B0304,offset=0,maxSize=25mb,exc=[@ ? %]";
        List<String> _1expected = new ArrayList<>(Arrays.asList("@", "?", "%"));
        List<String> _2expected = new ArrayList<>(Arrays.asList("`", "^", "..."));
        List<GlobalFileUploadFilter.MagicNumberFileFilter> filters =
            GlobalFileUploadFilter.constructFilters(configs, new ArrayList<>());
        for (GlobalFileUploadFilter.MagicNumberFileFilter filter: filters) {
            if (filter.getMaxSize().equals("25mb")) {
                for (String s: filter.getExceptions()) {
                    _1expected.contains(s);
                }
            }

            if (filter.getMaxSize().equals("10kb")) {
                for (String s: filter.getExceptions()) {
                    _2expected.contains(s);
                }
            }
        }

    }

    @Test
    public void testTreanslateFileSize() {

        long byteSize = GlobalFileUploadFilter.translateFileSize("100 Bytes");
        assertEquals(100L, byteSize);

        long byteSize_1 = GlobalFileUploadFilter.translateFileSize("Bytes");
        assertEquals(0L, byteSize_1);

        long kiloByteSize = GlobalFileUploadFilter.translateFileSize("97 KB");
        assertEquals(99328L, kiloByteSize);

        long megaByteSize = GlobalFileUploadFilter.translateFileSize("25 mb");
        assertEquals(26214400L, megaByteSize);

        long gigaByteSize = GlobalFileUploadFilter.translateFileSize("14 GB");
        assertEquals(15032385536L, gigaByteSize);
    }

    @Test
    public void testInspectGoodZipEntryPasses() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=504B0304,offset=0,maxSize=1kb");
        File goodZip = new File("src/test/resources/data/goodcontent.zip");
        FileInputStream jarInputStream = new FileInputStream(goodZip);
        byte[] goodZipBytes = IOUtils.toByteArray(jarInputStream);
        GlobalFileUploadFilter filter = GlobalFileUploadFilter.newFileUploadFilter();
        boolean b = GlobalFileUploadFilter.accept(goodZipBytes, filter.getFilterConfig());
        assertTrue(b);
    }

    @Test
    public void testInspectBadZipEntryFails() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=504B0304,offset=0,maxSize=200kb");
        File goodZip = new File("src/test/resources/data/badcontent.zip");
        FileInputStream jarInputStream = new FileInputStream(goodZip);
        byte[] goodZipBytes = IOUtils.toByteArray(jarInputStream);
        GlobalFileUploadFilter filter = GlobalFileUploadFilter.newFileUploadFilter();
        boolean b = GlobalFileUploadFilter.accept(goodZipBytes, filter.getFilterConfig());
        assertFalse(b);
    }

    @Test
    public void testInspectExceptions() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=504B0304,offset=0,maxSize=200kb,exc=[@ [ ]]");
        File zipContainsException = new File("src/test/resources/data/exception.zip");
        FileInputStream zipInputStream = new FileInputStream(zipContainsException);
        byte[] goodZipBytes = IOUtils.toByteArray(zipInputStream);
        GlobalFileUploadFilter filter = GlobalFileUploadFilter.newFileUploadFilter();
        boolean b = GlobalFileUploadFilter.accept(goodZipBytes, filter.getFilterConfig());
        assertTrue(b);
    }

    @Test
    public void testConfiguredZipContent() throws IOException {
        System.setProperty("hawtio.upload.filter", "signature=504B0304,offset=0,maxSize=200kb-signature=CAFEBABE,offset=0,maxSize=550bytes");
        File zipContainAllowed = new File("src/test/resources/data/allowedContent.zip");
        FileInputStream zipInputStream = new FileInputStream(zipContainAllowed);
        byte[] zipBytes = IOUtils.toByteArray(zipInputStream);
        GlobalFileUploadFilter filter = GlobalFileUploadFilter.newFileUploadFilter();
        boolean b = GlobalFileUploadFilter.accept(zipBytes, filter.getFilterConfig());
        assertTrue(b);
    }

    @Test
    public void testExceptionsOnly() {
        System.setProperty("hawtio.upload.filter", "exc=[@ [ ]]");
        String fileContent = "@{toJson(result.server.name)} result.results['contexts'].results}";
        GlobalFileUploadFilter filter = GlobalFileUploadFilter.newFileUploadFilter();
        boolean result = GlobalFileUploadFilter.accept(fileContent.getBytes(), filter.getFilterConfig());
        assertTrue(result);
    }

    @Test
    public void testBlocksZipUploadNonConfiguredItemAndGenericBinaryItem() throws IOException {
        File zipContainNotAllowed = new File("src/test/resources/data/allowedContent.zip");
        System.setProperty("hawtio.upload.filter", "signature=504B0304,offset=0,maxSize=10mb,exc=[@ [ ] # * / & % ? ; $]");
        byte[] zipContainNotAllowedBytes = IOUtils.toByteArray(new FileInputStream(zipContainNotAllowed));
        List<GlobalFileUploadFilter.MagicNumberFileFilter> filters =
            GlobalFileUploadFilter.constructFilters(System.getProperty("hawtio.upload.filter"), new ArrayList<>());
        boolean result = GlobalFileUploadFilter.accept(zipContainNotAllowedBytes, filters);
        assertFalse(result);

    }

//    @Test
//    public void testBlocksZipUploadNonConfiguredItemAndAsciiBinaryItem() throws IOException {
//
//    }

    @Test
    public void testAsciiContent_1() throws IOException {
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        byte[] buffer = new byte[512];
        boolean isAscii = true;
        int len;
        ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
        while ((len = inputStream.read(buffer, 0, buffer.length)) != -1) {
            if (isAscii) {
                isAscii = GlobalFileUploadFilter.isAsciiFile(buffer, len);
            }
        }

        assertFalse(isAscii);
    }

    @Test
    public void testAsciiContent_2() throws IOException {
        File zipContainAscii = new File("src/test/resources/data/allowedContent.zip");
        int len;
        byte[] buffer = new byte[512];
        boolean isAscii = true;
        ZipInputStream stream = new ZipInputStream(new FileInputStream(zipContainAscii));
        while ((stream.getNextEntry()) != null) {
            while ((len = stream.read(buffer, 0, buffer.length)) != -1) {
                if (isAscii) {
                    isAscii = GlobalFileUploadFilter.isAsciiFile(buffer, len);
                }
            }
        }

        assertFalse(isAscii);
    }

    @Test
    public void testAsciiContent_3() throws IOException {
        File zipContainAscii = new File("src/test/resources/data/badcontent.zip");
        int len;
        byte[] buffer = new byte[512];
        boolean isAscii = true;
        ZipInputStream stream = new ZipInputStream(new FileInputStream(zipContainAscii));
        while ((stream.getNextEntry()) != null) {
            while ((len = stream.read(buffer, 0, buffer.length)) != -1) {
                if (isAscii) {
                    isAscii = GlobalFileUploadFilter.isAsciiFile(buffer, len);
                }
            }
        }

        assertTrue(isAscii);
    }

    private byte[] serialize(Object object) throws IOException {
        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        ObjectOutputStream out = new ObjectOutputStream(bout);
        out.writeObject(object);
        out.flush();
        return bout.toByteArray();
    }
}
