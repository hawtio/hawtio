package io.hawt.web;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.junit.Test;

import java.io.*;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;

public class FileUploadFilterTest {

    @Test
    public void testPreventsJavaSerializedFileUpload() throws IOException {
        System.setProperty("hawtio.config.fileUpload", "signature=D0CF11E0A1B11AE1,offset=2,maxSize=250kb");
        FileUploadFilter uploadFilter = new FileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertFalse(uploadFilter.accept(bytes));
    }

    @Test
    public void testAllowsJavaSerializedFileUpload() throws IOException {
        System.setProperty("hawtio.config.fileUpload", "signature=ACED,offset=0,maxSize=250bytes");
        FileUploadFilter uploadFilter = new FileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertTrue(uploadFilter.accept(bytes));
    }

    @Test
    public void testAllowsTarFileUploadButBlocksJarFileWithSizeRestriction() throws IOException {
        System.setProperty("hawtio.config.fileUpload",
            "signature=7573746172,offset=257,maxSize=10kb;signature=504B0304,offset=0,maxSize=1kb");

        FileUploadFilter uploadFilter = new FileUploadFilter();

        File jarFile = new File("src/test/resources/data/jar-file-1.0.jar");
        assertNotNull(jarFile);
        FileInputStream jarInputStream = new FileInputStream(jarFile);
        byte[] jarBytes = IOUtils.toByteArray(jarInputStream);
        assertFalse(uploadFilter.accept(jarBytes));
        jarInputStream.close();

        File tarFile = new File("src/test/resources/data/test.tar");
        assertNotNull(jarFile);

        FileInputStream tarInputStream = new FileInputStream(tarFile);
        byte[] tarBytes = IOUtils.toByteArray(tarInputStream);
        assertTrue(uploadFilter.accept(tarBytes));
        tarInputStream.close();
    }

    @Test
    public void testAllowsJavaSerializedFileExceedsFileSizeUpload() throws IOException {
        System.setProperty("hawtio.config.fileUpload", "signature=ACED,offset=0,maxSize=100bytes");
        FileUploadFilter uploadFilter = new FileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertFalse(uploadFilter.accept(bytes));
    }

    @Test
    public void testAllowsFileUploadWithoutFileUploadConfig() throws IOException {
        FileUploadFilter uploadFilter = new FileUploadFilter();
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        assertTrue(uploadFilter.accept(bytes));
    }

    @Test
    public void testGetsFileSize() throws IOException {
        UploadServlet uploadServlet = new UploadServlet();
        byte[] bytes = serialize(uploadServlet);
        long fileSize = bytes.length;
        System.out.println(fileSize);
        assertEquals("134 bytes", FileUtils.byteCountToDisplaySize(bytes.length));
        System.out.println(FileUtils.byteCountToDisplaySize(bytes.length));
    }

    @Test
    public void testTreanslateFileSize() {
        FileUploadFilter uploadFilter = new FileUploadFilter();
        long byteSize = uploadFilter.translateFileSize("100 Bytes");
        assertEquals(100L, byteSize);

        long byteSize_1 = uploadFilter.translateFileSize("Bytes");
        assertEquals(0L, byteSize_1);

        long kiloByteSize = uploadFilter.translateFileSize("97 KB");
        assertEquals(99328L, kiloByteSize);

        long megaByteSize = uploadFilter.translateFileSize("25 mb");
        assertEquals(26214400L, megaByteSize);

        long gigaByteSize = uploadFilter.translateFileSize("14 GB");
        assertEquals(15032385536L, gigaByteSize);

    }

    private byte[] serialize(Object object) throws IOException {
        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        ObjectOutputStream out = new ObjectOutputStream(bout);
        out.writeObject(object);
        out.flush();
        return bout.toByteArray();
    }
}
