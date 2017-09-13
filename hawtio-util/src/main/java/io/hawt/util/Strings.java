package io.hawt.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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
        return Arrays.stream(text.split(delimiter))
            .map(s -> s.trim())
            .filter(s -> isNotBlank(s))
            .collect(Collectors.toList());
    }

    public static String strip(String text, String chars) {
        if (text == null || chars == null) {
            throw new IllegalArgumentException("Both 'text' and 'chars' should not be null.");
        }
        String answer = text;
        if (answer.startsWith(chars)) {
            answer = answer.substring(chars.length());
        }
        if (answer.endsWith(chars)) {
            answer = answer.substring(0, answer.length() - chars.length());
        }
        return answer;
    }
}
