package io.hawt.keystore;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.*;
import java.lang.management.ManagementFactory;
import java.security.Provider;
import java.security.Security;
import java.util.ArrayList;

/**
 * @author Hiram Chirino
 */
public class KeystoreService implements KeystoreServiceMBean {

    private static final transient Logger LOG = LoggerFactory.getLogger(KeystoreService.class);
    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private ObjectMapper mapper = new ObjectMapper();

    public void init() {
        try {

            if (objectName == null) {
                objectName = new ObjectName("hawtio:type=KeystoreService");
            }
            if (mBeanServer == null) {
                mBeanServer = ManagementFactory.getPlatformMBeanServer();
            }
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                LOG.info("Re-registering KeystoreService MBean");
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }

        } catch (Exception e) {
            LOG.warn("Exception during initialization: ", e);
            throw new RuntimeException(e);
        }
    }

    public void destroy() {
        try {
            if (objectName != null && mBeanServer != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception unregistering mbean: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public SecurityProviderDTO getSecurityProviderInfo() {
        ArrayList<String> supportedKeyStoreTypes = new ArrayList<String>();
        ArrayList<String> supportedKeyAlgorithms = new ArrayList<String>();
        for (Provider provider : Security.getProviders()) {
            for (Provider.Service service : provider.getServices()) {
                if( "KeyStore".equals(service.getType())) {
                    supportedKeyStoreTypes.add(service.getAlgorithm());
                } else if( "KeyPairGenerator".equals(service.getType())) {
                    supportedKeyAlgorithms.add(service.getAlgorithm());
                }
            }
        }

        SecurityProviderDTO result = new SecurityProviderDTO();
        result.supportedKeyStoreTypes = supportedKeyStoreTypes.toArray(new String[supportedKeyStoreTypes.size()]);
        result.supportedKeyAlgorithms = supportedKeyAlgorithms.toArray(new String[supportedKeyAlgorithms.size()]);
        return result;
    }

    @Override
    public String createKeyStoreViaJSON(String request) throws IOException {
        CreateKeyStoreRequestDTO r = mapper.readValue(request, CreateKeyStoreRequestDTO.class);
        return org.apache.commons.codec.binary.Base64.encodeBase64String(createKeyStore(r));
    }

    @SuppressWarnings("ResultOfMethodCallIgnored")
    @Override
    public byte[] createKeyStore(CreateKeyStoreRequestDTO request) throws IOException {

        File keystoreFile = File.createTempFile("keystore", ".jks");
        keystoreFile.delete();
        LOG.info("Generating ssl keystore...");

        String keytool = System.getProperty("java.home") + File.separator + "bin" + File.separator + "keytool";
        int rc;
        if( request.createPrivateKey ) {
            rc = system(keytool, "-genkey",
                    "-storetype", request.storeType,
                    "-storepass", request.storePassword,
                    "-keystore", keystoreFile.getCanonicalPath(),
                    "-keypass", request.keyPassword,
                    "-alias", request.keyCommonName,
                    "-keyalg", request.keyAlgorithm,
                    "-keysize", ""+request.keyLength,
                    "-dname", String.format("cn=%s", request.keyCommonName),
                    "-validity", ""+request.keyValidity);

        } else {

            rc = system(keytool, "-genkey",
                    "-storetype", request.storeType,
                    "-storepass", request.storePassword,
                    "-keystore", keystoreFile.getCanonicalPath(),
                    "-dname", "cn=temp",
                    "-keypass", "password",
                    "-alias", "temp");

            if(rc!=0) {
              throw new IOException("keytool failed with exit code: "+rc);
            }

            rc = system(keytool, "-delete",
                    "-storetype", request.storeType,
                    "-storepass", request.storePassword,
                    "-keystore", keystoreFile.getCanonicalPath(),
                    "-alias", "temp");

        }

        if(rc!=0) {
          throw new IOException("keytool failed with exit code: "+rc);
        }

        byte[] keystore = readBytes(keystoreFile);
        keystoreFile.delete();
        return keystore;
    }



    private int system(final String...args) {
        ProcessBuilder processBuilder = new ProcessBuilder(args);
        processBuilder.redirectErrorStream(true);

        // start the process
        final Process process;
        try {
            process = processBuilder.start();
        } catch (IOException e) {
            LOG.debug("Process failed to start: "+e, e);
            return -1;
        }

        new Thread("system command output processor") {
            @Override
            public void run() {
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                try {
                    while (true) {
                        String line = reader.readLine();
                        if (line == null) break;
                        LOG.info(String.format("%s: %s", args[0], line));
                        // System.out.println(String.format("%s: %s", args[0], line));
                    }
                } catch (IOException ignored) {
                } finally {
                    close(reader);
                }
            }

        }.start();

        // wait for command to exit
        try {
            return process.waitFor();
        } catch (InterruptedException e) {
            LOG.debug("Thread interrupted, killing process");
            process.destroy();
            Thread.currentThread().interrupt();
            return -1;
        }
    }

    private static void close(Closeable reader) {
        try {
            reader.close();
        } catch (Exception ignored) {
        }
    }

    private static byte[] readBytes(File file) throws IOException {
        FileInputStream fis = null;
        ByteArrayOutputStream bos = null;
        if (file == null) {
            throw new FileNotFoundException("No file specified");
        }
        try {
            fis = new FileInputStream(file);
            bos = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024*4];
            int remaining;
            while ((remaining = fis.read(buffer)) > 0) {
                bos.write(buffer, 0, remaining);
            }
            return bos.toByteArray();
        } finally {
            close(fis);
            close(bos);
        }
    }

}
