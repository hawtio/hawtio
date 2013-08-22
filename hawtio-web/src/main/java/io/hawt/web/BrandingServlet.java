package io.hawt.web;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * @author Stan Lewis
 */
public class BrandingServlet extends HttpServlet {

    List<String> propertiesToCheck = new ArrayList<String>();
    List<String> wantedStrings = new ArrayList<String>();
    boolean forceBranding;
    boolean useBranding = true;

    @Override
    public void init(ServletConfig config) throws ServletException {

        propertiesToCheck.add("karaf.version");

        wantedStrings.add("redhat");
        wantedStrings.add("fuse");

        forceBranding = Boolean.parseBoolean(System.getProperty("hawtio.forceBranding", "false"));
        useBranding = Boolean.parseBoolean(System.getProperty("hawtio.useBranding", "true"));

        super.init(config);
    }


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        final PrintWriter out = response.getWriter();

        if (forceBranding) {
            writeTrue(out);
            return;
        }

        if (!useBranding) {
            writeFalse(out);
            return;
        }

        Properties systemProperties = System.getProperties();
        System.out.println("System properties: " + systemProperties);
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
                        writeTrue(out);
                    }
                }
            }
        }

        writeFalse(out);
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
