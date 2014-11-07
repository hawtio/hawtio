package io.hawt.util;

import java.io.Closeable;

public final class Closeables {

    private Closeables() {
        //Utility Class
    }

    public static void closeQuietly(Closeable closeable) {
        if (closeable != null) {
            try {
                closeable.close();
            } catch (Exception ex) {
                //ignore
            }
        }
    }
}
