package io.hawt.jvm.local;

import org.jolokia.jvmagent.client.util.ProcessDescription;

/**
 * @author Stan Lewis
 */
public class VMDescriptorDTO {

    private ProcessDescription descriptor;
    private String alias;
    private String agentUrl;

    public VMDescriptorDTO(ProcessDescription descriptor) {
        this.descriptor = descriptor;
        this.alias = JVMList.getVmAlias(descriptor.getDisplay());
    }

    public String getId() {
        return descriptor.getId();
    }

    public String getAlias() {
        return alias;
    }

    public String getDisplayName() {
        return descriptor.getDisplay();
    }

    public String getAgentUrl() {
        return agentUrl;
    }

    public void setAgentUrl(String url) {
        this.agentUrl = url;
    }

    @Override
    public String toString() {
        String agentEnabled = "*";
        if (getAgentUrl() == null) {
            agentEnabled = " ";
        }
        return getId() + " : [" + agentEnabled + "] " + getAlias() + " (" + getDisplayName() + ")";
    }


}
