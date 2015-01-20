package io.hawt.web.plugin.karaf.terminal;

import org.apache.felix.service.command.CommandProcessor;

public class CommandProcessorHolder {

    private static CommandProcessor commandProcessor;

    public static CommandProcessor getCommandProcessor() {
        return commandProcessor;
    }

    public void setCommandProcessor(CommandProcessor commandProcessor) {
        CommandProcessorHolder.commandProcessor = commandProcessor;
    }

}
