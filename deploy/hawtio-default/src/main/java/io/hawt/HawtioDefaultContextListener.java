package io.hawt;

import jakarta.servlet.ServletContextEvent;

import io.hawt.jvm.local.JVMList;

public class HawtioDefaultContextListener extends HawtioContextListener {
    private final JVMList jvmList;

    public HawtioDefaultContextListener() {
        super();
        this.jvmList = new JVMList();
    }

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        super.contextInitialized(servletContextEvent);
        try {
            jvmList.init();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        super.contextDestroyed(servletContextEvent);
        try {
            jvmList.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }
}
