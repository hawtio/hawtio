package io.hawt.web;

import io.hawt.util.Strings;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.ProgressListener;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.FileCleanerCleanup;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileCleaningTracker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Stan Lewis
 */
public class UploadServlet extends HttpServlet {

    private static final transient Logger LOG = LoggerFactory.getLogger(UploadServlet.class);

    // TODO - make more configurable
    public static String UPLOAD_DIRECTORY = System.getProperty("java.io.tmpdir") + File.separator + "uploads";

    static {
        LOG.info("Using file upload directory: {}", UPLOAD_DIRECTORY);
    }

    private static DiskFileItemFactory newDiskFileItemFactory(ServletContext context, File repository) {
        FileCleaningTracker fileCleaningTracker = FileCleanerCleanup.getFileCleaningTracker(context);
        DiskFileItemFactory factory = new DiskFileItemFactory(DiskFileItemFactory.DEFAULT_SIZE_THRESHOLD, repository);
        factory.setFileCleaningTracker(fileCleaningTracker);
        return factory;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("text/html");
        final PrintWriter out = response.getWriter();

        boolean isMultipart = ServletFileUpload.isMultipartContent(request);
        if (isMultipart) {
            ServletContext context = this.getServletConfig().getServletContext();
            File uploadDir = new File(UPLOAD_DIRECTORY);
            if (!uploadDir.exists()) {
                LOG.info("Creating directory {}" + uploadDir);
                if (!uploadDir.mkdirs()) {
                    LOG.warn("Failed to create upload directory at {}", uploadDir);
                }
            }
            DiskFileItemFactory factory = newDiskFileItemFactory(context, uploadDir);
            ServletFileUpload upload = new ServletFileUpload(factory);

            String targetDirectory = null;
            List<File> files = new ArrayList<File>();

            upload.setProgressListener(new ProgressListener() {

                private long kBytesRead = 0;

                @Override
                public void update(long pBytesRead, long pContentLength, int pItems) {
                    long nowkBytesRead = pBytesRead / 1024;
                    if (nowkBytesRead > kBytesRead) {
                        kBytesRead = nowkBytesRead;
                        LOG.debug("On item {}, read {}Kb, total: {}Kb", new Object[]{pItems, kBytesRead, pContentLength / 1024});
                        out.write("<p>item: " + pItems + " read:" + kBytesRead + "Kb total: " + (pContentLength / 1024) + "Kb</p>");
                    }
                }
            });


            try {
                List<FileItem> items = upload.parseRequest(request);

                for(FileItem item : items) {
                    if (item.isFormField()) {
                        String name = item.getFieldName();
                        String value = item.getString();
                        LOG.info("Got form field {} with value {}", name, value);
                        if (name.equals("parent")) {
                            targetDirectory = value;
                        }
                    } else {
                        String fieldName = item.getFieldName();
                        String fileName = item.getName();
                        String contentType = item.getContentType();
                        long sizeInBytes = item.getSize();

                        fileName = Strings.sanitize(fileName);

                        LOG.info("Got file upload, fieldName: {} fileName: {} contentType: {} size: {}", new Object[]{fieldName, fileName, contentType, sizeInBytes});

                        if (fileName.equals("")) {
                            LOG.info("Skipping field " + fieldName + " no filename given");
                            continue;
                        }

                        File target = new File(UPLOAD_DIRECTORY + File.separator + fileName);

                        try {
                            item.write(target);
                            files.add(target);
                            LOG.info("Wrote to file: {}", target.getAbsoluteFile());
                        } catch (Exception e) {
                            LOG.warn("Failed to write to {} due to {}", target, e);
                            //throw new RuntimeException(e);
                        }
                    }
                }
            } catch (FileUploadException e) {
                throw new RuntimeException ("Failed accepting file uploads: ", e);
            }

            if (targetDirectory != null) {
                targetDirectory = Strings.sanitizeDirectory(targetDirectory);
                File target = new File(uploadDir.getAbsolutePath(), targetDirectory);
                LOG.info("Putting files in subdirectory: {}", targetDirectory);
                if (!target.exists()) {
                    if (!target.mkdirs()) {
                        LOG.warn("Failed to create target directory: {}", target);                                         }
                }

                for (File file : files) {
                    File dest = new File(target.getAbsolutePath(), file.getName());
                    LOG.info("Renaming {} to {}", file, dest);
                    if (!file.renameTo(dest)) {
                        LOG.warn("Failed to rename {} to {}", file, dest);
                    }
                }
            }

        } else {
            super.doPost(request, response);
        }
    }
}
