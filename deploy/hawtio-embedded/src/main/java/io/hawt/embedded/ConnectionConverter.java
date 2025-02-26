package io.hawt.embedded;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import io.hawt.connect.Connection;

public class ConnectionConverter {

    public Map<String, Optional<Connection>> convert(Map<String, Optional<String>> connections) throws Exception {
        Map<String, Optional<Connection>> converted = new HashMap<>();
        for (String key : connections.keySet()) {
            Optional<String> value = connections.get(key);
            if (value.isEmpty()) {
                converted.put(key, Optional.empty());
                continue;
            }
            Connection connection = convert(value.get());
            converted.put(key, Optional.of(connection));
        }
        return converted;
    }

    public Connection convert(String connection) throws Exception {
        if (connection == null || connection.isEmpty()) {
            throw new IllegalArgumentException("Invalid connection string: " + connection);
        }
        URL url = new URL(connection);
        return new Connection("https".equals(url.getProtocol()), url.getHost(), url.getPort(), url.getPath());
    }

}
