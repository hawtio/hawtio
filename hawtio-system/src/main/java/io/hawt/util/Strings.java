package io.hawt.util;

import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

/**
 * String utility.
 */
public class Strings {

    public static boolean isBlank(String text) {
        return text == null || text.trim().isEmpty();
    }

    public static boolean isNotBlank(String text) {
        return text != null && !text.trim().isEmpty();
    }

    public static List<String> split(String text, String delimiter) {
        if (text == null || delimiter == null) {
            throw new IllegalArgumentException(
                "Both 'text' and 'delimiter' should not be null.");
        }
        return Arrays.stream(text.split(delimiter)).map(String::trim)
            .filter(Strings::isNotBlank).collect(Collectors.toList());
    }

    public static String resolvePlaceholders(String value) {
        return resolvePlaceholders(value, System.getProperties());
    }

    /**
     * Simple, recursively-safe property placeholder resolver. De-facto
     * standard {@code ${...}} syntax is used. Unresolvable properties are not replaced and separators pass to
     * resulting value.
     *
     * @param value
     * @return
     */
    public static String resolvePlaceholders(String value, Properties properties) {
        if (value == null || !value.contains("$")) {
            return value;
        }

        StringBuilder result = new StringBuilder();
        int l = value.length();
        for (int pos1 = 0; pos1 < l; pos1++) {
            char c1 = value.charAt(pos1);
            char c2 = pos1 == l - 1 ? '\0' : value.charAt(pos1 + 1);
            if (c1 == '$' && c2 == '{') {
                // find matching }
                //  - if found, resolve and continue with the rest of the value
                //  - if not found, just proceed (possibly until next "${")
                int depth = 1;
                int pos2 = pos1 + 2;
                while (depth > 0 && pos2 < l) {
                    if (value.charAt(pos2) == '$' && pos2 < l - 1 && value.charAt(pos2 + 1) == '{') {
                        depth++;
                        pos2 += 2;
                    } else if (value.charAt(pos2) == '}') {
                        depth--;
                        pos2++;
                    } else {
                        pos2++;
                    }
                }
                if (depth > 0) {
                    // no matching '}'
                    result.append('$');
                } else {
                    pos1 = resolve(value, result, pos1, pos2, properties) - 1;
                }
            } else {
                result.append(c1);
            }
        }

        return result.toString();
    }

    /**
     * Single iteration resolve method. {@code from} indicates <code>${</code> placeholder start
     *
     * @param value
     * @param result
     * @param from
     * @param to
     * @param properties
     * @return
     */
    private static int resolve(String value, StringBuilder result, int from, int to, Properties properties) {
        // "from" always points to "${" and "to" points to _matching_ "}"
        String key = resolvePlaceholders(value.substring(from + 2, to - 1), properties);
        String v = properties.getProperty(key);
        if (v == null) {
            result.append("${").append(key).append("}");
        } else {
            result.append(v);
        }
        return to;
    }

}
