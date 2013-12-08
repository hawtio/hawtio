package io.hawt.spring;

import io.hawt.util.MBeanSupport;
import org.fusesource.common.util.Objects;
import org.fusesource.fabric.watcher.spring.context.WatcherSpringContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import java.io.File;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeMap;

/**
 * A facade bean to provide a little JMX API to the {@link WatcherSpringContext} as well as natural hawtio configuration for it
 */
public class WatcherSpringContextFacade extends MBeanSupport implements WatcherSpringContextFacadeMXBean {

    private File rootPath;
    private WatcherSpringContext watcher;
    private boolean manuallyCreatedWatcher;

    @Override
    public void init() throws Exception {
        if (watcher == null) {
            if (rootPath != null) {
                rootPath.mkdirs();
            }
            watcher = new WatcherSpringContext();
            manuallyCreatedWatcher = true;
            watcher.setRootDirectory(rootPath);
            watcher.init();
        }
        super.init();
    }

    @Override
    public void destroy() throws Exception {
        if (manuallyCreatedWatcher && watcher != null) {
            watcher.destroy();
        }
        super.destroy();
    }

    /**
     * Returns the watcher, throwing an exception if its not configured properly
     */
    public WatcherSpringContext watcher() {
        Objects.notNull(watcher, "watcher");
        return watcher;
    }

    @Override
    public SortedSet<String> getLocations() {
        return watcher.getApplicationContextPaths();
    }

    @Override
    public Map<String, String[]> beanDefinitionNameMap() {
        Map<String, String[]> answer = new TreeMap<String, String[]>();
        SortedSet<String> paths = watcher.getApplicationContextPaths();
        for (String path : paths) {
            FileSystemXmlApplicationContext applicationContext = watcher.getApplicationContext(path);
            if (applicationContext != null) {
                String[] beanNames = applicationContext.getBeanDefinitionNames();
                if (beanNames != null) {
                    answer.put(path, beanNames);
                }
            }
        }
        return answer;
    }

    @Override
    public Integer getBeanDefinitionCount() {
        int answer = 0;
        SortedSet<String> paths = watcher.getApplicationContextPaths();
        for (String path : paths) {
            FileSystemXmlApplicationContext applicationContext = watcher.getApplicationContext(path);
            if (applicationContext != null) {
                String[] beanNames = applicationContext.getBeanDefinitionNames();
                if (beanNames != null) {
                    answer += beanNames.length;
                }
            }
        }
        return answer;
    }

    // Properties
    //-------------------------------------------------------------------------

    public File getRootPath() {
        return rootPath;
    }

    public void setRootPath(File rootPath) {
        this.rootPath = rootPath;
    }

    public WatcherSpringContext getWatcher() {
        return watcher;
    }

    public void setWatcher(WatcherSpringContext watcher) {
        this.watcher = watcher;
    }

    // Implementation methods
    //-------------------------------------------------------------------------

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=WatcherFacade";
    }

}