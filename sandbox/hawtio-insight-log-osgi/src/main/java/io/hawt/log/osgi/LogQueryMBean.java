package io.hawt.log.osgi;

import io.hawt.log.support.LogQuerySupportMBean;

/**
 * An MBean for querying log events which has a serialized API and a simple JSON API to avoid serialization issues
 */
public interface LogQueryMBean extends LogQuerySupportMBean {

    String getBundleMavenCoordinates(long bundleId);
}
