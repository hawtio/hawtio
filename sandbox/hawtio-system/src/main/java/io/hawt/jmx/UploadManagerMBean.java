package io.hawt.jmx;

import java.util.List;

/**
 *
 */
public interface UploadManagerMBean {

    String getUploadDirectory();

    List<FileDTO> list(String parent);

    boolean delete(String parent, String filename);

}
