package io.hawt.dozer;

import io.hawt.util.MBeanSupport;

/**
 *
 */
public class DozerFacade extends MBeanSupport implements DozerFacadeMXBean {

    public void init() throws Exception {
        super.init();
    }

    @Override
    public void destroy() throws Exception {
        super.destroy();
    }


    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=DozerFacade";
    }

}