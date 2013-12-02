package io.hawt.web;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
/**
 * Created with IntelliJ IDEA.
 * User: prashant
 * Date: 26/11/13
 * Time: 2:03 PM
 * To change this template use File | Settings | File Templates.
 */
public class ExportContextServlet extends HttpServlet {
    public static final String RENDER_JSON_ERROR_MESSAGES = "ERROR_MESSAGES";
    private static final transient Logger LOG = LoggerFactory.getLogger(ExportContextServlet.class);

    @Override
    protected void doGet(HttpServletRequest httpServletRequest, HttpServletResponse resp) throws ServletException, IOException {
        String server = httpServletRequest.getParameter("server");
        String jobExecutionId = httpServletRequest.getParameter("execId");
        String key = httpServletRequest.getParameter("key");

        String jsonStringResponse = "Content not available";
        if((server != null && !server.isEmpty())){
            if((jobExecutionId != null && !jobExecutionId.isEmpty())){
                server = server.replaceAll("\\\\","");
                if (!server.contains("http://")){
                    server = "http://"+server;
                }

                HttpClient client = new HttpClient();
                GetMethod get = new GetMethod(server+"jobs/executions/"+jobExecutionId+"/context.json");
                int reponseCode =  client.executeMethod(get);
                jsonStringResponse = get.getResponseBodyAsString();
                JSONParser parser = new JSONParser();

                JSONObject jsonObject = null;
                try{
                    jsonObject = (JSONObject)parser.parse(jsonStringResponse);
                    JSONObject jobExecutionContext = (JSONObject)jsonObject.get("jobExecutionContext");
                    JSONObject contextObject = (JSONObject)jobExecutionContext.get("context");
                    if(contextObject.get("map") != null && (contextObject.get("map") instanceof JSONObject)){
                        JSONObject mapObject = (JSONObject)contextObject.get("map");

                        if(mapObject.get("entry") != null && (mapObject.get("entry") instanceof JSONArray)){
                            JSONArray entryObject = (JSONArray)mapObject.get("entry");
                            JSONObject exportEntry = null;
                            for(Object o : entryObject){
                                if (o instanceof JSONObject){
                                    if (((JSONObject)o).get("string").toString().equalsIgnoreCase(key)){
                                        exportEntry = (JSONObject)o;
                                        jsonStringResponse = getCsvData(exportEntry, key);
                                    }
                                }
                            }
                        }else if(mapObject.get("entry") != null && (mapObject.get("entry") instanceof JSONObject)){
                            JSONObject entryObject = (JSONObject)mapObject.get("entry");
                            if(entryObject.get("string").toString().equalsIgnoreCase(key)){
                                JSONObject exportEntry = (JSONObject)mapObject.get("string");
                                jsonStringResponse = getCsvData(exportEntry, key);
                            }
                        }
                    }

                }catch(ParseException pe){
                    LOG.error(pe.getMessage());
                }
                get.releaseConnection();
            }
        }
        resp.setHeader("Content-Disposition","attachment; filename=\"jsonData.csv\"");
        resp.getWriter().println(jsonStringResponse);
    }

    private String getCsvData(JSONObject exportEntry, String key){
        if((exportEntry.get("list") != null)&&(exportEntry.get("list") instanceof JSONObject)){
            JSONObject obj = (JSONObject)exportEntry.get("list");
            JSONArray exportArray =  (JSONArray)new LinkedList(obj.values()).getFirst();
            Map xlData = (key.equalsIgnoreCase(RENDER_JSON_ERROR_MESSAGES))?ServletHelpers.populateErrorTableMapForXl(exportArray):ServletHelpers.populateTableMapForXl(exportArray);
            return ServletHelpers.generateCsvString(xlData);
        }else return "Content not available";
    }
}