package io.hawt.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class ContextFormatterServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter pr = resp.getWriter();
        String server = req.getParameter("server");
        String jobExecutionId = req.getParameter("jobExecutionId");
        String stepExecutionId = req.getParameter("stepExecutionId");
        String contextType = req.getParameter("contextType");
        String jsonStringResponse = "";
        String url = "";
        String paramString = "jobExecutionContext";
        server = server.replaceAll("\\\\", "");
        if (!server.contains("http://")) {
            server = "http://" + server;
        }

        if (contextType.equals("jobExecution")) {
            url = server + "jobs/executions/" + jobExecutionId + "/execution-context.json";
            paramString = "jobExecutionContext";
        } else if (contextType.equals("stepExecution")) {
            url = server + "jobs/executions/" + jobExecutionId + "/steps/" + stepExecutionId + "/execution-context.json";
            paramString = "stepExecutionContext";
        }
        HttpClient client = new HttpClient();
        GetMethod get = new GetMethod(url);
        int responseCode = client.executeMethod(get);
        jsonStringResponse = get.getResponseBodyAsString();
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = null;
        try {
            jsonObject = (JSONObject) parser.parse(jsonStringResponse);
            JSONObject jobExecutionContext = (JSONObject) jsonObject.get(paramString);
            JSONObject contextObject = (JSONObject) jobExecutionContext.get("context");
            if (contextObject.get("map") != null && (contextObject.get("map") instanceof JSONObject)) {
                JSONObject mapObject = (JSONObject) contextObject.get("map");
                if (mapObject.get("entry") instanceof ArrayList) {
                    pr.println(getHtmlView((JSONArray) mapObject.get("entry"), server, jobExecutionId, stepExecutionId));
                } else if (mapObject.get("entry") instanceof Map) {

                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String getHtmlView(ArrayList entries, String server, String jobExecutionId, String stepExecutionId) {
        StringBuffer htmlView = new StringBuffer();
        String errorMessageKey = "";
        String ERROR_MESSAGES = "ERROR_MESSAGES";
        if (entries != null) {
            int entryIdx = 0;
            Integer index = 0;
            for (Object entry : entries) {

                if (entry instanceof Map) {
                    htmlView.append("<div class=\"accordion\" id=\"accordion" + index + "\">")
                            .append("            <div class=\"accordion-group\">")
                            .append("                <div class=\"accordion-heading\">")
                            .append("                    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion" + index + "\" href=\"#collapseOne" + index + "\">")
                            .append("                        Open/Close </a>")
                            .append("                </div>")
                            .append("                <div id=\"collapseOne" + index + "\" class=\"accordion-body collapse in\">")
                            .append("                    <div class=\"accordion-inner\">");


                    for (Object o : ((Map) entry).entrySet()) {
                        if (((Map.Entry) o).getKey().toString().equals("string")) {
                            errorMessageKey = ((Map.Entry) o).getValue().toString();
                            htmlView.append(((Map.Entry) o).getValue().toString());
                            if (isListPresent((JSONObject) entry)) {
                                htmlView.append("<span class=\"pull-right\">" + getExportLink(server, jobExecutionId, stepExecutionId, entryIdx) + "</span>");
                            }
                        } else if (((Map.Entry) o).getKey().toString().equals("int")) {
                            htmlView.append(((Map.Entry) o).getValue().toString());
                        } else if (((Map.Entry) o).getKey().toString().equals("list")) {
                            JSONObject jsonObject = (JSONObject) ((Map.Entry) o).getValue();
                            LinkedList list = new LinkedList(jsonObject.values());
                            ArrayList requiredObj = (ArrayList) list.getFirst();
                            htmlView.append("<table class=\"table\"><thead><tr>");
                            Map columnsAndRow;
                            if (errorMessageKey.equals(ERROR_MESSAGES)) {
                                columnsAndRow = ServletHelpers.populateErrorTableMapForXl(requiredObj);
                            } else {
                                columnsAndRow = ServletHelpers.populateTableMapForXl(requiredObj);
                            }
                            Set columns = (Set) columnsAndRow.get("columns");
                            List rows = (List) columnsAndRow.get("rows");
                            for (Object th : columns) {
                                htmlView.append("<th>");
                                if (th.toString().length() > 5) {
                                    htmlView.append(th.toString().substring(0, 5));
                                } else {
                                    htmlView.append(th.toString());
                                }
                                htmlView.append("</th>");
                            }
                            htmlView.append("</tr>");

                            for (Object obj : rows) {
                                htmlView.append("<tr>");
                                for (Object column : columns) {
                                    htmlView.append("<td>" + ((Map) obj).get(column.toString()).toString() + "</td>");
                                }

                                htmlView.append("</tr>");
                            }
                            htmlView.append("</thead></table>");
                        } else if (!((Map.Entry) o).getKey().toString().equals("string") || !((Map.Entry) o).getKey().toString().equals("list") || ((Map.Entry) o).getKey().toString().equals("int")) {
                            htmlView.append(((Map.Entry) o).getValue().toString());
                        }

                        index++;
                    }
                    htmlView.append("</div></div></div></div>");
                }
                entryIdx++;
            }
        }

        return htmlView.toString();
    }

    private String getExportLink(String springBatchServer, String jobExecutionId, String stepExecutionId, int index) {
        StringBuilder builder = new StringBuilder();
        builder.append("<form action=\"/hawtio/exportContext\" method=\"POST\">")
                .append("<input type=\"hidden\" name=\"server\" value=\"").append(springBatchServer).append("\">")
                .append("<input type=\"hidden\" name=\"execId\" value=\"").append(jobExecutionId).append("\">");

        if (stepExecutionId != null && !stepExecutionId.isEmpty())
            builder.append("<input type=\"hidden\" name=\"stepId\" value=\"").append(stepExecutionId).append("\">");

        builder.append("<input type=\"hidden\" name=\"entryIndex\" value=\"").append(index).append("\">")
                .append("<input type=\"submit\" value=\"Export as CSV\" class=\"btn btn-info\">")
                .append("</form>");
        return builder.toString();
    }

    private boolean isListPresent(JSONObject entry) {
        return entry.keySet().contains("list");
    }
}