package io.hawt.web;

import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.AttributeNotFoundException;
import java.io.PrintWriter;
import java.util.*;

/**
 * @author Stan Lewis
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
        Map xlData = new HashMap();
        List columns=null;
        List rowsData = new ArrayList();

        return null;
    }

    public static List flatten(List list){
        List tempList = new ArrayList();
        for(Object o : list){
            if (o instanceof Collection){
                tempList.addAll((Collection)o);
            }else tempList.add(o);
        }
        return tempList;
    }

    public static Set flatten(Set set){
        Set tempSet = new HashSet();
        for(Object o : tempSet){
            if (o instanceof Collection){
                tempSet.addAll((Collection)o);
            }else tempSet.add(o);
        }
        return tempSet;
    }

    public static String removeNoisyString(Object value) {
        String string = "";
        if (value != null) {
            string = (value.toString().contains("@reference")) ?"":value.toString();
        }
        return string;
    }
}
