package io.hawt.jvm.local;

import com.sun.tools.attach.VirtualMachine;
import com.sun.tools.attach.VirtualMachineDescriptor;
import org.jolokia.jvmagent.JvmAgent;
import org.jolokia.jvmagent.client.command.CommandDispatcher;
import org.jolokia.jvmagent.client.util.OptionsAndArgs;
import org.jolokia.jvmagent.client.util.VirtualMachineHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.ServerSocket;
import java.util.*;

public class JVMList implements JVMListMBean {

    private static final transient Logger LOG = LoggerFactory.getLogger(JVMList.class);

    private MBeanServer mBeanServer;
    private ObjectName objectName;


    protected static final Map<String,String> vmAliasMap = new HashMap<String, String>();
    static {
        vmAliasMap.put("com.intellij.idea.Main", "IDEA");
        vmAliasMap.put("com.intellij.rt.execution.application.AppMain", "IDEA");
        vmAliasMap.put("org.apache.karaf.main.Main", "Karaf");
        vmAliasMap.put("org.eclipse.equinox.launcher.Main", "Equinox");
        vmAliasMap.put("org.jetbrains.idea.maven.server.RemoteMavenServer", "IDEA Maven server");
        vmAliasMap.put("idea maven server", "");
        vmAliasMap.put("scala.tools.nsc.MainGenericRunner", "scala repl");
        vmAliasMap.put("jboss-eap-6.1/jboss-modules.jar", "JBoss EAP 6");
        vmAliasMap.put("target/surefire", "Maven Surefire Test");
        vmAliasMap.put("org.apache.camel:camel-maven-plugin:run", "Local Camel Context");

        /*
        vmAliasMap.put("default", "Apache Karaf");
        vmAliasMap.put("esb-version.jar", "JBoss Fuse");
        vmAliasMap.put("fabric-version.jar", "Fuse Fabric");
        vmAliasMap.put("mq-version.jar", "JBoss A-MQ");
        vmAliasMap.put("servicemix-version.jar", "Apache ServiceMix");
        */
    }

    public JVMList() {

    }

    public void init() {
        try {

            try {
              // let's just hit any errors we're going to hit before even creating the mbean
              listLocalJVMs();
            } catch (LinkageError e) {
              // Some JVM's don't support com.sun.tools.attach.VirtualMachine
              LOG.warn("Local JVM discovery disabled as this JVM cannot access com.sun.tools.attach.VirtualMachine due to: " + e.getMessage());
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
        List<VMDescriptorDTO> rc = new ArrayList<VMDescriptorDTO>();
        try {
            List<VirtualMachineDescriptor> processes = VirtualMachine.list();
            for(VirtualMachineDescriptor process : processes) {
                VMDescriptorDTO dto = new VMDescriptorDTO(process);
                dto.setAgentUrl(agentStatus(dto.getId()));
                rc.add(dto);
            }
        } catch (Exception e) {
            LOG.warn("Failed to get local JVM processes due to: ", e.getMessage());
            throw new RuntimeException("Failed to get local JVM processes due to: " + e.getMessage(), e);
        }
        return rc;
    }

    private void doAction(String PID, String action) {
        OptionsAndArgs options = null;

        if (action.equals("start")) {
            options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", "--port", allocateFreePort(), action, PID);
        } else {
            options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", action, PID);
        }

        // System.out.println("Jar file at : " + options.getJarFilePath());

        VirtualMachineHandler vmHandler = new VirtualMachineHandler(options);
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

        ServerSocket sock = null;

        try {
            sock = new ServerSocket(0);
            port = sock.getLocalPort();
        } catch (Exception e) {
            // ignore;
        } finally {
            if (sock != null) {
                try {
                    sock.close();
                } catch (Exception e) {
                    // ignore
                }
            }
        }

        return new Integer(port).toString();
    }

    @Override
    public void startAgent(String PID) {
        doAction(PID, "start");
    }

    @Override
    public String agentStatus(String PID) {
        Object vm = null;

        OptionsAndArgs options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", "status", PID);
        VirtualMachineHandler vmHandler = new VirtualMachineHandler(options);

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

    static String getVmAlias(String displayName) {
        for (String key : vmAliasMap.keySet()) {
            if (displayName.contains(key)) {
                return vmAliasMap.get(key);
            }
        }
        return displayName;
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
