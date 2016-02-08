package io.hawt.maven;

public interface MojoLifecycle {

    void join(ThreadGroup threadGroup);

    void terminateThreads(ThreadGroup threadGroup);
}
