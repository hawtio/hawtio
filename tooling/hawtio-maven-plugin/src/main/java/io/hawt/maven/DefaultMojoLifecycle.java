package io.hawt.maven;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.apache.maven.plugin.logging.Log;

public class DefaultMojoLifecycle implements MojoLifecycle {

    private long daemonThreadJoinTimeout = 15000L;
    private final Log log;

    public DefaultMojoLifecycle(Log log) {
        this.log = log;
    }

    @Override
    public void join(ThreadGroup threadGroup) {
        boolean foundNonDaemon;
        do {
            foundNonDaemon = false;
            Collection<Thread> threads = getActiveThreads(threadGroup);
            for (Thread thread : threads) {
                if (thread.isDaemon()) {
                    continue;
                }
                foundNonDaemon = true; // try again; maybe more threads were
                // created while we were busy
                joinThread(thread, 0);
            }
        } while (foundNonDaemon);
    }

    @Override
    public void terminateThreads(ThreadGroup threadGroup) {
        long startTime = System.currentTimeMillis();
        Set<Thread> uncooperativeThreads = new HashSet<Thread>(); // these were not responsive
        // to interruption
        for (Collection<Thread> threads = getActiveThreads(threadGroup); !threads.isEmpty(); threads = getActiveThreads(threadGroup), threads
                .removeAll(uncooperativeThreads)) {
            // Interrupt all threads we know about as of this instant (harmless
            // if spuriously went dead (! isAlive())
            // or if something else interrupted it ( isInterrupted() ).
            for (Thread thread : threads) {
                log.debug("interrupting thread " + thread);
                thread.interrupt();
            }
            // Now join with a timeout and call stop() (assuming flags are set
            // right)
            for (Thread thread : threads) {
                if (!thread.isAlive()) {
                    continue; // and, presumably it won't show up in
                    // getActiveThreads() next iteration
                }
                if (daemonThreadJoinTimeout <= 0) {
                    joinThread(thread, 0); // waits until not alive; no timeout
                    continue;
                }
                long timeout = daemonThreadJoinTimeout - (System.currentTimeMillis() - startTime);
                if (timeout > 0) {
                    joinThread(thread, timeout);
                }
                if (!thread.isAlive()) {
                    continue;
                }
                uncooperativeThreads.add(thread); // ensure we don't process
                log.warn("thread " + thread + " will linger despite being asked to die via interruption");
            }
        }
        if (!uncooperativeThreads.isEmpty()) {
            log.warn("NOTE: "
                    + uncooperativeThreads.size()
                    + " thread(s) did not finish despite being asked to "
                    + " via interruption. This is not a problem with exec:java, it is a problem with the running code."
                    + " Although not serious, it should be remedied.");
        } else {
            int activeCount = threadGroup.activeCount();
            if (activeCount != 0) {
                Thread[] threadsArray = new Thread[1];
                threadGroup.enumerate(threadsArray);
                log.debug("strange; " + activeCount + " thread(s) still active in the group "
                        + threadGroup + " such as " + threadsArray[0]);
            }
        }
    }

    private void joinThread(Thread thread, long timeoutMsecs) {
        try {
            log.info("Joining on thread " + thread);
            thread.join(timeoutMsecs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // good practice if don't throw
            log.warn("interrupted while joining against thread " + thread, e); // not
            // expected!
        }
        // generally abnormal
        if (thread.isAlive()) {
            log.warn("thread " + thread + " was interrupted but is still alive after waiting at least "
                    + timeoutMsecs + "msecs");
        }
    }

    private Collection<Thread> getActiveThreads(ThreadGroup threadGroup) {
        Thread[] threads = new Thread[threadGroup.activeCount()];
        int numThreads = threadGroup.enumerate(threads);
        Collection<Thread> result = new ArrayList<Thread>(numThreads);
        for (int i = 0; i < threads.length && threads[i] != null; i++) {
            result.add(threads[i]);
        }
        // note: result should be modifiable
        return result;
    }

}
