package io.hawt.ide;

import io.hawt.util.IOHelper;
import io.hawt.util.MBeanSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

/**
 * A facade for working with IDEs
 */
public class IdeFacade extends MBeanSupport implements IdeFacadeMBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(IdeFacade.class);
    private static IdeFacade singleton;
    private File baseDir;

    public static IdeFacade getSingleton() {
        if (singleton == null) {
            LOG.warn("No IdeFacade constructed yet so using default configuration for now");
            singleton = new IdeFacade();
        }
        return singleton;
    }

    @Override
    public void init() throws Exception {
        IdeFacade.singleton = this;
        super.init();
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=IdeFacade";
    }

    /**
     * Returns the base directory of the current project
     */
    public File getBaseDir() {
        if (baseDir == null) {
            baseDir = new File(System.getProperty("basedir", "."));
        }
        return baseDir;
    }

    public void setBaseDir(File baseDir) {
        this.baseDir = baseDir;
    }

    /**
     * Given a class name and a file name, try to find the absolute file name of the
     * source file on the users machine or null if it cannot be found
     */
    @Override
    public String findClassAbsoluteFileName(String fileName, String className, List<String> sourceRoots) {
        // usually the fileName is just the name of the file without any package information
        // so lets turn the package name into a path
        int lastIdx = className.lastIndexOf('.');
        if (lastIdx > 0 && !(fileName.contains("/") || fileName.contains(File.separator))) {
            String packagePath = className.substring(0, lastIdx).replace('.', File.separatorChar);
            fileName = packagePath + File.separator + fileName;
        }
        File baseDir = getBaseDir();
        String answer = findInSourceFolders(baseDir, fileName);
        if (answer == null && sourceRoots != null) {
            for (String sourceRoot : sourceRoots) {
                answer = findInSourceFolders(new File(sourceRoot), fileName);
                if (answer != null) break;
            }
        }
        return answer;
    }

    /**
     * Searches in this directory and in the source directories in src/main/* and src/test/* for the given file name path
     *
     * @return the absolute file or null
     */
    protected String findInSourceFolders(File baseDir, String fileName) {
        String answer = findInFolder(baseDir, fileName);
        if (answer == null && baseDir.exists()) {
            answer = findInChildFolders(new File(baseDir, "src/main"), fileName);
            if (answer == null) {
                answer = findInChildFolders(new File(baseDir, "src/test"), fileName);
            }
        }
        return answer;
    }

    protected String findInChildFolders(File dir, String fileName) {
        String answer = findInFolder(dir, fileName);
        if (answer == null && isDirectory(dir)) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    answer = findInFolder(file, fileName);
                    if (answer != null) break;
                }
            }
        }
        return answer;
    }

    protected String findInFolder(File dir, String relativeName) {
        if (isDirectory(dir)) {
            File file =new File(dir, relativeName);
            if (file.exists() && file.isFile()) {
                return file.getAbsolutePath();
            }
        }
        return null;
    }

    private boolean isDirectory(File dir) {
        return dir.exists() && dir.isDirectory();
    }

    /**
     * Uses Intellij's XmlRPC mechanism to open and navigate to a file
     */
    @Override
    public String ideaOpenAndNavigate(String fileName, int line, int column) throws Exception {
        if (line < 0) line = 0;
        if (column < 0) column = 0;
        String xml = "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\n" +
                "<methodCall>\n" +
                "  <methodName>fileOpener.openAndNavigate</methodName>\n" +
                "  <params>\n" +
                "    <param><value><string>" + fileName + "</string></value></param>\n" +
                "    <param><value><int>" + line + "</int></value></param>\n" +
                "    <param><value><int>" + column + "</int></value></param>\n" +
                "  </params>\n" +
                "</methodCall>\n";

        return ideaXmlRpc(xml);
    }

    @Override
    public String ideaOpen(String fileName) throws Exception {
        String xml = "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\n" +
                "<methodCall>\n" +
                "  <methodName>fileOpener.open</methodName>\n" +
                "  <params>\n" +
                "    <param><value><string>" + fileName + "</string></value></param>\n" +
                "  </params>\n" +
                "</methodCall>\n";

        return ideaXmlRpc(xml);
    }

    protected String ideaXmlRpc(String xml) throws IOException {
        String charset = "UTF-8";

        HttpURLConnection connection = (HttpURLConnection) new URL("http://localhost:63342").openConnection();
        connection.setDoOutput(true);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("accept-charset", charset);
        connection.setRequestProperty("Content-Type", "text/xml");
        byte[] bytes = xml.getBytes();
        connection.setRequestProperty("Content-Length", String.valueOf(bytes.length));

        OutputStream os = null;
        OutputStreamWriter writer = null;
        try {
            os = connection.getOutputStream();
            os.write(bytes);
            return IOHelper.readFully(new BufferedReader(new InputStreamReader(connection.getInputStream())));
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException ignore) {
                }
            }
        }
    }

}