package io.hawt.maven.junit;

import java.lang.reflect.Method;
import java.util.List;

public interface JUnitService {

    List<Method> findTestMethods(Class clazz) throws Exception;

    List<Method> filterTestMethods(List<Method> methods, String filter);
}
