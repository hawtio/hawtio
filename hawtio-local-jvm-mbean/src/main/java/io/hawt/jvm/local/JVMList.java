package io.hawt.jvm.local;

import org.jolokia.jvmagent.client.command.CommandDispatcher;
import org.jolokia.jvmagent.client.util.OptionsAndArgs;
import org.jolokia.jvmagent.client.util.ProcessDescription;
import org.jolokia.jvmagent.client.util.VirtualMachineHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Stan Lewis
 */
public class JVMList implements JVMListMBean {

    protected static final Map<String,String> vmAliasMap = new HashMap<String, String>();
    private VirtualMachineHandler vmHandler;

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

    }

    @Override
    public List<VMDescriptorDTO> listLocalJVMs() {

        List<VMDescriptorDTO> rc = new ArrayList<VMDescriptorDTO>();

        try {
            List<ProcessDescription> processes = new VirtualMachineHandler(null).listProcesses();
            for(ProcessDescription process : processes) {
                rc.add(new VMDescriptorDTO(process));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to get local JVM processes due to " + e);
        }

        return rc;
    }

    private void doAction(String PID, String action) {
        OptionsAndArgs options = new OptionsAndArgs(CommandDispatcher.getAvailableCommands(), "--quiet", "start", PID);

        System.out.println("Jar file at : " + options.getJarFilePath());

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

    @Override
    public void startAgent(String PID) {
        doAction(PID, "start");
    }


    @Override
    public String agentStatus(String PID) {
        return null;
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
}
