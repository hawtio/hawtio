package io.hawt.util;

/**
 * When we move to Java 8 we can switch this to be java.util.function.Function
 */
public interface Function<T, R> {
    /**
     * Returns the result of applying this function to the parameter value
     */
    R apply(T value);
}