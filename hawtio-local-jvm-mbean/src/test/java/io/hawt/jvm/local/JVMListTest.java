package io.hawt.jvm.local;

import org.junit.Assert;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

import java.util.List;

/**
 * @author Stan Lewis
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class JVMListTest {

    public JVMList getJVMList() {
        JVMList rc = new JVMList();
        rc.init();
        return rc;
    }


    @Test
    public void test03ListJVMs() {
        List<VMDescriptorDTO> jvms = getJVMList().listLocalJVMs();

        for (VMDescriptorDTO jvm : jvms) {
            System.out.println("JVM: " + jvm);
        }
    }

    public void sleep() {
        try {
            Thread.sleep(500);
        } catch (Exception e) {

        }
    }

    @Test
    public void test02StopAgent() {
        JVMList list = getJVMList();
        List<VMDescriptorDTO> jvms = list.listLocalJVMs();
        VMDescriptorDTO me = null;

        for (VMDescriptorDTO jvm : jvms) {
            //System.out.println("JVM: " + jvm);
            if (jvm.getAlias().equals("Maven Surefire Test")) {
                me = jvm;
            }
        }

        list.stopAgent(me.getId());

        jvms = list.listLocalJVMs();

        for (VMDescriptorDTO jvm : jvms) {
            if (jvm.getId().equals(me.getId())) {
                me = jvm;
            }
        }

        System.out.println("Agent URL: " + me.getAgentUrl());
        Assert.assertNull(me.getAgentUrl());
    }

    @Test
    public void test01StartAgent() {
        JVMList list = getJVMList();
        List<VMDescriptorDTO> jvms = list.listLocalJVMs();

        VMDescriptorDTO me = null;
        for (VMDescriptorDTO jvm : jvms) {
            //System.out.println("JVM: " + jvm);
            if (jvm.getAlias().equals("Maven Surefire Test")) {
                me = jvm;
            }
        }

        Assert.assertNotNull(me);

        System.out.println("Starting agent in " + me.getId());
        list.startAgent(me.getId());

        sleep();

        jvms = list.listLocalJVMs();

        for (VMDescriptorDTO jvm : jvms) {
            if (jvm.getId().equals(me.getId())) {
                me = jvm;
            }
        }

        System.out.println("Agent URL: " + me.getAgentUrl());
        Assert.assertNotNull(me.getAgentUrl());
    }
}
