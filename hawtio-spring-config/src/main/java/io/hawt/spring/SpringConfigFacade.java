package io.hawt.spring;

import io.hawt.config.ConfigFacade;
import io.hawt.git.GitFacade;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import java.io.File;
import java.util.Arrays;

/**
 *
 */
public class SpringConfigFacade extends MBeanSupport implements SpringConfigFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(SpringConfigFacade.class);

    // allows a set of wildcards to find camel files in the hawtio configuration git repo
    private String[] wildcards = {"/spring/**.xml"};
    private FileSystemXmlApplicationContext fileApplicationContext;
    private String[] locations;
    private String configDirName;
    private GitFacade gitFacade;

    /**
     * Returns the git based configuration directory used by the git & wiki plugins
     */
    public File getSpringConfigDirectory() {
        GitFacade git = getGitFacade();
        if (git != null) {
            return git.getConfigDirectory();
        }
        if (Strings.isNotBlank(configDirName)) {
            return new File(configDirName);
        }
        LOG.warn("Not injected with either the configDirName or gitFacade properties so lets use the default 'hawtio-config' directory for the configurations");
        return new File("hawtio-config");
    }

    public void init() throws Exception {
        super.init();

        int size = wildcards.length;
        locations = new String[size];
        String filePrefix = "file://" + getSpringConfigDirectory().getAbsolutePath();
        while (filePrefix.endsWith("/")) {
            filePrefix = filePrefix.substring(0, filePrefix.length());
        }
        for (int i = 0; i < size; i++) {
            String wildcard = wildcards[i];
            String separator = wildcard.startsWith("/") ? "" : "/";
            locations[i] = filePrefix + separator + wildcard;
        }
        LOG.info("Starting spring application contexts with locations " + Arrays.asList(locations));
        fileApplicationContext = new FileSystemXmlApplicationContext(locations, true);
        fileApplicationContext.start();
    }

    @Override
    public void destroy() throws Exception {
        if (fileApplicationContext != null) {
            fileApplicationContext.close();
        }
        super.destroy();
    }

    /**
     * Returns the location URIs passed into the Spring {@link FileSystemXmlApplicationContext} class
     */
    @Override
    public String[] getLocations() {
        return locations;
    }

    @Override
    public String[] getBeanDefinitionNames() {
        if (fileApplicationContext != null) {
            return fileApplicationContext.getBeanDefinitionNames();
        } else {
            return null;
        }
    }

    @Override
    public Integer getBeanDefinitionCount() {
        if (fileApplicationContext != null) {
            return fileApplicationContext.getBeanDefinitionCount();
        } else {
            return null;
        }
    }

    public String[] getWildcards() {
        return wildcards;
    }

    public void setWildcards(String[] wildcards) {
        this.wildcards = wildcards;
    }


    public String getConfigDirName() {
        return configDirName;
    }

    public void setConfigDirName(String configDirName) {
        this.configDirName = configDirName;
    }

    public GitFacade getGitFacade() {
        return gitFacade;
    }

    public void setGitFacade(GitFacade gitFacade) {
        this.gitFacade = gitFacade;
    }

    @Override
    protected String getDefaultObjectName() {
        return "io.hawt.spring:type=SpringConfigFacade";
    }

}