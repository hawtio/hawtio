package io.hawt.web;

import java.io.PrintWriter;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import javax.security.auth.Subject;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.binary.Base64;

public class LoginTokenServlet extends LoginServlet {

    private static final long serialVersionUID = 1L;

    public static final String LOGIN_TOKEN = "LoginToken";

    @Override
    protected void sendResponse(HttpSession session, Subject subject, PrintWriter out) {

        String token = (String) session.getAttribute(LOGIN_TOKEN);

        if (token == null) {
            byte[] seed = (subject.toString() + Long.toString(System.currentTimeMillis())).getBytes();
            SecureRandom random = new SecureRandom(seed);
            byte[] tokenBytes = new byte[128];
            random.nextBytes(tokenBytes);
            token = Base64.encodeBase64String(tokenBytes);
            session.setAttribute(LOGIN_TOKEN, token);
        }

        Map<String, String> answer = new HashMap<String, String>();
        answer.put("token", token);

        ServletHelpers.writeObject(converters, options, out, answer);
    }

}
