package io.hawt.embedded;

import java.net.URL;

import io.hawt.connect.Connection;
import picocli.CommandLine;

public class ConnectionConverter implements CommandLine.ITypeConverter<Connection> {

    @Override
    public Connection convert(String value) throws Exception {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException("Invalid connection string: " + value);
        }
        URL url = new URL(value);
        return new Connection("https".equals(url.getProtocol()), url.getHost(), url.getPort(), url.getPath());
    }

}
