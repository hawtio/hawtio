package io.hawt.ide;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.hawt.util.IOHelper;
import io.hawt.util.MBeanSupport;

/**
 * A facade for working with IDEs
 */
public class IdeFacade extends MBeanSupport implements IdeFacadeMBean {
    private static final String IDEA_URL = "http://localhost:63342";
	private static final String REST_API = IDEA_URL + "/api/file";
	private static final transient Logger LOG = LoggerFactory.getLogger(IdeFacade.class);
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
    public File getBaseDir() {
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
    public String ideaOpen(final SourceReference sourceReference) throws Exception {
    	if(invokeRestApi(sourceReference.resolveFilePath(getBaseDir()))) {
    		return "OK";
    	} else {
    		if(sourceReference.hasLineOrColumn()) {
    			return ideaOpenAndNavigate(sourceReference);    			
    		} else {
    			return ideaOpen(SourceLocator.findClassAbsoluteFileName(sourceReference.fileName, sourceReference.className, getBaseDir()));
    		}
    	} 
    }

	private String ideaOpenAndNavigate(final SourceReference sourceReference) throws IOException {
		return openAndNavigateInIdea(
				SourceLocator.findClassAbsoluteFileName(sourceReference.fileName, sourceReference.className, getBaseDir()), 
				sourceReference.getLineOrDefault(), 
				sourceReference.getColumnOrDefault());
	}

	private String openAndNavigateInIdea(String absoluteFileName, int line, int column) throws IOException {
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



	private boolean invokeRestApi(final Map<String,String> parameters) {
		//previously probed to not be supported
		if(restApiSupported == Boolean.FALSE) {
			return false;
		}

        try {
        	final StringBuilder builder=new StringBuilder(REST_API);
        	boolean first=true;
        	for(final Map.Entry<String, String> parameter : parameters.entrySet()) {
        		if(first) {
        			builder.append('?');
        			first = false;
        		} else {
        			builder.append('&');
        		}
    			builder.append(parameter.getKey());
    			builder.append('=');
    			builder.append(parameter.getValue());

        	}
        	URL requestUrl = new URL(builder.toString());
			HttpURLConnection connection = (HttpURLConnection) requestUrl.openConnection();
        	connection.setRequestMethod("GET");
			return inferApiSupport(connection.getResponseCode() == HttpURLConnection.HTTP_OK);
		} catch (IOException e) {//error on first attempt, take this as as sign that url is not supported
			LoggerFactory.getLogger(this.getClass()).debug("Error invoking IDEA REST API to open file", e);
			return inferApiSupport(false);
		}
    }

	private boolean inferApiSupport(final boolean status) {
		if(restApiSupported == null) {
			restApiSupported = status;
			LoggerFactory.getLogger(this.getClass()).info("IDEA REST API for opening files support deemed: {}", status);
		}
		return status;
	}

    public String ideaOpen(String fileName) throws Exception {
        String xml = "<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\n" +
                "<methodCall>\n" +
                "  <methodName>fileOpener.open</methodName>\n" +
                "  <params>\n" +
                "    <param><value><string>" + fileName + "</string></value></param>\n" +
                "  </params>\n" +
                "</methodCall>\n";

        return ideaXmlRpc(xml);
    }

    protected String ideaXmlRpc(String xml) throws IOException {
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

	/**
	 * Attempt to open file and navigate to line and column
	 * @deprecated go via {@link #ideOpen(String, String, Integer, Integer)} instead
	 */
	@Override
	@Deprecated
	public String ideaOpenAndNavigate(String absoluteFileName, int line, int column) throws Exception {
		return openAndNavigateInIdea(absoluteFileName, line, column);
	}

	/**
	 * @deprecated kept for any old clients, file name resolution is now handled as part of {@link #ideOpen(String, String, Integer, Integer)}
	 */
	@Override
	@Deprecated
	public String findClassAbsoluteFileName(String fileName, String className, List<String> sourceRoots) {
		
		return SourceLocator.findClassAbsoluteFileName(fileName, className, baseDir);
	}

}