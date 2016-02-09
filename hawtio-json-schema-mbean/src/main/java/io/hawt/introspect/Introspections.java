package io.hawt.introspect;

import io.hawt.util.Objects;

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
    }

    public static PropertyDTO findPropertyByName(Iterable<PropertyDTO> properties, String name) {
        for (PropertyDTO property : properties) {
            if (Objects.equals(name, property.getName())) {
                return property;
            }
        }
        return null;
    }
}
