package io.hawt.log.osgi;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.hawt.log.LogEvent;
import io.hawt.log.LogFilter;
import io.hawt.log.support.Objects;
import io.hawt.log.support.Predicate;
import org.ops4j.pax.logging.spi.PaxLevel;
import org.ops4j.pax.logging.spi.PaxLocationInfo;
import org.ops4j.pax.logging.spi.PaxLoggingEvent;

import static io.hawt.log.osgi.MavenCoordinates.addMavenCoord;

public class Logs {

    public static LogEvent newInstance(PaxLoggingEvent event) {
        LogEvent answer = new LogEvent();
        try {
            answer.setLevel(toString(event.getLevel()));
        } catch (NoClassDefFoundError error) {
            // ENTESB-2234, KARAF-3350: Ignore NoClassDefFoundError exceptions
            // Those exceptions may happen if the underlying pax-logging service
            // bundle has been refreshed somehow.
            answer.setLevel("LOG");
        }
        answer.setMessage(event.getMessage());
        answer.setLogger(event.getLoggerName());
        answer.setTimestamp(new Date(event.getTimeStamp()));
        answer.setThread(event.getThreadName());
        answer.setException(addMavenCoord(event.getThrowableStrRep()));

        Map eventProperties = event.getProperties();
        if (eventProperties != null && eventProperties.size() > 0) {
            Map<String, String> properties = new HashMap<String, String>();
            Set<Map.Entry> set = eventProperties.entrySet();
            for (Map.Entry entry : set) {
                Object key = entry.getKey();
                Object value = entry.getValue();
                if (key != null && value != null) {
                    properties.put(toString(key), toString(value));
                }
            }
            addMavenCoord(properties);
            answer.setProperties(properties);
        }

        // TODO missing fields...
        // event.getRenderedMessage()
        // event.getFQNOfLoggerClass()
        try {
            PaxLocationInfo locationInformation = event.getLocationInformation();
            if (locationInformation != null) {
                answer.setClassName(locationInformation.getClassName());
                answer.setFileName(locationInformation.getFileName());
                answer.setMethodName(locationInformation.getMethodName());
                answer.setLineNumber(locationInformation.getLineNumber());
            }
        } catch (NoClassDefFoundError error) {
            // ENTESB-2234, KARAF-3350: Ignore NoClassDefFoundError exceptions
        }
        return answer;
    }

    protected static String toString(Object value) {
        // TODO should we add any custom marshalling for types?
        return value.toString();
    }

    public static Predicate<PaxLoggingEvent> createPredicate(final LogFilter filter) {
        if (filter == null) {
            return null;
        }
        final List<Predicate<PaxLoggingEvent>> predicates = new ArrayList<Predicate<PaxLoggingEvent>>();

        final Set<String> levels = filter.getLevelsSet();
        if (levels.size() > 0) {
            predicates.add(new Predicate<PaxLoggingEvent>() {
                @Override
                public boolean matches(PaxLoggingEvent event) {
                    PaxLevel level = event.getLevel();
                    return level != null && levels.contains(level.toString());
                }
            });
        }
        final Long before = filter.getBeforeTimestamp();
        if (before != null) {
            predicates.add(new Predicate<PaxLoggingEvent>() {
                @Override
                public boolean matches(PaxLoggingEvent event) {
                    long time = event.getTimeStamp();
                    return time < before;
                }
            });
        }
        final Long after = filter.getAfterTimestamp();
        if (after != null) {
            predicates.add(new Predicate<PaxLoggingEvent>() {
                @Override
                public boolean matches(PaxLoggingEvent event) {
                    long time = event.getTimeStamp();
                    return time > after;
                }
            });
        }

        final String matchesText = filter.getMatchesText();
        if (matchesText != null && matchesText.length() > 0) {
            predicates.add(new Predicate<PaxLoggingEvent>() {
                @Override
                public boolean matches(PaxLoggingEvent event) {
                    if (Objects.contains(matchesText,
                            event.getFQNOfLoggerClass(), event.getMessage(),
                            event.getLoggerName(), event.getThreadName())) {
                        return true;
                    }
                    String[] throwableStrRep = event.getThrowableStrRep();
                    if (throwableStrRep != null && Objects.contains(matchesText, throwableStrRep)) {
                        return true;
                    }
                    Map properties = event.getProperties();
                    if (properties != null && Objects.contains(matchesText, properties.toString())) {
                        return true;
                    }
                    return false;
                }
            });
        }

        if (predicates.size() == 0) {
            return null;
        } else if (predicates.size() == 1) {
            return predicates.get(0);
        } else {
            return new Predicate<PaxLoggingEvent>() {
                @Override
                public String toString() {
                    return "AndPredicate" + predicates;
                }

                @Override
                public boolean matches(PaxLoggingEvent event) {
                    for (Predicate<PaxLoggingEvent> predicate : predicates) {
                        if (!predicate.matches(event)) {
                            return false;
                        }
                    }
                    return true;
                }
            };
        }
    }

}
