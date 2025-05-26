package io.hawt.v1.hawtiospec.config;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"consoleLink","projectSelector"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Online implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The configuration for the OpenShift Web console link.
     * A link is added to the application menu when the Hawtio deployment is equal to 'cluster'.
     * Otherwise, a link is added to the Hawtio project dashboard.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("consoleLink")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The configuration for the OpenShift Web console link.\nA link is added to the application menu when the Hawtio deployment is equal to 'cluster'.\nOtherwise, a link is added to the Hawtio project dashboard.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v1.hawtiospec.config.online.ConsoleLink consoleLink;

    public io.hawt.v1.hawtiospec.config.online.ConsoleLink getConsoleLink() {
        return consoleLink;
    }

    public void setConsoleLink(io.hawt.v1.hawtiospec.config.online.ConsoleLink consoleLink) {
        this.consoleLink = consoleLink;
    }

    /**
     * The selector used to watch for projects.
     * It is only applicable when the Hawtio deployment type is equal to 'cluster'.
     * By default, all the projects the logged in user has access to are watched.
     * The string representation of the selector must be provided, as mandated by the `--selector`, or `-l`, options from the `kubectl get` command.
     * See https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
     */
    @com.fasterxml.jackson.annotation.JsonProperty("projectSelector")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The selector used to watch for projects.\nIt is only applicable when the Hawtio deployment type is equal to 'cluster'.\nBy default, all the projects the logged in user has access to are watched.\nThe string representation of the selector must be provided, as mandated by the `--selector`, or `-l`, options from the `kubectl get` command.\nSee https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String projectSelector;

    public String getProjectSelector() {
        return projectSelector;
    }

    public void setProjectSelector(String projectSelector) {
        this.projectSelector = projectSelector;
    }
}

