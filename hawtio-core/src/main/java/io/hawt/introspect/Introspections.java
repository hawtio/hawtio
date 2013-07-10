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

import java.util.HashMap;
import java.util.Map;

/**
 * Some introspection helper methods
 */
public class Introspections {

    /**
     * Returns a map indexed by property name
     */
    public static Map<String, PropertyDTO> getPropertyMap(Iterable<PropertyDTO> properties) {
        Map<String, PropertyDTO> answer = new HashMap<String, PropertyDTO>();
        for (PropertyDTO property : properties) {
            answer.put(property.getName(), property);
        }
        return answer;
    }}
