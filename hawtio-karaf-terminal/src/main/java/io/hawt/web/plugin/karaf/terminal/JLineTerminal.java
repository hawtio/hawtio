package io.hawt.web.plugin.karaf.terminal;

import java.io.Closeable;
import java.io.IOException;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import org.apache.karaf.shell.api.console.Signal;
import org.apache.karaf.shell.api.console.Terminal;
import org.apache.karaf.shell.support.terminal.SignalSupport;


public class JLineTerminal extends SignalSupport implements Terminal, Closeable {

    private final jline.Terminal terminal;
    private final String type;

    public JLineTerminal(jline.Terminal terminal, String type) {
        this.terminal = terminal;
        this.type = type;
        registerSignalHandler();
    }

    public jline.Terminal getTerminal() {
        return terminal;
    }

    @Override
    public String getType() {
        return type;
    }

    @Override
    public int getWidth() {
        return terminal.getWidth();
    }

    @Override
    public int getHeight() {
        return terminal.getHeight();
    }

    @Override
    public boolean isAnsiSupported() {
        return terminal.isAnsiSupported();
    }

    @Override
    public boolean isEchoEnabled() {
        return terminal.isEchoEnabled();
    }

    @Override
    public void setEchoEnabled(boolean enabled) {
        terminal.setEchoEnabled(enabled);
    }

    @Override
    public void close() throws IOException {
        unregisterSignalHandler();
    }

    private void registerSignalHandler() {
        try {
            Class<?> signalClass = Class.forName("sun.misc.Signal");
            Class<?> signalHandlerClass = Class.forName("sun.misc.SignalHandler");
            // Implement signal handler
            Object signalHandler = Proxy.newProxyInstance(getClass().getClassLoader(),
                    new Class<?>[]{signalHandlerClass}, new InvocationHandler() {
                        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                            JLineTerminal.this.signal(Signal.WINCH);
                            return null;
                        }
                    }
            );
            // Register the signal handler, this code is equivalent to:
            // Signal.handle(new Signal("CONT"), signalHandler);
            signalClass.getMethod("handle", signalClass, signalHandlerClass).invoke(null, signalClass.getConstructor(String.class).newInstance("WINCH"), signalHandler);
        } catch (Exception e) {
            // Ignore this exception, if the above failed, the signal API is incompatible with what we're expecting

        }
    }

    private void unregisterSignalHandler() {
        try {
            Class<?> signalClass = Class.forName("sun.misc.Signal");
            Class<?> signalHandlerClass = Class.forName("sun.misc.SignalHandler");

            Object signalHandler = signalHandlerClass.getField("SIG_DFL").get(null);
            // Register the signal handler, this code is equivalent to:
            // Signal.handle(new Signal("CONT"), signalHandler);
            signalClass.getMethod("handle", signalClass, signalHandlerClass).invoke(null, signalClass.getConstructor(String.class).newInstance("WINCH"), signalHandler);
        } catch (Exception e) {
            // Ignore this exception, if the above failed, the signal API is incompatible with what we're expecting

        }
    }
}
