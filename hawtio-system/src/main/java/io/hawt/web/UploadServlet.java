package io.hawt.web;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.jmx.UploadManager;
import io.hawt.util.Strings;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.ProgressListener;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 */
public class UploadServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final transient Logger LOG = LoggerFactory.getLogger(UploadServlet.class);

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String uploadDirectory = UploadManager.UPLOAD_DIRECTORY;
        File uploadDir = new File(uploadDirectory);

        uploadFiles(request, response, uploadDir);
    }

    protected List<File> uploadFiles(HttpServletRequest request, HttpServletResponse response, File uploadDir) throws IOException, ServletException {
        response.setContentType("text/html");
        final PrintWriter out = response.getWriter();
        List<File> uploadedFiles = new ArrayList<>();
        boolean isMultipart = ServletFileUpload.isMultipartContent(request);
        if (isMultipart) {
            ServletContext context = this.getServletConfig().getServletContext();
            if (!uploadDir.exists()) {
                LOG.info("Creating directory {}" + uploadDir);
                if (!uploadDir.mkdirs()) {
                    LOG.warn("Failed to create upload directory at {}", uploadDir);
                }
            }
            DiskFileItemFactory factory = UploadManager.newDiskFileItemFactory(context, uploadDir);
            ServletFileUpload upload = new ServletFileUpload(factory);

            String targetDirectory = null;
            List<File> files = new ArrayList<File>();

            upload.setProgressListener(new ProgressListener() {

                private long mBytesRead = 0;

                @Override
                public void update(long pBytesRead, long pContentLength, int pItems) {
                    long nowMBytesRead = pBytesRead / 1024 / 1024;
                    long lengthMBytes = pContentLength / 1024 / 1024;
                    long anEighth = lengthMBytes / 8;
                    if (nowMBytesRead > mBytesRead && nowMBytesRead % anEighth == 0) {
                        mBytesRead = nowMBytesRead;
                        LOG.debug("On item {}, read {}mb, total: {}mb", new Object[]{pItems, mBytesRead, lengthMBytes});
                        out.write("<p>item: " + pItems + " read:" + mBytesRead + "mb total: " + lengthMBytes + "mb</p>");
                    }
                }
            });


            try {
                List<FileItem> items = upload.parseRequest(request);
                for (FileItem item : items) {
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
                        File target = new File(uploadDir, fileName);

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
                throw new RuntimeException("Failed accepting file uploads: ", e);
            }

            if (targetDirectory != null) {
                targetDirectory = Strings.sanitizeDirectory(targetDirectory);
                File target = new File(uploadDir.getAbsolutePath(), targetDirectory);
                LOG.info("Putting files in subdirectory: {}", targetDirectory);
                if (!target.exists()) {
                    if (!target.mkdirs()) {
                        LOG.warn("Failed to create target directory: {}", target);
                    }
                }

                for (File file : files) {
                    File dest = new File(target.getAbsolutePath(), file.getName());
                    LOG.info("Renaming {} to {}", file, dest);
                    if (!file.renameTo(dest)) {
                        LOG.warn("Failed to rename {} to {}", file, dest);
                    } else {
                        uploadedFiles.add(dest);
                    }
                }
            } else {
                uploadedFiles = files;
            }

        } else {
            super.doPost(request, response);
        }
        return uploadedFiles;
    }

}
