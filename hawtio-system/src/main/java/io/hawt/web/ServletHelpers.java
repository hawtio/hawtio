package io.hawt.web;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.management.AttributeNotFoundException;
import javax.servlet.http.HttpServletResponse;

import io.hawt.system.Authenticator;
import io.hawt.util.IOHelper;
import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helpers for servlet
 */
public class ServletHelpers {

    private static final transient Logger LOG = LoggerFactory.getLogger(ServletHelpers.class);

    private static final String HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";

    public static void doForbidden(HttpServletResponse response) {
        doForbidden(response, ForbiddenReason.NONE);
    }

    public static void doForbidden(HttpServletResponse response, ForbiddenReason reason) {
        try {
            byte[] contentBytes = new JSONObject().put("reason", reason).toString().getBytes("UTF-8");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setContentLength(contentBytes.length);
            response.getOutputStream().write(contentBytes);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send forbidden response: {}", ioe);
        }
    }

    public static void doAuthPrompt(String realm, HttpServletResponse response) {
        // request authentication
        try {
            response.setHeader(HEADER_WWW_AUTHENTICATE, Authenticator.AUTHENTICATION_SCHEME_BASIC + " realm=\"" + realm + "\"");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentLength(0);
            response.flushBuffer();
        } catch (IOException ioe) {
            LOG.debug("Failed to send auth response: {}", ioe);
        }
    }

    public static JSONObject readObject(BufferedReader reader) throws IOException {
        String data = IOHelper.readFully(reader);
        return new JSONObject(data);
    }

    public static void writeEmpty(PrintWriter out) {
        out.write("{}");
        out.flush();
        out.close();
    }

    public static void writeObject(Converters converters, JsonConvertOptions options, PrintWriter out, Object data) {
        Object result = null;

        try {
            result = converters.getToJsonConverter().convertToJson(data, null, options);
        } catch (AttributeNotFoundException e) {
            LOG.warn("Failed to convert object to json", e);
        }

        if (result != null) {
            out.write(result.toString());
            out.flush();
            out.close();
        } else {
            writeEmpty(out);
        }
    }

    public static Map populateTableMapForXl(List listEntry) {
        listEntry = flatten(listEntry);
        Map<String, Object> xlData = new HashMap<>();
        Set columns = getColumns(listEntry);
        List rowsData = getRowsData(listEntry, columns);

        xlData.put("columns", columns);
        xlData.put("rows", rowsData);
        return xlData;
    }


    public static Map populateErrorTableMapForXl(List listEntry) {
        listEntry = flatten(listEntry);

        Map<String, Object> xlData = new HashMap<>();
        Set<String> columns = new HashSet<>();
        columns.add("Error Message");
        List rowsData = new ArrayList();
        for (Object o : listEntry) {
            Map<String, Object> keyValuePairs = new HashMap<>();
            keyValuePairs.put(columns.toArray()[0].toString(), removeNoisyString(o.toString()));
            rowsData.add(keyValuePairs);
        }
        xlData.put("columns", columns);
        xlData.put("rows", rowsData);
        return xlData;
    }

    private static Set getColumns(List listEntry) {
        Set set = new HashSet();
        for (Object o : listEntry) {
            if (o instanceof JSONObject) {
                set.addAll(((JSONObject) o).keySet());
            }
        }
        return set;
    }


    private static List getRowsData(List listEntry, Set columns) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object o : listEntry) {
            Map<String, Object> keyValuePairs = new HashMap<>();
            if (o instanceof JSONObject) {
                JSONObject jsonObject = (JSONObject) o;
                for (Object column : columns) {
                    Object value = removeNoisyString(jsonObject.get(column.toString()));
                    keyValuePairs.put(column.toString(), value);
                }
            }
            list.add(keyValuePairs);
        }
        return list;
    }


    public static String generateCsvString(Map xlData) {
        int idx1 = 0, idx2 = 0;
        StringBuffer buffer = new StringBuffer();
        Set columns = (Set) xlData.get("columns");
        List rows = (List) xlData.get("rows");
        for (Object column : columns) {
            buffer.append(wrapWithDoubleQuotes(column.toString()));
            buffer = appendComma(buffer, columns.size(), idx1);
            idx1++;
        }
        idx1 = 0;

        buffer.append("\n");
        for (Object row : rows) {
            Map keyValuePair = (Map) row;
            for (Object column : columns) {
                buffer.append(wrapWithDoubleQuotes(keyValuePair.get(column.toString()).toString()));
                buffer = appendComma(buffer, columns.size(), idx2);
                idx2++;
            }
            idx2 = 0;
            buffer.append("\n");
        }
        return buffer.toString();
    }

    private static String wrapWithDoubleQuotes(String string) {
        return "\"" + string + "\"";
    }

    private static StringBuffer appendComma(StringBuffer buffer, int size, int index) {
        return (size == (index + 1)) ? buffer : buffer.append(",");
    }

    public static List flatten(List list) {
        List tempList = new ArrayList();
        for (Object o : list) {
            if (o instanceof Collection) {
                tempList.addAll((Collection) o);
            } else tempList.add(o);
        }
        return tempList;
    }

    public static Set flatten(Set set) {
        Set tempSet = new HashSet();
        for (Object o : tempSet) {
            if (o instanceof Collection) {
                tempSet.addAll((Collection) o);
            } else tempSet.add(o);
        }
        return tempSet;
    }

    public static String removeNoisyString(Object value) {
        String string = "";
        if (value != null) {
            string = (value.toString().contains("@reference")) ? "" : value.toString();
        }
        return string;
    }
}
