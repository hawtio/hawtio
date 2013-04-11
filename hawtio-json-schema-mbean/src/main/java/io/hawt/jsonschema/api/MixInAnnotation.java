package io.hawt.jsonschema.api;

/**
 * @author Stan Lewis
 */
public interface MixInAnnotation {

    /**
     * Return the class or interface whose annotations will be added to the target's annotations, overriding as needed
     */
    Class getMixinSource();

    /**
     * Return the target class or interface whose annotations should be overridden
     */

    Class getTarget();

}
