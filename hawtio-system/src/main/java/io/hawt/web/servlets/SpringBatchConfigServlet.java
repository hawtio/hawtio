package io.hawt.web.servlets;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Properties;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.jolokia.json.JSONArray;
import org.jolokia.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static io.hawt.web.ServletHelpers.writeEmpty;

public class SpringBatchConfigServlet extends HttpServlet {

    private static final Logger LOG = LoggerFactory.getLogger(SpringBatchConfigServlet.class);

    @Override
    public void doGet(HttpServletRequest httpServletRequest,
                      HttpServletResponse httpServletResponse) throws IOException {

        Properties properties = new Properties();
        InputStream propsIn = SpringBatchConfigServlet.class.getClassLoader().getResourceAsStream("springbatch.properties");
        httpServletResponse.setHeader("Content-type", "application/json");
        if (propsIn == null) {
            writeEmpty(httpServletResponse.getWriter());
            return;
        }
        try (propsIn) {
            properties.load(propsIn);
        }
        JSONObject responseJson = new JSONObject();
        JSONArray springBatchServersJson = new JSONArray();
        List<? extends String> springBatchServers = Arrays.asList(properties.getProperty("springBatchServerList").split(","));
        springBatchServersJson.addAll(springBatchServers);
        responseJson.put("springBatchServerList", springBatchServersJson);

        httpServletResponse.getWriter().println(responseJson.toJSONString());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        File file = getPropertiesFile("springbatch.properties");
        Properties properties = getProperties(file);
        String server = req.getParameter("server");
        String replaceServer = req.getParameter("replaceServer");

        if ((replaceServer != null && !replaceServer.isEmpty()) && (server != null && !server.isEmpty())) {
            String[] servers = properties.getProperty("springBatchServerList").split(",");
            List<String> serverList = new ArrayList<>(Arrays.asList(servers));
            if (serverList.contains(replaceServer)) {
                serverList.remove(replaceServer);
                serverList.add(server);
            }
            properties.setProperty("springBatchServerList", join(serverList, ","));
            OutputStream out = Files.newOutputStream(file.toPath());
            try (out) {
                properties.store(out, null);
            }
            resp.getWriter().print("updated");
        } else if (server != null && !server.isEmpty()) {
            properties.setProperty("springBatchServerList", properties.getProperty("springBatchServerList") + "," + server);
            OutputStream out = Files.newOutputStream(file.toPath());
            try (out) {
                properties.store(out, null);
            }
            resp.getWriter().print("added");
        } else {
            resp.getWriter().print("failed");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        File file = getPropertiesFile("springbatch.properties");
        Properties properties = getProperties(file);
        String server = req.getParameter("server");
        if (server != null && !server.isEmpty()) {
            String[] servers = properties.getProperty("springBatchServerList").split(",");
            List<String> serverList = new ArrayList<>(Arrays.asList(servers));
            serverList.remove(server);
            properties.setProperty("springBatchServerList", join(serverList, ","));
            OutputStream out = Files.newOutputStream(file.toPath());
            try (out) {
                properties.store(out, null);
            }
            resp.getWriter().print("deleted");
        } else {
            resp.getWriter().print("failed");
        }
    }

    private File getPropertiesFile(String name) {
        URL propsUrl = SpringBatchConfigServlet.class.getClassLoader().getResource(name);
        File file = null;
        try {
            file = new File(Objects.requireNonNull(propsUrl).toURI());
        } catch (URISyntaxException s) {
            LOG.error(s.getMessage());
        }
        return file;
    }

    private Properties getProperties(File file) throws IOException {
        Properties properties = new Properties();
        try (FileInputStream propsIn = new FileInputStream(file)) {
            properties.load(propsIn);
        }
        return properties;
    }

    private String join(List<String> list, String div) {
        StringBuilder buffer = new StringBuilder();
        for (String e : list) {
            buffer.append((list.size() == (list.indexOf(e) + 1)) ? e : e + div);
        }
        return buffer.toString();
    }
}
