package io.hawt.springboot;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HawtPlugin {

    private String name;
    private String context;
    private String domain;
    private String scripts[];

    public HawtPlugin(String name, String context, String domain,
                      String[] scripts) {
        super();
        this.name = name;
        this.context = context;
        this.domain = domain;
        this.scripts = scripts;
    }

    @JsonProperty("Name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty("Context")
    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    @JsonProperty("Domain")
    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    @JsonProperty("Scripts")
    public String[] getScripts() {
        return scripts;
    }

    public void setScripts(String[] scripts) {
        this.scripts = scripts;
    }
}
