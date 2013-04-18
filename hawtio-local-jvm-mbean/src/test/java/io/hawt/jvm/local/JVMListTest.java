package io.hawt.jvm.local;

import org.junit.Assert;
import org.junit.Test;

import java.util.List;

/**
 * @author Stan Lewis
 */
public class JVMListTest {

    public JVMList getJVMList() {
        JVMList rc = new JVMList();
        rc.init();
        return rc;
    }


    @Test
    public void testListJVMs() {
        List<VMDescriptorDTO> jvms = getJVMList().listLocalJVMs();

        for (VMDescriptorDTO jvm : jvms) {
            System.out.println("JVM: " + jvm);
        }
    }

    @Test
    public void testStartAndStopAgent() {
        JVMList list = getJVMList();
        List<VMDescriptorDTO> jvms = list.listLocalJVMs();

        VMDescriptorDTO me = null;
        for (VMDescriptorDTO jvm : jvms) {
            System.out.println("JVM: " + jvm);
            if (jvm.getAlias().equals("Maven Surefire Test")) {
                me = jvm;
            }
        }

        Assert.assertNotNull(me);

        System.out.println("Starting agent in " + me.getId());
        list.startAgent(me.getId());

        try {
            Thread.sleep(1000);
        } catch (Exception e) {

        }

        System.out.println("Stopping agent in " + me.getId());
        list.stopAgent(me.getId());


    }
}
