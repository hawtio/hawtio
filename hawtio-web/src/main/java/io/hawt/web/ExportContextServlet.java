package io.hawt.web;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static java.lang.System.out;
/**
 * Created with IntelliJ IDEA.
 * User: prashant
 * Date: 26/11/13
 * Time: 2:03 PM
 * To change this template use File | Settings | File Templates.
 */
public class ExportContextServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(ExportContextServlet.class);

    @Override
    protected void doPost(HttpServletRequest httpServletRequest, HttpServletResponse resp) throws ServletException, IOException {
        out.println(" ===================== = jobExecution id ======================== "+httpServletRequest.getParameter("jobExecutionId"));
        String server = httpServletRequest.getParameter("server");
        String jobExecutionId = httpServletRequest.getParameter("jobExecutionId");


        String jsonResponse = "Content not available";
        if((jobExecutionId != null && !jobExecutionId.isEmpty()) && (server != null && !server.isEmpty())){
            server = server.replaceAll("\\\\","");
            if (!server.contains("http://")){
                server = "http://"+server;
            }
            out.println("======= server ======= "+server);
            out.println("======= final url ======= "+server+"jobs/executions/"+jobExecutionId+"/context.json");
            HttpClient client = new HttpClient();
            GetMethod get = new GetMethod(server+"jobs/executions/"+jobExecutionId+"/context.json");
            int reponseCode =  client.executeMethod(get);
            jsonResponse = get.getResponseBodyAsString();
            out.println(" ===== response ====== "+jsonResponse);
            get.releaseConnection();
        }
        resp.setHeader("Content-Disposition","attachment; filename=\"jsonData.txt\"");
        resp.getWriter().println(jsonResponse);
    }
}
