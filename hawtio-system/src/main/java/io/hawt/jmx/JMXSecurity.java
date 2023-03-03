package io.hawt.jmx;

import java.util.List;
import java.util.Map;

import javax.management.openmbean.CompositeData;
import javax.management.openmbean.CompositeDataSupport;
import javax.management.openmbean.TabularData;
import javax.management.openmbean.TabularDataSupport;

import io.hawt.util.MBeanSupport;

/**
 * Dummy version that implements JMXSecurityMBean that lets the current user
 * invoke anything
 */
public class JMXSecurity extends MBeanSupport implements JMXSecurityMBean {

    @Override
    public boolean canInvoke(String objectName) {
        return true;
    }

    @Override
    public boolean canInvoke(String objectName, String methodName) throws Exception {
        return true;
    }

    @Override
    public boolean canInvoke(String objectName, String methodName, String[] argumentTypes) throws Exception {
        return true;
    }

    @Override
    public TabularData canInvoke(Map<String, List<String>> bulkQuery) throws Exception {
        TabularData table = new TabularDataSupport(CAN_INVOKE_TABULAR_TYPE);

        for (Map.Entry<String, List<String>> entry : bulkQuery.entrySet()) {
            String objectName = entry.getKey();
            List<String> methods = entry.getValue();
            if (methods.size() == 0) {
                CompositeData data = new CompositeDataSupport(CAN_INVOKE_RESULT_ROW_TYPE,
                    CAN_INVOKE_RESULT_COLUMNS,
                    new Object[] { objectName, "", true });
                table.put(data);
            } else {
                for (String method : methods) {
                    CompositeData data = new CompositeDataSupport(CAN_INVOKE_RESULT_ROW_TYPE,
                        CAN_INVOKE_RESULT_COLUMNS,
                        new Object[] { objectName, method, true });
                    table.put(data);
                }
            }
        }

        return table;
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=security,area=jmx,name=HawtioDummyJMXSecurity";
    }
}
