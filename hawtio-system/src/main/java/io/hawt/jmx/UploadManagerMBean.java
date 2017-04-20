package io.hawt.jmx;

import java.util.List;

/**
 * Upload manager MBean
 */
public interface UploadManagerMBean {

    String getUploadDirectory();

    List<FileDTO> list(String parent);

    boolean delete(String parent, String filename);

}
