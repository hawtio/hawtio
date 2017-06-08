package io.hawt.ide;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.util.IOHelper;
import io.hawt.util.MBeanSupport;

/**
 * A facade for working with IDEs to open a source code editor
 */
public class IdeFacade extends MBeanSupport implements IdeFacadeMBean {
	private static final transient Logger LOG = LoggerFactory.getLogger(IdeFacade.class);
	private static final String IDEA_URL = "http://localhost:63342";
	private static final String REST_API = IDEA_URL + "/api/file";
    private static IdeFacade singleton;
    private File baseDir;
    private Boolean restApiSupported;

    public static IdeFacade getSingleton() {
        if (singleton == null) {
            LOG.warn("No IdeFacade constructed yet so using default configuration for now");
            singleton = new IdeFacade();
        }
        return singleton;
    }

    @Override
    public void init() throws Exception {
        IdeFacade.singleton = this;
        super.init();
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=IdeFacade";
    }

    /**
     * Returns the base directory of the current project
     */
    File getBaseDir() {
        if (baseDir == null) {
            baseDir = new File(System.getProperty("basedir", "."));
        }
        return baseDir;
    }

    public void setBaseDir(File baseDir) {
        this.baseDir = baseDir;
    }

    /**
     * Attempt to open in Intellij IDEA: 
     *  - try to resolve path
     *  - attempt REST interface
     *  - fall back to Intellij's XmlRPC mechanism to open and navigate to a file
     */
    String ideaOpen(final SourceReference sourceReference) throws Exception {
		String absoluteFileName = SourceLocator.findClassAbsoluteFileName(sourceReference.fileName, sourceReference.className, getBaseDir());
    	if(invokeRestApi(absoluteFileName, sourceReference)) {
    		return "OK";
    	} else {
    		if(sourceReference.hasLineOrColumn()) {
    			return ideaOpenAndNavigateWithRpc(absoluteFileName, sourceReference.getLineOrDefault(), sourceReference.getLineOrDefault());
    		} else {
				return ideaOpenWithRpc(absoluteFileName);
    		}
    	} 
    }


	private String ideaOpenAndNavigateWithRpc(String absoluteFileName, int line, int column) throws IOException {
		String xml = "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\n" +
                "<methodCall>\n" +
                "  <methodName>fileOpener.openAndNavigate</methodName>\n" +
                "  <params>\n" +
                "    <param><value><string>" + absoluteFileName + "</string></value></param>\n" +
                "    <param><value><int>" + line + "</int></value></param>\n" +
                "    <param><value><int>" + column + "</int></value></param>\n" +
                "  </params>\n" +
                "</methodCall>\n";
        return ideaXmlRpc(xml);
	}



	/**
	 * Use HTTP to invoke open file API , 
	 * see https://github.com/JetBrains/intellij-community/blob/master/platform/built-in-server/src/org/jetbrains/ide/OpenFileHttpService.kt
	 * @param sourceReference to include as query parameters in URL
	 * @return true - if call succeeded with OK 200 response code
	 */
	private boolean invokeRestApi(final String absoluteFileName, final SourceReference sourceReference) {
		//previously probed to not be supported
		if(restApiSupported == Boolean.FALSE) {
			return false;
		}

        try {
        	final StringBuilder builder=new StringBuilder(REST_API);
        	builder.append("?file=");
        	builder.append(absoluteFileName);
        	if(sourceReference.line != null) {
        		builder.append("&line=");
        		builder.append(sourceReference.line);
        		if(sourceReference.column != null) {
            		builder.append("&column=");
            		builder.append(sourceReference.column);
            	}
        	}
        	URL requestUrl = new URL(builder.toString());
			HttpURLConnection connection = (HttpURLConnection) requestUrl.openConnection();
        	connection.setRequestMethod("GET");
        	LOG.debug("Calling URL: " + builder.toString());
			return inferApiSupport(connection.getResponseCode() == HttpURLConnection.HTTP_OK);
		} catch (IOException e) {//error on first attempt, take this as as sign that url is not supported
			LOG.debug("Error invoking IDEA REST API to open file", e);
			return inferApiSupport(false);
		}
    }

	/**
	 * Lazily infer whether REST API is supported as calls always return OK 200 , any call can be used to probe this
	 * @param status from actual call
	 * @return status
	 */
	private boolean inferApiSupport(final boolean status) {
		if(restApiSupported == null) {
			restApiSupported = status;
			LoggerFactory.getLogger(this.getClass()).info("IDEA REST API for opening files support deemed: {}", status);
		}
		return status;
	}

    private String ideaOpenWithRpc(String fileName) throws Exception {
        String xml = "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\n" +
                "<methodCall>\n" +
                "  <methodName>fileOpener.open</methodName>\n" +
                "  <params>\n" +
                "    <param><value><string>" + fileName + "</string></value></param>\n" +
                "  </params>\n" +
                "</methodCall>\n";

        return ideaXmlRpc(xml);
    }

    private String ideaXmlRpc(String xml) throws IOException {
        String charset = "UTF-8";

        HttpURLConnection connection = (HttpURLConnection) new URL(IDEA_URL).openConnection();
        connection.setDoOutput(true);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("accept-charset", charset);
        connection.setRequestProperty("Content-Type", "text/xml");
        byte[] bytes = xml.getBytes();
        connection.setRequestProperty("Content-Length", String.valueOf(bytes.length));

        OutputStream os = null;
        try {
            os = connection.getOutputStream();
            os.write(bytes);
            return IOHelper.readFully(new BufferedReader(new InputStreamReader(connection.getInputStream())));
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException ignore) {
                }
            }
        }
    }

	@Override
	public String ideOpen(String fileName, String className, Integer line, Integer column) throws Exception {
		SourceReference sourceReference = new SourceReference();
		sourceReference.fileName=fileName;
		sourceReference.className=className;
		sourceReference.line=line;
		sourceReference.column=column;
		return ideaOpen(sourceReference);
	}


}
