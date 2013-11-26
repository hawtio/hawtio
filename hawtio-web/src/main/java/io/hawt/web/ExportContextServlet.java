package io.hawt.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

import static java.lang.System.out;
/**
 * Created with IntelliJ IDEA.
 * User: prashant
 * Date: 26/11/13
 * Time: 2:03 PM
 * To change this template use File | Settings | File Templates.
 */
public class ExportContextServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(ExportContextServlet.class);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Content-Disposition","attachment; filename=\"jsonData.txt\"");
        for(Object o : req.getParameterMap().entrySet()){
            Map.Entry e = (Map.Entry)o;
            out.println(" ======= key ===== "+e.getKey()+" ========= value  ========== "+e.getValue()+" ============== ");
            resp.getWriter().println(" ======= key ===== "+e.getKey()+" ========= value  ========== "+e.getValue()+" ============== ");
        }
        out.println(" ===================== = Post ======================== ");
    }
}
