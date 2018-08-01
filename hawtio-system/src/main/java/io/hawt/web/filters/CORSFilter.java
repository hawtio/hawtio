package io.hawt.web.filters;

import java.util.concurrent.TimeUnit;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CORSFilter extends HttpHeaderFilter {

    @Override
    protected void addHeaders(HttpServletRequest request, HttpServletResponse response) {
        if (!allowAny()) {
            return;
        }
        if ("OPTIONS".equals(request.getMethod())) {
            response.addHeader("Access-Control-Request-Method", "GET, POST, PUT, DELETE");
            String headers = request.getHeader("Access-Control-Request-Headers");
            if (headers != null) {
                response.addHeader("Access-Control-Allow-Headers", headers);
            }
            response.addHeader("Access-Control-Max-Age", "" + TimeUnit.DAYS.toSeconds(1));
        }
        response.addHeader("Access-Control-Allow-Origin", "*");
    }

    protected boolean allowAny() {
        // TODO allow configuration...
        return true;
    }
}
