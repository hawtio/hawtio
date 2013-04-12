package io.hawt.jsonschema.mixins;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hawt.jsonschema.SchemaLookup;
import io.hawt.jsonschema.api.MixInAnnotation;
import org.fusesource.fabric.api.CreateContainerChildOptions;

import java.net.URI;

/**
 * @author Stan Lewis
 */
public class CreateContainerChildMixinOverrides {

    public CreateContainerChildMixinOverrides() {
        SchemaLookup.getSingleton().registerMixIn(new MixInAnnotation() {

            @Override
            public Class getMixinSource() {
                return CreateContainerChildMixin.class;
            }

            @Override
            public Class getTarget() {
                return CreateContainerChildOptions.class;
            }
        });
    }
}

class CreateContainerChildMixin {

    @JsonIgnore
    protected boolean ensembleServer;
    @JsonIgnore
    protected String preferredAddress;
    @JsonIgnore
    protected String resolver = null;
    @JsonIgnore
    protected URI proxyUri;
    @JsonIgnore
    protected boolean adminAccess = false;


    @JsonIgnore
    public boolean isAdminAccess() {
        return adminAccess;
    }

    @JsonIgnore
    public void setAdminAccess(boolean adminAccess) {
        this.adminAccess = adminAccess;
    }

    @JsonIgnore
    public boolean isEnsembleServer() {
        return ensembleServer;
    }

    @JsonIgnore
    public void setEnsembleServer(boolean ensembleServer) {
        this.ensembleServer = ensembleServer;
    }

    @JsonIgnore
    public String getPreferredAddress() {
        return preferredAddress;
    }

    @JsonIgnore
    public void setPreferredAddress(String preferredAddress) {
        this.preferredAddress = preferredAddress;
    }

    @JsonIgnore
    public String getResolver() {
        return resolver;
    }

    @JsonIgnore
    public void setResolver(String resolver) {
        this.resolver = resolver;
    }

    @JsonIgnore
    public URI getProxyUri() {
        return proxyUri;
    }

    @JsonIgnore
    public void setProxyUri(URI proxyUri) {
        this.proxyUri = proxyUri;
    }

}
