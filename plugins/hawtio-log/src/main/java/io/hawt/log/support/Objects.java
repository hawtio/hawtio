package io.hawt.log.support;

import java.util.Arrays;

public final class Objects {

    public static boolean isBlank(String text) {
        return text == null || text.trim().length() == 0;
    }

    /**
     * A helper method for performing an ordered comparison on the objects
     * handling nulls and objects which do not handle sorting gracefully
     *
     * @param a  the first object
     * @param b  the second object
     */
    @SuppressWarnings("unchecked")
    public static int compare(Object a, Object b) {
        if (a == b) {
            return 0;
        }
        if (a == null) {
            return -1;
        }
        if (b == null) {
            return 1;
        }
        if (a instanceof Comparable) {
            return ((Comparable<Object>) a).compareTo(b);
        }
        int answer = a.getClass().getName().compareTo(b.getClass().getName());
        if (answer == 0) {
            answer = a.hashCode() - b.hashCode();
        }
        return answer;
    }

    public static boolean contains(String matchesText, String... values) {
        return Arrays.stream(values)
            .filter(java.util.Objects::nonNull)
            .anyMatch(v -> v.contains(matchesText));
    }
}
