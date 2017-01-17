package io.hawt.util;

import java.util.ArrayList;
import java.util.List;

/**
 * String utility.
 */
public class Strings {
    public static String trimString(String value, int max) {
        if (value == null) {
            return "";
        }
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max - 3) + "...";
    }

    public static boolean isBlank(String text) {
        return text == null || text.trim().length() == 0;
    }

    public static boolean isNotBlank(String text) {
        return text != null && text.trim().length() > 0;
    }

    /**
     * Strip out any annoying to deal with characters from a string when used as
     * a file or directory name
     *
     * @param name
     * @return
     */
    public static String sanitize(String name) {
        if (isBlank(name)) {
            return name;
        }
        return name.replaceAll("[^0-9a-zA-Z\\+\\.\\(\\)_\\-]", "");
    }

    /**
     * Also remove any dots in the directory name
     *
     * @param name
     * @return
     */
    public static String sanitizeDirectory(String name) {
        if (isBlank(name)) {
            return name;
        }
        return sanitize(name).replace(".", "");
    }

    public static List<String> split(String text, String delimiter) {
        if (text == null || delimiter == null) {
            throw new IllegalArgumentException("Both 'text' and 'delimiter' should not be null.");
        }
        List<String> answer = new ArrayList<>();
        for (String s : text.split(delimiter)) {
            s = s.trim();
            if (isNotBlank(s)) {
                answer.add(s);
            }
        }
        return answer;
    }
}
