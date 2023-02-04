package io.hawt.jvm.local;

import java.lang.management.ManagementFactory;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.ServerSocket;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import com.sun.tools.attach.VirtualMachine;
import com.sun.tools.attach.VirtualMachineDescriptor;
import org.jolokia.jvmagent.JvmAgent;
import org.jolokia.jvmagent.client.command.CommandDispatcher;
import org.jolokia.jvmagent.client.util.OptionsAndArgs;
import org.jolokia.jvmagent.client.util.PlatformUtils;
import org.jolokia.jvmagent.client.util.VirtualMachineHandlerOperations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JVMList implements JVMListMBean {

    private static final Logger LOG = LoggerFactory.getLogger(JVMList.class);

    private MBeanServer mBeanServer;
    private ObjectName objectName;

    protected static final Map<String, String> VM_ALIAS_MAP = new HashMap<>();
    protected static final Map<String, String> VM_ALIAS_OVERRIDE_MAP = new HashMap<>();

    static {
        VM_ALIAS_MAP.put("hawtio-app", "hawtio");

        VM_ALIAS_MAP.put("com.intellij.idea.Main", "IntelliJ IDEA");
        VM_ALIAS_MAP.put("com.intellij.rt.execution.application.AppMain", "IntelliJ IDEA");
        VM_ALIAS_MAP.put("org.jetbrains.idea.maven.server.RemoteMavenServer", "IntelliJ IDEA");
        VM_ALIAS_MAP.put("idea maven server", "IntelliJ IDEA");
        VM_ALIAS_MAP.put("IntelliJ IDEA", "IntelliJ IDEA");

        VM_ALIAS_MAP.put("org.apache.karaf.main.Main", "Apache Karaf");
        VM_ALIAS_MAP.put("activemq.jar start", "Apache ActiveMQ");

        VM_ALIAS_MAP.put("org.apache.catalina", "Apache Tomcat");

        VM_ALIAS_MAP.put("jetty", "Jetty");

        VM_ALIAS_MAP.put("org.eclipse.equinox.launcher.Main", "Eclipse Equinox");

        VM_ALIAS_MAP.put("scala.tools.nsc.MainGenericRunner", "Scala REPL");

        VM_ALIAS_MAP.put("org.codehaus.groovy.tools.shell.Main", "Groovy Shell");
        VM_ALIAS_MAP.put("org.codehaus.groovy.tools.GroovyStarter", "Groovy Starter");

        VM_ALIAS_MAP.put("jboss-eap-6.1/jboss-modules.jar", "JBoss EAP 6");
        VM_ALIAS_MAP.put("wildfly", "WildFly");

        VM_ALIAS_MAP.put("target/surefire", "Maven Surefire Test");

        VM_ALIAS_MAP.put("org.apache.camel:camel-maven-plugin:run", "Apache Camel");
        VM_ALIAS_MAP.put("camel:run", "Apache Camel");

        VM_ALIAS_MAP.put("org.codehaus.plexus.classworlds.launcher.Launcher spring-boot:run", "Spring Boot");
        VM_ALIAS_MAP.put("org.springframework.boot.loader.JarLauncher shell", "Spring Boot Shell");
        VM_ALIAS_MAP.put("org.jboss.forge.bootstrap.Bootstrap", "JBoss Forge Shell");

        VM_ALIAS_OVERRIDE_MAP.put("${zk:root/http}/jolokia", "Fabric8");
    }

    public JVMList() {
    }

    public void init() {
        LOG.debug("Registering JVM discovery MBean: hawtio:type=JVMList");

        try {
            try {
                // let's just hit any errors we're going to hit before even creating the mbean
                listLocalJVMs();
            } catch (LinkageError e) {
                // Some JVM's don't support com.sun.tools.attach.VirtualMachine
                LOG.warn(
                    "Local JVM discovery disabled as this JVM cannot access com.sun.tools.attach.VirtualMachine due to: {}",
                    e.getMessage());
                return;
            }

            if (objectName == null) {
                objectName = new ObjectName("hawtio:type=JVMList");
            }
            if (mBeanServer == null) {
                mBeanServer = ManagementFactory.getPlatformMBeanServer();
            }
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                LOG.info("Re-registering SchemaLookup MBean");
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception during initialization: ", e);
            throw new RuntimeException(e);
        }

        LOG.info("Registered JVM discovery MBean: hawtio:type=JVMList");
    }

    public void destroy() {
        try {
            if (objectName != null && mBeanServer != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception unregistering mbean: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<VMDescriptorDTO> listLocalJVMs() {
        List<VMDescriptorDTO> rc = new ArrayList<>();
        try {
            List<VirtualMachineDescriptor> processes = VirtualMachine.list();
            for (VirtualMachineDescriptor process : processes) {
                VMDescriptorDTO dto = new VMDescriptorDTO(process);
                dto.setAgentUrl(agentStatus(dto.getId()));

                String alias = getVmAlias(process.displayName(), dto.getAgentUrl());
                dto.setAlias(alias);

                // provide fine grained url details
                if (dto.getAgentUrl() != null) {
                    try {
                        URL url = new URL(dto.getAgentUrl());
                        dto.setScheme(url.getProtocol());
                        dto.setHostname(url.getHost());
                        dto.setPort(url.getPort());
                        dto.setPath(url.getPath());
                    } catch (Exception e) {
                        // ignore
                    }
                }

                rc.add(dto);
            }
        } catch (Exception e) {
            LOG.warn("Failed to get local JVM processes due to: {}", e.getMessage());
            throw new RuntimeException("Failed to get local JVM processes due to: " + e.getMessage(), e);
        }
        return rc;
    }

    private void doAction(String PID, String action) {
        OptionsAndArgs options;

        if (action.equals("start")) {
            options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", "--port", allocateFreePort(), action, PID);
        } else {
            options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", action, PID);
        }

        // System.out.println("Jar file at : " + options.getJarFilePath());

        VirtualMachineHandlerOperations vmHandler = PlatformUtils.createVMAccess(options);
        CommandDispatcher dispatcher = new CommandDispatcher(options);

        Object vm = null;

        try {
            vm = vmHandler.attachVirtualMachine();
            dispatcher.dispatchCommand(vm, vmHandler);
        } catch (Exception e) {
            throw new RuntimeException("Failed to " + action + " agent in process " + PID, e);
        } finally {
            if (vm != null) {
                try {
                    vmHandler.detachAgent(vm);
                } catch (Exception e) {
                    // swallow this?
                }
            }
        }
    }

    private String allocateFreePort() {
        int port = 8778;

        try (ServerSocket sock = new ServerSocket(0)) {
            port = sock.getLocalPort();
        } catch (Exception e) {
            // ignore;
        }
        // ignore

        return Integer.toString(port);
    }

    @Override
    public void startAgent(String PID) {
        doAction(PID, "start");
    }

    @Override
    public String agentStatus(String PID) {
        Object vm = null;

        OptionsAndArgs options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", "status", PID);
        VirtualMachineHandlerOperations vmHandler = PlatformUtils.createVMAccess(options);

        String agentUrl = null;

        try {
            vm = vmHandler.attachVirtualMachine();
            agentUrl = checkAgentUrl(vm);
        } catch (Exception e) {
            // maybe log this
        } finally {
            try {
                vmHandler.detachAgent(vm);
            } catch (Exception e) {
                // log this
            }
        }

        return agentUrl;
    }

    @Override
    public String agentVersion(String PID) {
        return null;
    }

    @Override
    public void stopAgent(String PID) {
        doAction(PID, "stop");
    }

    static String getVmAlias(String displayName, String agentUrl) {
        String answer = displayName;
        for (String key : VM_ALIAS_MAP.keySet()) {
            if (displayName.contains(key)) {
                answer = VM_ALIAS_MAP.get(key);
                break;
            }
        }
        // the agent url may help indicate what the process really is
        if (agentUrl != null) {
            for (String key : VM_ALIAS_OVERRIDE_MAP.keySet()) {
                if (agentUrl.contains(key)) {
                    answer = VM_ALIAS_OVERRIDE_MAP.get(key);
                    break;
                }
            }
        }
        return answer;
    }

    // borrowed these from AbstractBaseCommand for now
    protected String checkAgentUrl(Object pVm) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Properties systemProperties = getAgentSystemProperties(pVm);
        return systemProperties.getProperty(JvmAgent.JOLOKIA_AGENT_URL);
    }

    protected Properties getAgentSystemProperties(Object pVm) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Class<?> clazz = pVm.getClass();
        Method method = clazz.getMethod("getSystemProperties");
        return (Properties) method.invoke(pVm);
    }

}
