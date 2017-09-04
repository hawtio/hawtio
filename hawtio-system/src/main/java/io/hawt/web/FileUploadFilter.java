package io.hawt.web;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static java.lang.StrictMath.toIntExact;

public class FileUploadFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(FileUploadFilter.class);
    public static final String FILE_UPLOAD_PROPNAME = "hawtio.config.fileUpload";
    private List<MagicNumberFileFilter> filters;

    private void addFilters(MagicNumberFileFilter config) {
        if (filters == null) {
            this.filters = new ArrayList<>();
        }

        filters.add(config);
    }

    public FileUploadFilter() {

        String config = System.getProperty(FILE_UPLOAD_PROPNAME);
        if (config != null) {
            LOG.info("Configuring file upload using {} configurations", config);

            try {
                String[] var0 = config.split(";");
                for (int i = 0; i <= var0.length - 1; i++) {
                    MagicNumberFileFilter filter = new MagicNumberFileFilter();
                    String[] var1 = var0[i].split(",");
                    for (int j = 0; j <= var1.length - 1; j++) {
                        if (var1[j].toLowerCase().contains("signature=")) {
                            filter.setMagicNumbers(hexStringToByteArray(var1[j].replace("signature=", "")));
                        }

                        if (var1[j].toLowerCase().contains("offset=")) {
                            filter.setByteOffset(Long.parseLong(var1[j].toLowerCase().replace("offset=", "")));
                        }

                        if (var1[j].toLowerCase().contains("maxsize=")) {
                            String value = var1[j].replace("maxSize=", "");
                            filter.setMaxSize(value.trim());
                        }
                    }

                    addFilters(filter);
                }
            } catch (RuntimeException e) {
                LOG.warn("Error configuring filter {}", config);
            }
        }
    }

    private static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    // Exposed for testing
    public long translateFileSize(String size) {

        if (size.toLowerCase().trim().contains("bytes")) {
            String normalized = size.toLowerCase().replace("bytes", "").trim();
            return Long.parseLong(!normalized.equals("") ? normalized : "0");
        }

        if (size.toLowerCase().trim().contains("kb")) {
            String normalized = size.toLowerCase().replace("kb", "").trim();
            return 1024L * Long.parseLong(!normalized.equals("") ? normalized : "0");
        }

        if (size.toLowerCase().trim().contains("mb")) {
            String normalized = size.toLowerCase().replace("mb", "").trim();
            return 1048576L * Long.parseLong(!normalized.equals("") ? normalized : "0");
        }

        if (size.toLowerCase().trim().contains("gb")) {
            String normalized = size.toLowerCase().replace("gb", "").trim();
            return 1073741824L * Long.parseLong(!normalized.equals("") ? normalized : "0");
        }

        return 0L;
    }

    public boolean accept(byte[] fileContent) {
        if (this.getFilters().isEmpty()) {
            return true;
        }

        boolean fileAccepted = false;
        for (MagicNumberFileFilter magicNumberFileFilter : this.getFilters()) {

            if (fileContent.length >= magicNumberFileFilter.getByteOffset() +
                magicNumberFileFilter.getMagicNumbers().length) {
                byte[] fileMagicBytes = Arrays.copyOfRange(fileContent, toIntExact(magicNumberFileFilter.getByteOffset()),
                    toIntExact(magicNumberFileFilter.getByteOffset()) + magicNumberFileFilter.getMagicNumbers().length);
                if (Arrays.equals(magicNumberFileFilter.getMagicNumbers(), fileMagicBytes)) {
                    //Checking the file size
                    String fileSize = FileUtils.byteCountToDisplaySize(fileContent.length);

                    if (translateFileSize(fileSize) <= translateFileSize(magicNumberFileFilter.getMaxSize())) {
                        fileAccepted = true;
                    }
                }
            }
        }

        return fileAccepted;
    }

    public List<MagicNumberFileFilter> getFilters() {
        if (this.filters == null) {
            this.filters = new ArrayList<>();
        }

        return filters;
    }


    static final class MagicNumberFileFilter {
        private byte[] magicNumbers;
        private long byteOffset;
        private String maxSize;

        public byte[] getMagicNumbers() {
            return magicNumbers;
        }

        public void setMagicNumbers(byte[] magicNumbers) {
            if (magicNumbers.length == 0) {
                throw new IllegalArgumentException("The magic number must contain at least one byte");
            }
            this.magicNumbers = magicNumbers;
        }

        public long getByteOffset() {
            return byteOffset;
        }

        public void setByteOffset(long byteOffset) {
            if (byteOffset < 0L) {
                throw new IllegalArgumentException("The offset cannot be negative");
            }
            this.byteOffset = byteOffset;
        }

        public String getMaxSize() {
            return maxSize;
        }

        public void setMaxSize(String maxSize) {
            if (maxSize != null) {
                this.maxSize = maxSize;
            } else {
                this.maxSize = "200bytes"; // Default allowed file size
            }
        }
    }
}
