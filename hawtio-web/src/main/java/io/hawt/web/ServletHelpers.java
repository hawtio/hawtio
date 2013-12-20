package io.hawt.web;

import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.AttributeNotFoundException;
import java.io.PrintWriter;

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
}
