/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.introspect;

import io.hawt.util.introspect.support.ClassScanner;

import java.util.SortedMap;

/**
 * Dumps all the classes on the classpath using hte ClassScanner
 */
public class Main {

    public static void main(String[] args) {
        ClassScanner scanner = ClassScanner.newInstance();
        SortedMap<String, Class<?>> answer = scanner.getAllClassesMap();

        for (Class<?> aClass : answer.values()) {
            System.out.println(aClass.getName());
        }
    }
}
