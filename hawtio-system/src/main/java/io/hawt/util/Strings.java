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
     * Strip out any annoying to deal with characters from a string when used as a
     * file or directory name
     */
    public static String sanitize(String name) {
        if (isBlank(name)) {
            return name;
        }
        return name.replaceAll("[^0-9a-zA-Z\\+\\.\\(\\)_\\-]", "");
    }

    /**
     * Also remove any dots in the directory name
     */
    public static String sanitizeDirectory(String name) {
        if (isBlank(name)) {
            return name;
        }
        return sanitize(name).replace(".", "");
    }

    public static List<String> split(String text, String delimiter) {
        if (text == null || delimiter == null) {
            throw new IllegalArgumentException(
                    "Both 'text' and 'delimiter' should not be null.");
        }
        return Arrays.stream(text.split(delimiter)).map(String::trim)
                .filter(Strings::isNotBlank).collect(Collectors.toList());
    }

    /**
     * Normalizes a path. If the path contains a single '/' character it is returned
     * unchanged, otherwise the path is:
     * <ol>
     * <li>stripped from all multiple consecutive occurrences of '/' characters</li>
     * <li>stripped from trailing '/' character(s)</li>
     * </ol>
     * 
     * @param path
     *            path to normalize
     * @return normalized path
     */
    public static String cleanPath(final String path) {
        final String result = path.replaceAll("//+", "/");
        return result.length() == 1 && result.charAt(0) == '/' ? result
                : result.replaceAll("/+$", "");
    }

    /**
     * Creates a web context path from components. Concatenates all path components
     * using '/' character as delimiter and the result is then:
     * <ol>
     * <li>prefixed with '/' character</li>
     * <li>stripped from all multiple consecutive occurrences of '/' characters</li>
     * <li>stripped from trailing '/' character(s)</li>
     * </ol>
     * 
     * @return empty string or string which starts with a "/" character but does not
     *         end with a "/" character
     */
    public static String webContextPath(final String first, final String... more) {
        if (more.length == 0 && (first == null || first.isEmpty())) {
            return "";
        }

        final StringBuilder b = new StringBuilder();
        if (first != null) {
            if (!first.startsWith("/")) {
                b.append('/');
            }
            b.append(first);
        }

        for (final String s : more) {
            if (s != null && !s.isEmpty()) {
                b.append('/');
                b.append(s);
            }
        }

        final String cleanedPath = cleanPath(b.toString());
        return cleanedPath.length() == 1 ? "" : cleanedPath;
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
