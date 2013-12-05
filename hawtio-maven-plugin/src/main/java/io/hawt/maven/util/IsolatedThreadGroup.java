package io.hawt.maven.util;

import org.apache.maven.plugin.AbstractMojo;

public class IsolatedThreadGroup extends ThreadGroup {
    private Throwable uncaughtException;
    private AbstractMojo mojo;

    public IsolatedThreadGroup(AbstractMojo mojo, String name) {
        super(name);
        this.mojo = mojo;
    }

    public void uncaughtException(Thread thread, Throwable throwable) {
        if (throwable instanceof ThreadDeath) {
            return; // harmless
        }
        boolean doLog = false;
        synchronized (this) {
            // only remember the first one
            if (uncaughtException == null) {
                uncaughtException = throwable;
                // will be reported eventually
            } else {
                doLog = true;
            }
        }
        if (doLog) {
            mojo.getLog().warn("an additional exception was thrown", throwable);
        }
    }

    public Throwable getUncaughtException() {
        return uncaughtException;
    }
}
