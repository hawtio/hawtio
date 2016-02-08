package io.hawt.jsonschema.maven.plugin.util;

/**
 * A little helper class for converting a collection of values to a (usually comma separated) string.
 */
public class CollectionStringBuffer {

    private final StringBuilder buffer = new StringBuilder();
    private String separator;
    private boolean first = true;

    public CollectionStringBuffer() {
        this(", ");
    }

    public CollectionStringBuffer(String separator) {
        this.separator = separator;
    }

    @Override
    public String toString() {
        return buffer.toString();
    }

    public void append(Object value) {
        if (first) {
            first = false;
        } else {
            buffer.append(separator);
        }
        buffer.append(value);
    }

    public String getSeparator() {
        return separator;
    }

    public void setSeparator(String separator) {
        this.separator = separator;
    }

}