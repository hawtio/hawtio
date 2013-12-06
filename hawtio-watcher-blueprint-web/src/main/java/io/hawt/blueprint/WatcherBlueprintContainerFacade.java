package io.hawt.blueprint;

import io.hawt.util.MBeanSupport;
import org.fusesource.common.util.Objects;
import org.fusesource.fabric.watcher.blueprint.web.WatcherBlueprintContainer;
import org.osgi.service.blueprint.container.BlueprintContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * A facade bean to provide a little JMX API to the {@link WatcherBlueprintContainer} as well as natural hawtio configuration for it
 */
public class WatcherBlueprintContainerFacade extends MBeanSupport implements WatcherBlueprintContainerFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(WatcherBlueprintContainerFacade.class);

    private WatcherBlueprintContainer watcher;

    @Override
    public void init() throws Exception {
        // force validation error
        watcher();
        super.init();
    }

    /**
     * Returns the watcher, throwing an exception if its not configured properly
     */
    public WatcherBlueprintContainer watcher() {
        Objects.notNull(watcher, "watcher");
        return watcher;
    }

    @Override
    public SortedSet<String> getContainerLocations() {
        Set<URL> urls = watcher.getContainerURLs();
        SortedSet<String> answer = new TreeSet<String>();
        for (URL url : urls) {
            answer.add(url.toString());
        }
        return answer;
    }

    @Override
    public Map<String, Set<String>> componentIdsMap() {
        Map<String, Set<String>> answer = new TreeMap<String, Set<String>>();
        Set<URL> urls = watcher.getContainerURLs();
        for (URL url : urls) {
            String key = url.toString();
            BlueprintContainer container = watcher.getContainer(url);
            if (container != null) {
                Set<String> componentIds = container.getComponentIds();
                if (componentIds != null) {
                    answer.put(key, componentIds);
                }
            }
        }
        return answer;
    }

    @Override
    public Integer getComponentCount() {
        int answer = 0;
        Set<URL> urls = watcher.getContainerURLs();
        for (URL url : urls) {
            String key = url.toString();
            BlueprintContainer container = watcher.getContainer(url);
            if (container != null) {
                Set<String> componentIds = container.getComponentIds();
                if (componentIds != null) {
                    answer += componentIds.size();
                }
            }
        }
        return answer;
    }

    // Properties
    //-------------------------------------------------------------------------

    public WatcherBlueprintContainer getWatcher() {
        return watcher;
    }

    public void setWatcher(WatcherBlueprintContainer watcher) {
        this.watcher = watcher;
    }

    // Implementation methods
    //-------------------------------------------------------------------------

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=WatcherFacade";
    }

}