package io.hawt.util;

import io.hawt.util.Files;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;

import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import static org.mockito.Matchers.isA;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.when;
import static org.powermock.api.mockito.PowerMockito.whenNew;

@RunWith(PowerMockRunner.class)
public class FilesTest {

  @Rule public ExpectedException thrown = ExpectedException.none();
  
  @Test
  public void testCopyFileNotFoundException() throws IOException {
    final File source = mock(File.class);
    final File target = mock(File.class);

    when(source.getAbsolutePath()).thenReturn("/tmp/source");
    when(source.exists()).thenReturn(false);

    thrown.expect(FileNotFoundException.class);
    Files.copy(source, target);
    // Method is not expected to return due to exception thrown
  }

  @Test
  public void testCopyIOException() throws IOException {
    final File source = mock(File.class);
    final File target = mock(File.class);
    final File targetParent = mock(File.class);

    when(source.exists()).thenReturn(true);
    when(target.exists()).thenReturn(false);

    when(targetParent.getAbsolutePath()).thenReturn("/tmp/targetParent");
    when(targetParent.exists()).thenReturn(false);
    when(targetParent.mkdirs()).thenReturn(false);
    when(target.getParentFile()).thenReturn(targetParent);

    thrown.expect(IOException.class);
    Files.copy(source, target);
    // Method is not expected to return due to exception thrown
  }

  @PrepareForTest({IOHelper.class, Files.class})
  @Test
  public void testCopy() throws Exception {
    final File source = mock(File.class);
    final File target = mock(File.class);
    final File targetParent = mock(File.class);
    final FileInputStream is = mock(FileInputStream.class);
    final FileOutputStream os = mock(FileOutputStream.class);
    mockStatic(IOHelper.class);
    when(source.exists()).thenReturn(true);
    when(target.getParentFile()).thenReturn(targetParent);
    whenNew(FileInputStream.class).withParameterTypes(File.class).withArguments(isA(File.class)).thenReturn(is);
    whenNew(FileOutputStream.class).withParameterTypes(File.class).withArguments(isA(File.class)).thenReturn(os);

    // If target exists, but its parent does not exist, then directories are not successfully created
    when(target.exists()).thenReturn(true);
    when(targetParent.exists()).thenReturn(false);
    when(targetParent.mkdirs()).thenReturn(false);
    Files.copy(source, target);
    // Method returns void, testing that no exception is thrown

    // If target does not exist and parent does not exist, then directories are successfully created 
    when(target.exists()).thenReturn(false);
    when(targetParent.mkdirs()).thenReturn(true);
    Files.copy(source, target);
    // Method returns void, testing that no exception is thrown
    
    // If target does not exist and parent exists, then directories are successfully created
    when(targetParent.exists()).thenReturn(true);
    Files.copy(source, target);
    // Method returns void, testing that no exception is thrown
  }

  @Test
  public void testRecursiveDelete() {
    final File root = mock(File.class);
    final File dir1 = mock(File.class);
    final File dir1File1 = mock(File.class);
    final File dir1File2 = mock(File.class);
    final File dir2 = mock(File.class);

    // A single root file that cannot be deleted
    when(root.isDirectory()).thenReturn(false);
    when(root.delete()).thenReturn(false);
    Assert.assertEquals(0, Files.recursiveDelete(root));

    // A single root file that can be deleted
    when(root.delete()).thenReturn(true);
    Assert.assertEquals(1, Files.recursiveDelete(root));

    // A single empty root directory that can be deleted
    when(root.isDirectory()).thenReturn(true);
    when(root.listFiles()).thenReturn(null);
    Assert.assertEquals(1, Files.recursiveDelete(root));

    // A root directory containing a single file and a sub-dir with 2 files that can be deleted
    when(dir1.delete()).thenReturn(true);
    when(dir1File1.delete()).thenReturn(true);
    when(dir1File2.delete()).thenReturn(true);
    when(dir2.delete()).thenReturn(true);
    when(dir1.isDirectory()).thenReturn(true);
    when(dir1File1.isDirectory()).thenReturn(false);
    when(dir1File2.isDirectory()).thenReturn(false);
    when(dir2.isDirectory()).thenReturn(false);
    when(dir1.listFiles()).thenReturn(new File[] {dir1File1, dir1File2});
    when(root.listFiles()).thenReturn(new File[] {dir1, dir2});
    Assert.assertEquals(5, Files.recursiveDelete(root));
  }

  @Test
  public void testGetRelativePath() throws IOException {
    final File rootDir = mock(File.class);
    final File file = mock(File.class);
 
    // The canonical path of the file does not contain the root directory
    when(rootDir.getCanonicalPath()).thenReturn("/root");
    when(file.getCanonicalPath()).thenReturn("/tmp/file");
    Assert.assertEquals("/tmp/file", Files.getRelativePath(rootDir, file));

    // The canonical path of the file contains the root directory
    when(file.getCanonicalPath()).thenReturn("/root/tmp/file");
    Assert.assertEquals("/tmp/file", Files.getRelativePath(rootDir, file));   
  }

  @Test
  public void testReadBytesException() throws IOException {
    thrown.expect(FileNotFoundException.class);
    Files.readBytes(null);
    // Method is not expected to return due to exception thrown
  }

  @PrepareForTest({Files.class})
  @Test
  public void testReadBytes() throws FileNotFoundException, IOException, Exception {
    final byte[] input = "Hello, World!".getBytes();
    final File file = mock(File.class);
    final FileInputStream fis = mock(FileInputStream.class);
    final ByteArrayOutputStream bos = mock(ByteArrayOutputStream.class);

    whenNew(FileInputStream.class).withParameterTypes(File.class).withArguments(isA(File.class)).thenReturn(fis);
    whenNew(ByteArrayOutputStream.class).withNoArguments().thenReturn(bos);

    when(fis.read(isA(byte[].class))).thenReturn(input.length).thenReturn(0);
    when(bos.toByteArray()).thenReturn(input);
    Assert.assertEquals(new String(input), new String(Files.readBytes(file)));
  }

  @PrepareForTest({Files.class, java.nio.file.Files.class})
  @Test
  public void testGetMimeTypeException() throws IOException {
    final File file = mock(File.class);
    mockStatic(java.nio.file.Files.class);

    // probeContentType throws an exception
    when(file.toPath()).thenReturn(Paths.get("/tmp/file"));
    when(file.isDirectory()).thenReturn(false);
    when(file.getName()).thenReturn("file");
    when(java.nio.file.Files.probeContentType(isA(Path.class))).thenThrow(new IOException());
    Assert.assertEquals("text/plain", Files.getMimeType(file));
  }

  @PrepareForTest({Files.class, java.nio.file.Files.class})
  @Test
  public void testGetMimeType() throws IOException {
    final File file = mock(File.class);
    mockStatic(java.nio.file.Files.class);

    // probeContentType can successfully determine the mime type of the file.
    when(file.toPath()).thenReturn(Paths.get("/tmp/file"));
    when(java.nio.file.Files.probeContentType(isA(Path.class))).thenReturn("application/octet-stream");
    Assert.assertEquals("application/octet-stream", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the directory
    when(java.nio.file.Files.probeContentType(isA(Path.class))).thenReturn("   ");
    when(file.isDirectory()).thenReturn(true);
    Assert.assertEquals("application/zip", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .xml
    when(file.isDirectory()).thenReturn(false);
    when(file.getName()).thenReturn("file.xml");
    Assert.assertEquals("application/xml", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .wadl
    when(file.getName()).thenReturn("file.wadl");
    Assert.assertEquals("application/wadl+xml", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .wsdl
    when(file.getName()).thenReturn("file.wsdl");
    Assert.assertEquals("application/wsdl+xml", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .xsd
    when(file.getName()).thenReturn("file.xsd");
    Assert.assertEquals("application/xsd+xml", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .json
    when(file.getName()).thenReturn("file.json");
    Assert.assertEquals("application/json", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .html
    when(file.getName()).thenReturn("file.html");
    Assert.assertEquals("application/html", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .html
    when(file.getName()).thenReturn("file.htm");
    Assert.assertEquals("application/html", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .properties
    when(file.getName()).thenReturn("file.properties");
    Assert.assertEquals("text/x-java-properties", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .jpg
    when(file.getName()).thenReturn("file.jpg");
    Assert.assertEquals("image/jpeg", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .jpeh
    when(file.getName()).thenReturn("file.jpeg");
    Assert.assertEquals("image/jpeg", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .png
    when(file.getName()).thenReturn("file.png");
    Assert.assertEquals("image/png", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .gif
    when(file.getName()).thenReturn("file.gif");
    Assert.assertEquals("image/gif", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .svg
    when(file.getName()).thenReturn("file.svg");
    Assert.assertEquals("image/svg+xml", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and the file extension is .txt
    when(file.getName()).thenReturn("file.txt");
    Assert.assertEquals("text/plain", Files.getMimeType(file));

    // probeContentType returns an empty mime type from the file and name does not match the above
    when(file.getName()).thenReturn("");
    Assert.assertEquals("text/plain", Files.getMimeType(file));
  }

  @Test
  public void testAssertExists() {
    final File file = mock(File.class);

    // The file exists
    when(file.exists()).thenReturn(true);
    Files.assertExists(file);
    // Method returns void, testing that no exception is thrown

    // The file does not exist
    when(file.exists()).thenReturn(false);
    thrown.expect(IllegalArgumentException.class);
    Files.assertExists(file);
    // Method is not expected to return due to exception thrown
  }

  @Test
  public void testAssertFileExists() {
    final File file = mock(File.class);
    when(file.exists()).thenReturn(true);

    // The file is a file 
    when(file.isFile()).thenReturn(true);
    Files.assertFileExists(file);
    // Method returns void, testing that no exception is thrown

    // The file is not a file 
    when(file.isFile()).thenReturn(false);
    thrown.expect(IllegalArgumentException.class);
    Files.assertFileExists(file);
    // Method is not expected to return due to exception thrown
  }

  @Test
  public void assertDirectoryExists() {
    final File file = mock(File.class);
    when(file.exists()).thenReturn(true);

    // The directory is a directory
    when(file.isDirectory()).thenReturn(true);
    Files.assertDirectoryExists(file);
    // Method returns void, testing that no exception is thrown

    // The directory is not a directory
    when(file.isDirectory()).thenReturn(false);
    thrown.expect(IllegalArgumentException.class);
    Files.assertDirectoryExists(file);
    // Method is not expected to return due to exception thrown
  }
}
