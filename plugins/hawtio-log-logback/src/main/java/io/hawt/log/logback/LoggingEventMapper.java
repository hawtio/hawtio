package io.hawt.log.logback;

import java.util.Date;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.LoggingEvent;
import ch.qos.logback.classic.spi.ThrowableProxy;
import io.hawt.log.LogEvent;
import io.hawt.log.support.ThrowableFormatter;

public class LoggingEventMapper {

    private final String hostName;

    public LoggingEventMapper(String hostName) {
        this.hostName = hostName;
    }

    public LogEvent toLogEvent(LoggingEvent loggingEvent) {
        LogEvent answer = new LogEvent();
        answer.setClassName(loggingEvent.getLoggerName());

        ThrowableProxy throwable = (ThrowableProxy) loggingEvent.getThrowableProxy();
        if (throwable != null) {
            ThrowableFormatter formatter = new ThrowableFormatter();
            String[] stack = formatter.doRender(throwable.getThrowable());
            if (stack != null) {
                answer.setException(stack);
            }
        }

        StackTraceElement[] callerData = loggingEvent.getCallerData();
        if (callerData != null && callerData.length > 0) {
            StackTraceElement ste = callerData[0];
            answer.setFileName(ste.getFileName());
            answer.setClassName(ste.getClassName());
            answer.setMethodName(ste.getMethodName());
            answer.setLineNumber(String.valueOf(ste.getLineNumber()));
        }

        Level level = loggingEvent.getLevel();
        if (level != null) {
            answer.setLevel(level.toString());
        }
        answer.setLogger(loggingEvent.getLoggerName());
        String message = loggingEvent.getFormattedMessage();
        if (message != null) {
            answer.setMessage(message);
        }
        answer.setProperties(loggingEvent.getMDCPropertyMap());
        answer.setSeq(loggingEvent.getTimeStamp());
        answer.setTimestamp(new Date(loggingEvent.getTimeStamp()));
        answer.setThread(loggingEvent.getThreadName());
        answer.setHost(hostName);

        return answer;
    }
}
