package io.hawt.util;

import java.io.File;
import java.io.IOException;

/**
 * A simple API to a file lock
 */
public class FileLocker {
    private final File lockFile;

    /**
     * Attempts to grab the lock for the given file, returning a FileLock if
     * the lock has been created; otherwise it returns null
     */
    public static FileLocker getLock(File lockFile) {
        lockFile.getParentFile().mkdirs();
        if (!lockFile.exists()) {
            try {
                IOHelper.write(lockFile, "I have the lock!");
                lockFile.deleteOnExit();
                return new FileLocker(lockFile);
            } catch (IOException e) {
                // Ignore
            }
        }
        return null;

    }

    public FileLocker(File lockFile) {
        this.lockFile = lockFile;
    }

    @Override
    public String toString() {
        return "FileLock(" + lockFile + ")";
    }

    public void destroy() {
        if (lockFile.exists()) {
            lockFile.delete();
        }
    }
}
