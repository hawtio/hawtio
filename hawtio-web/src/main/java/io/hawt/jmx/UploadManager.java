package io.hawt.jmx;

import io.hawt.util.Strings;
import io.hawt.web.UploadServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Stan Lewis
 */
public class UploadManager implements UploadManagerMBean {

    private static final transient Logger LOG = LoggerFactory.getLogger(UploadManager.class);

    private ObjectName objectName;
    private MBeanServer mBeanServer;


    public void init() throws Exception {
        if (objectName == null) {
            objectName = getObjectName();
        }

        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }

        if (mBeanServer != null) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch(InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }
        }
    }

    public void destroy() throws Exception {
        if (mBeanServer != null) {
            if (objectName != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        }
    }

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("io.hawt.jmx:type=UploadManager");
    }

    @Override
    public String getUploadDirectory() {
        return UploadServlet.UPLOAD_DIRECTORY;
    }

    @Override
    public List<FileDTO> list(String parent) {
        File dir = new File(getTargetDirectory(parent));
        if (!dir.exists()) {
            return null;
        }

        List<FileDTO> rc = new ArrayList<FileDTO>();

        for (File file : dir.listFiles()) {
            if (!file.isDirectory()) {
                rc.add(new FileDTO(file));
            }
        }
        return rc;
    }

    private String getTargetDirectory(String parent) {
        parent = Strings.sanitizeDirectory(parent);
        if (Strings.isNotBlank(parent)) {
            return  UploadServlet.UPLOAD_DIRECTORY + File.separator + parent;
        }
        return UploadServlet.UPLOAD_DIRECTORY;
    }

    @Override
    public boolean delete(String parent, String filename) {
        filename = Strings.sanitize(filename);
        File targetFile = new File(getTargetDirectory(parent), filename);
        LOG.info("Deleting {}", targetFile);
        return targetFile.delete();
    }
}
