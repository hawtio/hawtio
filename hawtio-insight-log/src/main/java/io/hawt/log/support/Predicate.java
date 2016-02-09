package io.hawt.log.support;

/**
 * Applies a predicate to a type; can be replaced by the Predicate from Guava later maybe?
 */
public interface Predicate<T> {

    boolean matches(T t);

}
