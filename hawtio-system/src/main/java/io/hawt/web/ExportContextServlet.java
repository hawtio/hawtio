package io.hawt.web;

import java.io.IOException;
import java.util.LinkedList;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ExportContextServlet extends HttpServlet {
    public static final String RENDER_JSON_ERROR_MESSAGES = "ERROR_MESSAGES";
    private static final transient Logger LOG = LoggerFactory.getLogger(ExportContextServlet.class);

    @Override
    protected void doGet(HttpServletRequest httpServletRequest, HttpServletResponse resp) throws ServletException, IOException {
        String serverUrl = httpServletRequest.getParameter("server");
        String jobExecutionId = httpServletRequest.getParameter("execId");
        String key = httpServletRequest.getParameter("key");

        String jsonStringResponse = "";
        String exportCsvString = "Content not available";
        if ((serverUrl != null && !serverUrl.isEmpty())) {
            if ((jobExecutionId != null && !jobExecutionId.isEmpty())) {
                jsonStringResponse = executeHttpGetRequest(getServerUrl(serverUrl) + "jobs/executions/" + jobExecutionId + "/execution-context.json");
                JSONObject jsonObject = parseStringToJSON(jsonStringResponse);

                Object entryObject = getEntryObject(jsonObject);
                if (entryObject != null && (entryObject instanceof JSONArray)) {
                    JSONArray entry = (JSONArray) entryObject;
                    JSONObject exportEntry = null;
                    for (Object o : entry) {
                        if (o instanceof JSONObject) {
                            if (((JSONObject) o).get("string").toString().equalsIgnoreCase(key)) {
                                exportEntry = (JSONObject) o;
                                exportCsvString = getCsvData(exportEntry, key);
                            }
                        }
                    }
                } else if (entryObject != null && (entryObject instanceof JSONObject)) {
                    JSONObject entry = (JSONObject) entryObject;
                    if (entry.get("string").toString().equalsIgnoreCase(key)) {
                        JSONObject exportEntry = (JSONObject) entry.get("string");
                        exportCsvString = getCsvData(exportEntry, key);
                    }
                }
            }
        }
        resp.setHeader("Content-Disposition", "attachment; filename=\"jsonData.csv\"");
        resp.getWriter().println(exportCsvString);
    }

    @Override
    protected void doPost(HttpServletRequest httpServletRequest, HttpServletResponse resp) throws ServletException, IOException {
        String serverUrl = httpServletRequest.getParameter("server");
        String jobExecutionId = httpServletRequest.getParameter("execId");
        String stepId = httpServletRequest.getParameter("stepId");
        String entryIndex = httpServletRequest.getParameter("entryIndex");

        String jsonStringResponse;
        String exportCsvString = "Content not available";
        if ((serverUrl != null && !serverUrl.isEmpty())) {
            if ((jobExecutionId != null && !jobExecutionId.isEmpty())) {
                if (stepId != null && !stepId.isEmpty()) {
                    jsonStringResponse = executeHttpGetRequest(getServerUrl(serverUrl) + "jobs/executions/" + jobExecutionId + "/steps/" + stepId + "/execution-context.json");
                } else {
                    jsonStringResponse = executeHttpGetRequest(getServerUrl(serverUrl) + "jobs/executions/" + jobExecutionId + "/execution-context.json");
                }
                JSONObject jsonObject = parseStringToJSON(jsonStringResponse);
                Object entryObject = (stepId != null && !stepId.isEmpty()) ? getEntryObject(jsonObject, "stepExecutionContext") : getEntryObject(jsonObject);
                if (entryObject != null && (entryObject instanceof JSONArray)) {
                    JSONArray entry = (JSONArray) entryObject;
                    Object exportEntryObject = entry.get(Integer.parseInt(entryIndex));

                    if (exportEntryObject instanceof JSONObject) {
                        String key = ((JSONObject) exportEntryObject).get("string").toString();
                        exportCsvString = getCsvData(((JSONObject) exportEntryObject), key);
                    }

                }
            }
        }
        resp.setHeader("Content-Disposition", "attachment; filename=\"jsonData.csv\"");
        resp.getWriter().println(exportCsvString);
    }

    private String getCsvData(JSONObject exportEntry, String key) {
        if ((exportEntry.get("list") != null) && (exportEntry.get("list") instanceof JSONObject)) {
            JSONObject obj = (JSONObject) exportEntry.get("list");
            JSONArray exportArray = (JSONArray) new LinkedList(obj.values()).getFirst();
            Map xlData = (key.equalsIgnoreCase(RENDER_JSON_ERROR_MESSAGES)) ? ServletHelpers.populateErrorTableMapForXl(exportArray) : ServletHelpers.populateTableMapForXl(exportArray);
            return ServletHelpers.generateCsvString(xlData);
        } else return "Content not available";
    }

    private String executeHttpGetRequest(String url) throws IOException {
        String jsonStringResponse;
        HttpClient client = new HttpClient();
        GetMethod get = new GetMethod(url);
        int reponseCode = client.executeMethod(get);
        jsonStringResponse = get.getResponseBodyAsString();
        get.releaseConnection();
        return jsonStringResponse;
    }

    private JSONObject parseStringToJSON(String source) {
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = null;
        try {
            jsonObject = (JSONObject) parser.parse(source);
        } catch (Exception pe) {
            LOG.error(pe.getMessage());
            return jsonObject;
        }
        return jsonObject;
    }

    private Object getEntryObject(JSONObject jsonObject, String contextType) {
        contextType = (contextType != null && !contextType.isEmpty()) ? contextType : "jobExecutionContext";
        JSONObject jobExecutionContext = (JSONObject) jsonObject.get(contextType);
        JSONObject contextObject = (JSONObject) jobExecutionContext.get("context");
        if (contextObject.get("map") != null && (contextObject.get("map") instanceof JSONObject)) {
            return ((JSONObject) contextObject.get("map")).get("entry");
        }
        return null;
    }

    private Object getEntryObject(JSONObject jsonObject) {
        return getEntryObject(jsonObject, null);
    }

    private String getServerUrl(String serverUrl) {
        serverUrl = serverUrl.replaceAll("\\\\", "");
        if (!serverUrl.contains("http://")) {
            serverUrl = "http://" + serverUrl;
        }
        return serverUrl;
    }
}