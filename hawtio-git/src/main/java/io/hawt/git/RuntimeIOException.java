package io.hawt.git;

/**
 * Thrown if some IO exception occurs
 */
public class RuntimeIOException extends RuntimeException {

    public RuntimeIOException(Exception e) {
        super(e);
    }
}
