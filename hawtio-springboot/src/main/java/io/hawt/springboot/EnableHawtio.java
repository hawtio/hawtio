package io.hawt.springboot;

import org.springframework.context.annotation.Import;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * EnableHawtio annotation.
 *
 * @deprecated Not necessary to use this annotation any longer
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(HawtioConfiguration.class)
@Documented
@Deprecated
public @interface EnableHawtio {
}
