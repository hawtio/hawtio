package io.hawt.web.plugin.karaf.terminal;

import org.apache.felix.service.threadio.ThreadIO;

/**
 * @author Guillaume Nodet
 */
public class ThreadIOHolder {

    private static ThreadIO threadIO;

    public static ThreadIO getThreadIO() {
        return threadIO;
    }

    public void setThreadIO(ThreadIO threadIO) {
        this.threadIO = threadIO;
    }


}
