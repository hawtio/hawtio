package io.hawt.jvm.local;

import com.sun.tools.attach.VirtualMachineDescriptor;

public class VMDescriptorDTO {

    private final VirtualMachineDescriptor descriptor;
    private String alias;
    private String agentUrl;
    private int port;
    private String hostname;
    private String scheme;
    private String path;

    public VMDescriptorDTO(VirtualMachineDescriptor descriptor) {
        this.descriptor = descriptor;
    }

    public String getId() {
        return descriptor.id();
    }

    public void setAlias(String alias) {
        this.alias = alias;
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

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getScheme() {
        return scheme;
    }

    public void setScheme(String scheme) {
        this.scheme = scheme;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
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
