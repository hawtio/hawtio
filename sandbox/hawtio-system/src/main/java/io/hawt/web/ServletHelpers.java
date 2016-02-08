package io.hawt.web;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.management.AttributeNotFoundException;

import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 */
public class ServletHelpers {

    private static final transient Logger LOG = LoggerFactory.getLogger(ServletHelpers.class);

    static void writeEmpty(PrintWriter out) {
        out.write("{}");
        out.flush();
        out.close();
    }

    static void writeObject(Converters converters, JsonConvertOptions options, PrintWriter out, Object answer) {
        Object result = null;

        try {
            result = converters.getToJsonConverter().convertToJson(answer, null, options);
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
        Map<String, Object> xlData = new HashMap<String, Object>();
        Set columns = getColumns(listEntry);
        List rowsData = getRowsData(listEntry, columns);

        xlData.put("columns", columns);
        xlData.put("rows", rowsData);
        return xlData;
    }


    public static Map populateErrorTableMapForXl(List listEntry) {
        listEntry = flatten(listEntry);

        Map<String, Object> xlData = new HashMap<String, Object>();
        Set<String> columns = new HashSet<String>();
        columns.add("Error Message");
        List rowsData = new ArrayList();
        for (Object o : listEntry) {
            Map<String, Object> keyValuePairs = new HashMap<String, Object>();
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
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        for (Object o : listEntry) {
            Map<String, Object> keyValuePairs = new HashMap<String, Object>();
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
