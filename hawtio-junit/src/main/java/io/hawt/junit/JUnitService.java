package io.hawt.junit;

import java.lang.reflect.Method;
import java.util.List;

public interface JUnitService {

    List<Method> findTestMethods(Class<?> clazz) throws Exception;

    List<Method> filterTestMethods(List<Method> methods, String filter);

    Method findBefore(Class<?> clazz) throws Exception;

    Method findBeforeClass(Class<?> clazz) throws Exception;

    Method findAfter(Class<?> clazz) throws Exception;

    Method findAfterClass(Class<?> clazz) throws Exception;
}
