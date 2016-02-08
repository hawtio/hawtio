package io.hawt.git;

/**
 * Thrown if some IO exception occurs
 */
public class RuntimeIOException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RuntimeIOException(Exception e) {
        super(e);
    }
}
