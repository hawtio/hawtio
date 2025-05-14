package io.hawt.connect;

import java.util.Map;
import java.util.Optional;

import org.jolokia.json.JSONArray;
import org.jolokia.json.JSONObject;

/**
 * The definition of a connection used in the Connect plugin.
 *
 * @see <a href="https://github.com/hawtio/hawtio-next/blob/v1.7.0/packages/hawtio/src/plugins/shared/connect-service.ts#L13-L24">hawtio/hawtio-next/packages/hawtio/src/plugins/shared/connect-service.ts</a>
 */
public class Connection {

    public static final String HAWTIO_CONNECT_PRESET_CONNECTIONS = "hawtio.connect.presetConnections";

    private final boolean https;
    private final String host;
    private final int port;
    private final String path;

    public Connection(boolean https, String host, int port, String path) {
        this.https = https;
        this.host = host;
        this.port = port;
        this.path = path;
    }

    public static void setSystemProperty(Map<String, Optional<Connection>> connections) {
        JSONArray json = new JSONArray();
        connections.forEach((name, conn) ->
            json.add(conn.map(c -> c.toJSON(name)).orElse(toNameOnly(name))));
        System.setProperty(HAWTIO_CONNECT_PRESET_CONNECTIONS, json.toJSONString());
    }

    private static JSONObject toNameOnly(String name) {
        JSONObject json = new JSONObject();
        json.put("name", name);
        return json;
    }

    public JSONObject toJSON(String name) {
        JSONObject json = new JSONObject();
        json.put("name", name);
        json.put("scheme", https ? "https" : "http");
        json.put("host", host);
        json.put("port", port);
        json.put("path", path);
        return json;
    }

    public boolean isHttps() {
        return https;
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getPath() {
        return path;
    }
}
