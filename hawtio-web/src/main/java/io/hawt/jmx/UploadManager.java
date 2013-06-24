package io.hawt.jmx;

import io.hawt.web.UploadServlet;

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
        String uploadDir = UploadServlet.UPLOAD_DIRECTORY;

        if (parent != null && !parent.equals("")) {
            uploadDir = uploadDir + File.separator + parent;
        }

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            return null;
        }

        List<FileDTO> rc = new ArrayList<FileDTO>();

        for (File file : dir.listFiles()) {
            rc.add(new FileDTO(file));
        }
        return rc;

    }
}
