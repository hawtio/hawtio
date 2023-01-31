package io.hawt.log.support;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.hawt.log.LogEvent;
import io.hawt.log.LogFilter;

import static io.hawt.log.support.Objects.contains;

public abstract class LogQueryBase extends LogQuerySupport {

    protected Predicate<LogEvent> createPredicate(LogFilter filter) {
        if (filter == null) {
            return null;
        }
        List<Predicate<LogEvent>> predicates = new ArrayList<>();

        Set<String> levels = filter.getLevelsSet();
        if (levels.size() > 0) {
            predicates.add(e -> e.getLevel() != null && levels.contains(e.getLevel()));
        }
        Long before = filter.getBeforeTimestamp();
        if (before != null) {
            Date date = new Date(before);
            predicates.add(e -> e.getTimestamp() != null && e.getTimestamp().before(date));
        }
        Long after = filter.getAfterTimestamp();
        if (after != null) {
            Date date = new Date(after);
            predicates.add(e -> e.getTimestamp() != null && e.getTimestamp().after(date));
        }

        String matchesText = filter.getMatchesText();
        if (matchesText != null && matchesText.length() > 0) {
            predicates.add(e -> matches(e, matchesText));
        }

        if (predicates.isEmpty()) {
            return null;
        } else if (predicates.size() == 1) {
            return predicates.get(0);
        } else {
            return new Predicate<LogEvent>() {
                @Override
                public String toString() {
                    return "AndPredicate" + predicates;
                }

                @Override
                public boolean matches(LogEvent event) {
                    return predicates.stream().allMatch(p -> p.matches(event));
                }
            };
        }
    }

    private boolean matches(LogEvent event, String text) {
        if (contains(text, event.getClassName(), event.getMessage(), event.getLogger(), event.getThread())) {
            return true;
        }
        String[] throwableStrRep = event.getException();
        if (throwableStrRep != null && contains(text, throwableStrRep)) {
            return true;
        }
        Map<String, String> properties = event.getProperties();
        return properties != null && contains(text, properties.toString());
    }
}
