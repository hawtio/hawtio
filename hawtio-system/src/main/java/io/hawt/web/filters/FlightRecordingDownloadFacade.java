package io.hawt.web.filters;

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * I emulate a non-existing operation  jdk.management.jfr:type=FlightRecorder/downloadRecording(long)
 * executing a sequence of jolokia calls to methods on the FlightRecorder MBean
 * in order to continously write to the clients stream
 * This is important as flight recording files may be huge
 */
public class FlightRecordingDownloadFacade implements Filter {

    private static final Pattern recordingPattern=Pattern.compile(".*exec/jdk.management.jfr:type=FlightRecorder/(downloadRecording\\(long\\)/)(\\d+).*");

    /**
     * Return whether the request might be for downloading a flight recording
     */
    private static boolean isFlightRecordingRequest(ServletRequest request){
        if( request instanceof HttpServletRequest) {
            HttpServletRequest req= (HttpServletRequest) request;
            if(!req.getMethod().equalsIgnoreCase("GET")) {
                return false;
            }
            return recordingPattern.matcher(req.getRequestURI()).find();
        }
        return false;
    }

    @Override
    public void init(FilterConfig filterConfig) {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
        FilterChain chain) throws IOException, ServletException {
        if(isFlightRecordingRequest(request)){
            downloadFlightRecording(request, response, chain);
        } else {
            chain.doFilter(request, response);
        }
    }

    private void downloadFlightRecording(ServletRequest request, ServletResponse response,
        FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req=(HttpServletRequest)request;

        Matcher matcher = recordingPattern.matcher(req.getRequestURI());

        if(!matcher.find()){
            throw new ServletException("Unable to find flightrecorder information in URL " + req.getRequestURI());
        }

        String recordingNumber=matcher.group(2);
        String replacementPattern=matcher.group(1)+recordingNumber;

        //STEP 1: Open stream
        final long stream = openStream((HttpServletResponse) response, chain, req, recordingNumber, replacementPattern);

        ((HttpServletResponse) response).setHeader("Content-Disposition", "attachment; filename=\"recording" + recordingNumber + ".jfr\"");

        //Would expect all kinds of buffering in the stack, but writes were proven slow in some tests so buffer
        //just to be sure
        OutputStream destination=new BufferedOutputStream(response.getOutputStream());
        //STEP 2: Read stream until empty
        //noinspection StatementWithEmptyBody
        while(readData((HttpServletResponse) response, chain, req, replacementPattern, stream, destination)) {
        }

        try {
            // STEP 3: Close stream (best effort)
            chain.doFilter(new StandinRequest(req, replacementPattern, "closeStream(long)/"+stream), new DerivedResponse((HttpServletResponse) response));

        }catch (Exception ignore) {
        }


    }

    @SuppressWarnings("unchecked")
    private boolean readData(HttpServletResponse response, FilterChain chain, HttpServletRequest req,
        String replacementPattern, long stream, OutputStream destination) throws IOException, ServletException {
        DerivedResponse readResponse = new DerivedResponse(response);
        chain.doFilter(new StandinRequest(req, replacementPattern, "readStream(long)/"+ stream), readResponse);
        Object data=readResponse.interpretResponse();
        if(data==null){
            destination.flush();
            return false;
        }
        if(!(data instanceof JSONArray)) {
            throw new ServletException("Response did not contain expected data");
        }
        for (Number number:(Collection<Number>)data
        ) {
            destination.write(number.byteValue());
        }
        return true;
    }

    private long openStream(HttpServletResponse response, FilterChain chain, HttpServletRequest req,
        String recordingNumber, String replacementPattern) throws IOException, ServletException {
        DerivedResponse openResponse = new DerivedResponse(response);
        chain.doFilter(new StandinRequest(req,
            replacementPattern, "openStream(long,javax.management.openmbean.TabularData)/"+ recordingNumber
            +"/" + emptyMapArgument(req)), openResponse);
        Object streamRef = openResponse.interpretResponse();
        if(!(streamRef instanceof Number)) {
            throw new ServletException("Response did not contain stream reference");
        }
        return ((Number)streamRef).longValue();
    }

    private String emptyMapArgument(HttpServletRequest req) {
        //since proxy URLs must be valid, encode these characters
        //but for local jolokia use as is
        String emptyMap="{}";
        if("/proxy".equals(req.getServletPath())) {
            emptyMap="%7B%7D";
        }
        return emptyMap;
    }

    @Override
    public void destroy() {

    }

    static class StandinRequest extends HttpServletRequestWrapper {

        private final String replaceFrom;
        private final String replaceTo;

        /**
         * Constructs a request object wrapping the given request.
         */
        public StandinRequest(HttpServletRequest request, final String replaceFrom, final String replaceTo) {
            super(request);
            this.replaceFrom=replaceFrom;
            this.replaceTo=replaceTo;
        }

        private String replaceInPath(String servletPath) {
            return servletPath == null ? null : servletPath.replace(this.replaceFrom, this.replaceTo);
        }

        @Override
        public StringBuffer getRequestURL() {
            return new StringBuffer(replaceInPath(super.getRequestURL().toString()));
        }

        @Override
        public String getRequestURI() {
            return replaceInPath(super.getRequestURI());
        }

        @Override
        public String getPathInfo() {
            return replaceInPath(super.getPathInfo());
        }

        //Prevent modification of the request
        @Override
        public void setAttribute(String name, Object o) {
        }

    }

    static class DerivedResponse extends HttpServletResponseWrapper {

        private final RecordingOutputStream output=new RecordingOutputStream();
        private int status;
        private String characterEncoding;

        public DerivedResponse(HttpServletResponse response) {
            super(response);
        }

        @Override
        public ServletOutputStream getOutputStream() {
            return this.output;
        }

        @Override
        public void setStatus(int sc) {
            this.status=sc;
        }

        @Override
        public void setBufferSize(int size) {
        }

        @Override
        public void setCharacterEncoding(String charset) {
            this.characterEncoding=charset;
        }

        //ignore these
        @Override
        public void setContentLength(int len) {
        }

        @Override
        public void setContentType(String type) {
        }

        Object interpretResponse() throws IOException {
            if(this.status / 100 > 2) {
                throw new IOException("Invalid response code " + this.status + " response: " + new String(this.output.getBytes()));
            }

            final ByteArrayInputStream bytes = new ByteArrayInputStream(this.output.getBytes());
            Reader reader;
            if(this.characterEncoding!=null) {
                reader=new InputStreamReader(bytes, this.characterEncoding);
            } else {
                reader=new InputStreamReader(bytes);
            }
            final JSONObject response;
            try {
                response = (JSONObject) new JSONParser()
                    .parse(reader);
                if(!(response.get("status") instanceof Number) || ((Number)response.get("status")).intValue() != 200) {
                    throw new IOException("Invalid jolokia response code " + response.get("status") + " response: " + new String(this.output.getBytes()));
                }
                return response.get("value");
            } catch (ParseException e) {
                throw new IOException("Unable to parse JSON response");
            }

        }
    }

    static class RecordingOutputStream extends ServletOutputStream {

        private final ByteArrayOutputStream recorder;

        RecordingOutputStream() {
            this.recorder=new ByteArrayOutputStream();
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {
        }

        @Override
        public void write(int b) {
            this.recorder.write(b);
        }

        byte[] getBytes() {
            return this.recorder.toByteArray();
        }
    }

}
