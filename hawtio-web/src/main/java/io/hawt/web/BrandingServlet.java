package io.hawt.web;

import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.AttributeNotFoundException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

/**
 * @author Stan Lewis
 */
public class BrandingServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(BrandingServlet.class);

    List<String> propertiesToCheck = new ArrayList<String>();
    List<String> wantedStrings = new ArrayList<String>();
    boolean forceBranding;
    boolean useBranding = true;
    String profile;
    Converters converters = new Converters();
    JsonConvertOptions options = JsonConvertOptions.DEFAULT;


    @Override
    public void init(ServletConfig config) throws ServletException {

        propertiesToCheck.add("karaf.version");

        wantedStrings.add("redhat");
        wantedStrings.add("fuse");

        forceBranding = Boolean.parseBoolean(System.getProperty("hawtio.forceBranding", "false"));
        useBranding = Boolean.parseBoolean(System.getProperty("hawtio.useBranding", "true"));
        profile = System.getProperty("profile");

        super.init(config);
    }


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Map<String, String> answer = new HashMap<String, String>();

        answer.put("profile", profile);
        answer.put("enable", enableBranding().toString());

        response.setContentType("application/json");
        final PrintWriter out = response.getWriter();

        Object result = null;

        try {
            result = converters.getToJsonConverter().convertToJson(answer, null, options);
        } catch (AttributeNotFoundException e) {
            LOG.warn("Failed to convert plugin list to json", e);
        }

        if (result != null) {
            out.write(result.toString());
            out.flush();
            out.close();
        } else {
            out.write("{ \"enable\":\"false\"}");
        }

    }

    private Boolean enableBranding() {

        if (forceBranding) {
            return true;
        }

        if (!useBranding) {
            return false;
        }

        Properties systemProperties = System.getProperties();
        List<String> hits = new ArrayList<String>();

        for (String property : propertiesToCheck) {
            if (systemProperties.containsKey(property)) {
                hits.add(property);
            }
        }

        for (String property : hits) {
            String value = systemProperties.getProperty(property);
            if (value != null) {
                for (String wanted : wantedStrings) {
                    if (value.contains(wanted)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private void writeTrue(PrintWriter out) {
        writeValue(out, true);
    }

    private void writeFalse(PrintWriter out) {
        writeValue(out, false);
    }

    private void writeValue(PrintWriter out, boolean value) {
        out.write(Boolean.valueOf(value).toString());
        out.flush();
        out.close();
    }

}
