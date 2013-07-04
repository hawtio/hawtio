package io.hawt.jmx;

import java.util.List;

/**
 * @author Stan Lewis
 */
public interface UploadManagerMBean {

    String getUploadDirectory();

    List<FileDTO> list(String parent);

    boolean delete(String parent, String filename);

}
