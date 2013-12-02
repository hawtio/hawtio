package io.hawt.web;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

import static java.lang.System.out;

public class ContextFormatterServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter pr=resp.getWriter();
        String server=req.getParameter("server");
        String jobExecutionId=req.getParameter("jobExecutionId");
        String jsonStringResponse="";
        server= server.replaceAll("\\\\","");
        if (!server.contains("http://")){
            server = "http://"+server;
        }

        HttpClient client = new HttpClient();
        GetMethod get = new GetMethod(server+"jobs/executions/"+jobExecutionId+"/context.json");
        int responseCode =  client.executeMethod(get);
        jsonStringResponse = get.getResponseBodyAsString();
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = null;
        try{
            jsonObject = (JSONObject)parser.parse(jsonStringResponse);
            JSONObject jobExecutionContext = (JSONObject)jsonObject.get("jobExecutionContext");
            JSONObject contextObject = (JSONObject)jobExecutionContext.get("context");
            if(contextObject.get("map") != null && (contextObject.get("map") instanceof JSONObject)){
                JSONObject mapObject = (JSONObject)contextObject.get("map");
                if(mapObject.get("entry") instanceof ArrayList){
                 pr.println(getHtmlView((JSONArray) mapObject.get("entry")));
                }else if(mapObject.get("entry") instanceof Map){

                }
            }

        }catch (Exception e){e.printStackTrace();}
    }

    private String getHtmlView(ArrayList entries){
        StringBuffer htmlView=new StringBuffer();
        if(entries!=null){
            Integer index=0;
            for (Object entry : entries) {
                if(entry instanceof Map){
                    htmlView.append("<div class=\"accordion\" id=\"accordion"+index+"\">")
                            .append("            <div class=\"accordion-group\">")
                            .append("                <div class=\"accordion-heading\">")
                            .append("                    <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion"+index+"\" href=\"#collapseOne"+index+"\">")
                            .append("                        Open/Close </a>")
                            .append("                </div>")
                            .append("                <div id=\"collapseOne"+index+"\" class=\"accordion-body collapse in\">")
                            .append("                    <div class=\"accordion-inner\">");


                    for(Object o:((Map)entry).entrySet()){

                        if(((Map.Entry)o).getKey().toString().equals("string")){
                            htmlView.append(((Map.Entry)o).getValue().toString());
                        }else if(((Map.Entry)o).getKey().toString().equals("int")){
                            htmlView.append(((Map.Entry)o).getValue().toString());
                        }else if(((Map.Entry)o).getKey().toString().equals("list")){
                            JSONObject jsonObject = (JSONObject)((Map.Entry)o).getValue();
                            LinkedList list = new LinkedList(jsonObject.values());
                            ArrayList requiredObj = (ArrayList)list.getFirst();
                            htmlView.append("<table class=\"table\"><thead><tr>");
                            Map columnsAndRow= ServletHelpers.populateTableMapForXl(requiredObj);
                            Set columns=(Set)columnsAndRow.get("columns");
                            List rows=(List)columnsAndRow.get("rows");
                            for(Object th : columns){
                                htmlView.append("<th>"+th.toString()+"</th>");
                            }
                            htmlView.append("</tr>");

                            for(Object obj : rows){
                                    htmlView.append("<tr>");
                                    for(Object row : ((Map)obj).entrySet()){
                                        htmlView.append("<td>"+((Map.Entry)row).getValue().toString()+"</td>");
                                    }
                                    htmlView.append("</tr>");
                            }
                            htmlView.append("</thead></table>");
                        }

                        index++;
                    }
                    htmlView.append("</div></div></div></div>");
                }
            }
        }

        return htmlView.toString();
    }
}
