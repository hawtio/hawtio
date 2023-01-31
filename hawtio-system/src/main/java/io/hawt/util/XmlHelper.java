package io.hawt.util;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.Set;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * A helper method to get the namespaces on an XML file
 */
public class XmlHelper {
    private static SAXParserFactory factory;

    /**
     * Returns the namespace URIs found in the given XML file
     */
    public static Set<String> getNamespaces(File file) throws ParserConfigurationException, SAXException, IOException {
        return getNamespaces(new InputSource(new FileReader(file)));
    }

    /**
     * Returns the namespace URIs found in the given XML file
     */
    public static Set<String> getNamespaces(InputSource source) throws ParserConfigurationException, SAXException, IOException {
        XmlNamespaceFinder finder = createNamespaceFinder();
        Set<String> answer = finder.parseContents(source);
        if (factory == null) {
            factory = finder.getFactory();
        }
        return answer;
    }

    public static SAXParserFactory getFactory() {
        return factory;
    }

    public static void setFactory(SAXParserFactory factory) {
        XmlHelper.factory = factory;
    }

    protected static XmlNamespaceFinder createNamespaceFinder() {
        XmlNamespaceFinder finder = new XmlNamespaceFinder();
        if (factory != null) {
            finder.setFactory(factory);
        }
        return finder;
    }
}
