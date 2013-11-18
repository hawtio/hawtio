package io.hawt.web;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static java.lang.System.out;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Created with IntelliJ IDEA.
 * User: prashant
 * Date: 13/11/13
 * Time: 3:02 PM
 * To change this template use File | Settings | File Templates.
 */
public class SpringBatchConfigServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(SpringBatchConfigServlet.class);

    @Override
    public void doGet(HttpServletRequest httpServletRequest,
                      HttpServletResponse httpServletResponse) throws IOException, ServletException {

        InputStream propsIn = SpringBatchConfigServlet.class.getClassLoader().getResourceAsStream("springbatch.properties");
        Properties properties = new Properties();
        properties.load(propsIn);
        JSONObject responseJson = new JSONObject();
        JSONArray springBatchServersJson = new JSONArray();
        List<? extends String> springBatchServers = Arrays.asList(properties.getProperty("springBatchServerList").split(","));
        springBatchServersJson.addAll(springBatchServers);
        responseJson.put("springBatchServerList",springBatchServersJson);
        String res = "success";

        httpServletResponse.setHeader("Content-type","application/json");
        httpServletResponse.getWriter().println(responseJson.toJSONString());
    }


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        URL propsUrl = SpringBatchConfigServlet.class.getClassLoader().getResource("springbatch.properties");
        File file = null;
        try{
            file = new File(propsUrl.toURI());
        }catch (URISyntaxException s){
            LOG.error(s.getMessage());
        }
        FileInputStream propsIn = new FileInputStream(file);
        Properties properties = new Properties();
        properties.load(propsIn);

        String server = req.getParameter("server");
        if(server != null && !server.isEmpty()){
            properties.setProperty("springBatchServerList",properties.getProperty("springBatchServerList")+","+server);
            properties.store(new FileOutputStream(file),null);
            resp.getWriter().print("updated");
        }
        else {
            resp.getWriter().print("failed");
        }
    }
}
