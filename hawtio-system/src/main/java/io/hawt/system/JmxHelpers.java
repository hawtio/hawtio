package io.hawt.system;

import javax.management.ObjectName;
import java.util.Set;

/**
 * Helpers for JMX
 */
public class JmxHelpers {

    public static ObjectName chooseMBean(Set<ObjectName> mbeans) {
        if (mbeans.size() == 1) {
            return mbeans.iterator().next();
        }
        for (ObjectName mbean : mbeans) {
            if (!isHawtioDummy(mbean.toString())) {
                return mbean;
            }
        }
        return null;
    }

    private static boolean isHawtioDummy(String name) {
        return name.contains("HawtioDummy");
    }
}
