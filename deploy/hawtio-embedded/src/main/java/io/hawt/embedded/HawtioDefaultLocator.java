package io.hawt.embedded;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.Set;

public class HawtioDefaultLocator {

    private static final String WAR_FILENAME = "hawtio.war";
    private static final int KB = 1024;

    public static void setWar(Main main) {
        try {
            String virtualMachineClass = "com.sun.tools.attach.VirtualMachine";
            try {
                loadClass(virtualMachineClass, HawtioDefaultLocator.class.getClassLoader(), Thread.currentThread().getContextClassLoader());
            } catch (Exception e) {
                // let's try to find the tools.jar instead
                Set<String> paths = new HashSet<>();
                String javaHome = System.getProperty("java.home", ".");
                addPath(paths, javaHome);

                // now lets try the JAVA_HOME environment variable just in case
                javaHome = System.getenv("JAVA_HOME");
                if (javaHome != null && javaHome.length() > 0) {
                    addPath(paths, javaHome);
                }

                boolean found = false;
                for (String path : paths) {
                    File file = new File(path, "lib/tools.jar");
                    if (file.exists()) {
                        found = true;
                        String url = file.toURI().toURL().toString();
                        main.setExtraClassPath(url);
                        break;
                    }
                }
                if (!found) {
                    System.err.printf(
                        "Failed to load class %s and find tools.jar in directories %s. %s%n",
                        virtualMachineClass, paths, e);
                }
            }

            ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            URL resource = classLoader.getResource(WAR_FILENAME);
            if (resource == null) {
                System.err.printf("Could not find the %s on classpath!%n", WAR_FILENAME);
                System.exit(1);
            }
            File warFile = File.createTempFile("hawtio-", ".war");
            writeStreamTo(resource.openStream(), Files.newOutputStream(warFile.toPath()), 64 * KB);

            String warPath = warFile.getCanonicalPath();
            main.setWar(warPath);
        } catch (Exception e) {
            System.err.println("Failed to create hawtio: " + e.getMessage());
            e.printStackTrace();
        }
    }

    protected static void addPath(Set<String> paths, String path) {
        paths.add(path);
        String jreSuffix = File.separator + "jre";
        if (path.endsWith(jreSuffix)) {
            path = path.substring(0, path.length() - jreSuffix.length());
            paths.add(path);
        }
    }

    private static void loadClass(String name, ClassLoader... classLoaders) throws ClassNotFoundException {
        for (ClassLoader classLoader : classLoaders) {
            try {
                classLoader.loadClass(name);
                return;
            } catch (ClassNotFoundException e) {
                // ignore
            }
        }
        Class.forName(name);
    }

    public static void writeStreamTo(final InputStream input, final OutputStream output, int bufferSize) throws IOException {
        int available = Math.min(input.available(), 256 * KB);
        byte[] buffer = new byte[Math.max(bufferSize, available)];
        int count = input.read(buffer);
        while (count >= 0) {
            output.write(buffer, 0, count);
            count = input.read(buffer);
        }
    }
}
