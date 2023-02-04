package io.hawt.util;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static io.hawt.util.Closeables.closeQuietly;

/**
 * A collection of IO helpers
 */
public class IOHelper {
    public static final int BUFFER_SIZE = 64 * 1024;

    private static final Logger LOG = LoggerFactory.getLogger(IOHelper.class);

    public static String readFully(File file) throws IOException {
        return readFully(new BufferedReader(new FileReader(file)));
    }

    /**
     * Reads the entire reader into memory as a String
     */
    public static String readFully(BufferedReader reader) throws IOException {
        if (reader == null) {
            return null;
        }

        StringBuilder sb = new StringBuilder(BUFFER_SIZE);
        char[] buf = new char[BUFFER_SIZE];
        try {
            int len;
            // read until we reach then end which is the -1 marker
            while ((len = reader.read(buf)) != -1) {
                sb.append(buf, 0, len);
            }
        } finally {
            IOHelper.close(reader, "reader", LOG);
        }

        return sb.toString();
    }

    /**
     * Closes the given resource if it is available, logging any closing exceptions to the given log.
     *
     * @param closeable the object to close
     * @param name      the name of the resource
     * @param log       the log to use when reporting closure warnings, will use this class's own {@link Logger} if <tt>log == null</tt>
     */
    public static void close(Closeable closeable, String name, Logger log) {
        if (closeable != null) {
            try {
                closeable.close();
            } catch (IOException e) {
                if (log == null) {
                    // then fallback to use the own Logger
                    log = LOG;
                }
                if (name != null) {
                    log.warn("Cannot close: " + name + ". Reason: " + e.getMessage(), e);
                } else {
                    log.warn("Cannot close. Reason: " + e.getMessage(), e);
                }
            }
        }
    }


    /**
     * Writes the text to the given file, overwriting the previous file if it existed.
     */
    public static void write(File file, String text) throws IOException {
        write(file, text, false);
    }

    public static void write(File file, byte[] data) throws IOException {
        write(file, data, false);
    }

    /**
     * Writes the given text to the file; either in append mode or replace mode depending on
     * the append flag.
     */
    public static void write(File file, String text, boolean append) throws IOException {
        try (FileWriter writer = new FileWriter(file, append)) {
            writer.write(text);
        }
    }

    /**
     * Writes the given data to the file; either in append mode or replace mode depending on
     * the append flag.
     */
    public static void write(File file, byte[] data, boolean append) throws IOException {
        try (FileOutputStream stream = new FileOutputStream(file, append)) {
            stream.write(data);
        }
    }

    public static int copy(final Reader input, final Writer output) throws IOException {
        return copy(input, output, BUFFER_SIZE);
    }

    public static int copy(final Reader input, final Writer output, int bufferSize) throws IOException {
        final char[] buffer = new char[bufferSize];
        int n = input.read(buffer);
        int total = 0;
        while (-1 != n) {
            output.write(buffer, 0, n);
            total += n;
            n = input.read(buffer);
        }
        output.flush();
        return total;
    }

    public static void copy(InputStream is, OutputStream os) throws IOException {
        try {
            byte[] b = new byte[64 * 1024];
            int l = is.read(b);
            while (l >= 0) {
                os.write(b, 0, l);
                l = is.read(b);
            }
        } finally {
            closeQuietly(os);
        }
    }


}
