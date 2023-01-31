package io.hawt.jvm.local;

import java.util.List;

public interface JVMListMBean {

    List<VMDescriptorDTO> listLocalJVMs();

    void startAgent(String PID);

    String agentStatus(String PID);

    String agentVersion(String PID);

    void stopAgent(String PID);

}
