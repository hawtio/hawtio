package io.hawt.jmx;

import java.util.List;
import java.util.Map;

import javax.management.openmbean.CompositeType;
import javax.management.openmbean.OpenDataException;
import javax.management.openmbean.OpenType;
import javax.management.openmbean.SimpleType;
import javax.management.openmbean.TabularData;
import javax.management.openmbean.TabularType;

/**
 * Snagged from Apache Karaf 3.x
 * <p/>
 * Security MBean. This MBean can be used to find out whether the currently logged in user can access
 * certain MBeans or invoke operations on these MBeans. It can be used when building client-facing
 * consoles to ensure that only operations appropriate for the current user are presented.<p/>
 * This MBean does not actually invoke any operations on the given objects, it only checks permissions.
 */
public interface JMXSecurityMBean {
    /**
     * The Tabular Type returned by the {@link #canInvoke(Map)} operation. The rows consist of
     * {@link #CAN_INVOKE_RESULT_ROW_TYPE} entries.
     * It has a composite key with consists of the "ObjectName" and "Method" columns.
     */
    TabularType CAN_INVOKE_TABULAR_TYPE = SecurityMBeanOpenTypeInitializer.TABULAR_TYPE;

    /**
     * A row as returned by the {@link #CAN_INVOKE_TABULAR_TYPE}. The columns of the row are defined
     * by {@link #CAN_INVOKE_RESULT_COLUMNS}.
     */
    CompositeType CAN_INVOKE_RESULT_ROW_TYPE = SecurityMBeanOpenTypeInitializer.ROW_TYPE;

    /**
     * The columns contained in a {@link #CAN_INVOKE_RESULT_ROW_TYPE}. The data types for these columns are
     * as follows:
     * <ul>
     * <li>"ObjectName" : {@link SimpleType#STRING}</li>
     * <li>"Method" : {@link SimpleType#STRING}</li>
     * <li>"CanInvoke" : {@link SimpleType#BOOLEAN}</li>
     * </ul>
     */
    String[] CAN_INVOKE_RESULT_COLUMNS = SecurityMBeanOpenTypeInitializer.COLUMNS;

    /**
     * Checks whether the current user can invoke any methods on a JMX MBean.
     *
     * @param objectName The Object Name of the JMX MBean.
     * @return {@code true} if there is at least one method on the MBean that the
     * user can invoke.
     */
    boolean canInvoke(String objectName) throws Exception;

    /**
     * Checks whether the current user can invoke any overload of the given method.
     *
     * @param objectName The Object Name of the JMX MBean.
     * @param methodName The name of the method to check.
     * @return {@code true} if there is an overload of the specified method that the
     * user can invoke.
     */
    boolean canInvoke(String objectName, String methodName) throws Exception;

    /**
     * Checks whether the current user can invoke the given method.
     *
     * @param objectName    The Object Name of the JMX MBean.
     * @param methodName    The name of the method to check.
     * @param argumentTypes The argument types of to method.
     * @return {@code true} if the user is allowed to invoke the method, or any of the methods with
     * the given name if {@code null} is used for the arguments. There may still
     * be certain values that the user does not have permission to pass to the method.
     */
    boolean canInvoke(String objectName, String methodName, String[] argumentTypes) throws Exception;

    /**
     * Bulk operation to check whether the current user can access the requested MBeans or invoke the
     * requested methods.
     *
     * @param bulkQuery A map of Object Name to requested operations. Operations can be specified
     *                  with or without arguments types. An operation without arguments matches any overloaded method
     *                  with this name. If an empty list is provided for the operation names, a check is done whether the
     *                  current user can invoke <em>any</em> operation on the MBean.<p/>
     *                  Example:
     *                  <pre>{@code
     *                                   Map<String, List<String>> query = new HashMap<>();
     *                                   String objectName = "org.acme:type=SomeMBean";
     *                                   query.put(objectName, Arrays.asList(
     *                                       "testMethod(long,java.lang.String)", // check this testMethod
     *                                       "otherMethod"));                     // check any overload of otherMethod
     *                                   query.put("org.acme:type=SomeOtherMBean",
     *                                       Collections.<String>emptyList());    // check any method of SomeOtherMBean
     *                                   TabularData result = mb.canInvoke(query);
     *                                   }</pre>
     * @return A Tabular Data object with the result. This object conforms the structure as defined
     * in {@link #CAN_INVOKE_TABULAR_TYPE}.
     */
    TabularData canInvoke(Map<String, List<String>> bulkQuery) throws Exception;

    // A member class is used to initialize final fields, as this needs to do some exception handling...
    class SecurityMBeanOpenTypeInitializer {
        private static final String[] COLUMNS = new String[] { "ObjectName", "Method", "CanInvoke" };
        private static final CompositeType ROW_TYPE;

        static {
            try {
                ROW_TYPE = new CompositeType("CanInvokeRowType",
                    "The rows of a CanInvokeTabularType table.",
                    COLUMNS,
                    new String[] {
                        "The ObjectName of the MBean checked",
                        "The Method to checked. This can either be a bare method name which means 'any method with this name' " +
                            "or a specific overload such as foo(java.lang.String). If an empty String is returned this means 'any' method.",
                        "true if the method or mbean can potentially be invoked by the current user." },
                    new OpenType[] { SimpleType.STRING, SimpleType.STRING, SimpleType.BOOLEAN }
                );
            } catch (OpenDataException e) {
                throw new RuntimeException(e);
            }
        }

        private static final TabularType TABULAR_TYPE;

        static {
            try {
                TABULAR_TYPE = new TabularType("CanInvokeTabularType", "Result of canInvoke() bulk operation", ROW_TYPE,
                    new String[] { "ObjectName", "Method" });
            } catch (OpenDataException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
