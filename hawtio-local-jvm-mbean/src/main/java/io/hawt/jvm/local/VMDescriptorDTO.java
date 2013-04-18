package io.hawt.jvm.local;

import org.jolokia.jvmagent.client.util.ProcessDescription;

/**
 * @author Stan Lewis
 */
public class VMDescriptorDTO {

    private ProcessDescription descriptor;
    private String alias;

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

    @Override
    public String toString() {
        return getId() + " : " + getAlias() + " (" + getDisplayName() + ")";
    }


}
