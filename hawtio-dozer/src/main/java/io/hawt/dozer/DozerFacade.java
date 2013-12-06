package io.hawt.dozer;

import io.hawt.config.ConfigFacade;
import io.hawt.util.FileFilters;
import io.hawt.util.IOHelper;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Objects;
import io.hawt.util.Strings;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.SortedSet;
import java.util.Timer;
import java.util.TimerTask;
import java.util.TreeSet;
import java.util.concurrent.Callable;

/**
 *
 */
public class DozerFacade extends MBeanSupport implements DozerFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(DozerFacade.class);



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