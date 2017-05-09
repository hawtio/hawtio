package io.hawt.jsonschema.maven.plugin.util;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class JSonSchemaHelper {

    // 0 = text, 1 = enum, 2 = boolean, 3 = integer or number
    private static final Pattern PATTERN = Pattern.compile("\"(.+?)\"|\\[(.+)\\]|(true|false)|(-?\\d+\\.?\\d*)");
    private static final String QUOT = "&quot;";

    private JSonSchemaHelper() {
    }

    /**
     * Parses the json schema to split it into a list or rows, where each row contains key value pairs with the metadata
     *
     * @param group the group to parse from such as <tt>component</tt>, <tt>componentProperties</tt>, or <tt>properties</tt>.
     * @param json the json
     * @return a list of all the rows, where each row is a set of key value pairs with metadata
     */
    public static List<Map<String, String>> parseJsonSchema(String group, String json, boolean parseProperties) {
        List<Map<String, String>> answer = new ArrayList<Map<String, String>>();
        if (json == null) {
            return answer;
        }

        boolean found = false;

        // parse line by line
        String[] lines = json.split("\n");
        for (String line : lines) {
            // we need to find the group first
            if (!found) {
                String s = line.trim();
                found = s.startsWith("\"" + group + "\":") && s.endsWith("{");
                continue;
            }

            // we should stop when we end the group
            if (line.equals("  },") || line.equals("  }")) {
                break;
            }

            // need to safe encode \" so we can parse the line
            line = line.replaceAll("\"\\\\\"\"", '"' + QUOT + '"');

            Map<String, String> row = new LinkedHashMap<String, String>();
            Matcher matcher = PATTERN.matcher(line);

            String key;
            if (parseProperties) {
                // when parsing properties the first key is given as name, so the first parsed token is the value of the name
                key = "name";
            } else {
                key = null;
            }
            while (matcher.find()) {
                if (key == null) {
                    key = matcher.group(1);
                } else {
                    String value = matcher.group(1);
                    if (value != null) {
                        // its text based
                        value = value.trim();
                        // decode
                        value = value.replaceAll(QUOT, "\"");
                        value = decodeJson(value);
                    }
                    if (value == null) {
                        // not text then its maybe an enum?
                        value = matcher.group(2);
                        if (value != null) {
                            // its an enum so strip out " and trim spaces after comma
                            value = value.replaceAll("\"", "");
                            value = value.replaceAll(", ", ",");
                            value = value.trim();
                        }
                    }
                    if (value == null) {
                        // not text then its maybe a boolean?
                        value = matcher.group(3);
                    }
                    if (value == null) {
                        // not text then its maybe a integer?
                        value = matcher.group(4);
                    }
                    if (value != null) {
                        row.put(key, value);
                    }
                    // reset
                    key = null;
                }
            }
            if (!row.isEmpty()) {
                answer.add(row);
            }
        }

        return answer;
    }

    private static String decodeJson(String value) {
        // json encodes a \ as \\ so we need to decode from \\ back to \
        if ("\\\\".equals(value)) {
            value = "\\";
        }
        return value;
    }

    public static String getValue(String key, List<Map<String, String>> rows) {
        for (Map<String, String> row : rows) {
            if (row.get(key) != null) {
                return row.get(key);
            }
        }
        return null;
    }

    public static String doubleQuote(String value) {
        return "\"" + value + "\"";
    }

    /**
     * Capitializes the name as a title
     *
     * @param name  the name
     * @return as a title
     */
    public static String asTitle(String name) {
        StringBuilder sb = new StringBuilder();
        for (char c : name.toCharArray()) {
            boolean upper = Character.isUpperCase(c);
            boolean first = sb.length() == 0;
            if (first) {
                sb.append(Character.toUpperCase(c));
            } else if (upper) {
                sb.append(' ');
                sb.append(c);
            } else {
                sb.append(Character.toLowerCase(c));
            }
        }
        return sb.toString().trim();
    }

}
