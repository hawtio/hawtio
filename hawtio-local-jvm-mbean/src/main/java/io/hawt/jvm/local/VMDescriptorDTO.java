package io.hawt.jvm.local;

import com.sun.tools.attach.VirtualMachineDescriptor;

/**
 * @author Stan Lewis
 */
public class VMDescriptorDTO {

    private VirtualMachineDescriptor descriptor;
    private String alias;
    private String agentUrl;

    public VMDescriptorDTO(VirtualMachineDescriptor descriptor) {
        this.descriptor = descriptor;
        this.alias = JVMList.getVmAlias(descriptor.displayName());
    }

    public String getId() {
        return descriptor.id();
    }

    public String getAlias() {
        return alias;
    }

    public String getDisplayName() {
        return descriptor.displayName();
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
