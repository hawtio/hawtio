/*
 * Copyright 2012 Red Hat, Inc.
 *
 * Red Hat licenses this file to you under the Apache License, version
 * 2.0 (the "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied.  See the License for the specific language governing
 * permissions and limitations under the License.
 */

package io.hawt.web.dev;

import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLDecoder;

/**
 * @author Stan Lewis
 * Based on http://balusc.blogspot.com/2007/07/fileservlet.html
 */
public class DevServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final int DEFAULT_BUFFER_SIZE = 10240; // 10KB.

    private final static Logger LOG = Logger.getLogger(DevServlet.class);

    private String contentDirectory = null;
    private String context = null;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String requested = req.getPathInfo();

        LOG.debug("Requested file : " + requested);

        if (requested == null) {
            LOG.debug("Requested path is null");
            resp.setContentType("text/html");
            resp.sendRedirect(getContext().replace("/*", "") + "/index.html");
            return;
        }

        InputStream in = null;
        String type = null;

        File file = new File(contentDirectory, URLDecoder.decode(requested, "UTF-8"));

        if (file.isDirectory()) {
            LOG.debug("Requested path is a directory");
            resp.setContentType("text/html");
            resp.sendRedirect(getContext().replace("/*", "") + requested + "/index.html");
            return;
        }

        if (!file.exists()) {
          LOG.debug("File " + file.getPath() + " does not exist");
          resp.sendError(HttpServletResponse.SC_NOT_FOUND);
          return;
        }

        in = new FileInputStream(file);

        type = getServletContext().getMimeType(file.getAbsolutePath());
        if (type == null) {
            type = "application/octet-stream";
        }

        LOG.debug("Serving file: " + file.getAbsolutePath() + " of type " + type);

        resp.reset();
        resp.setBufferSize(DEFAULT_BUFFER_SIZE);

        resp.setContentType(type);
        resp.setHeader("Content-Length", String.valueOf(in.available()));

        BufferedInputStream input = null;
        BufferedOutputStream output = null;

        try {
            input = new BufferedInputStream(in, DEFAULT_BUFFER_SIZE);
            output = new BufferedOutputStream(resp.getOutputStream(), DEFAULT_BUFFER_SIZE);

            byte[] buffer = new byte[DEFAULT_BUFFER_SIZE];
            int length;
            while ((length = input.read(buffer)) > 0) {
                output.write(buffer, 0, length);
            }
        } finally {
            close(output);
            close(input);
            close(in);
        }
    }

    private static void close(Closeable resource) {
        if (resource != null) {
            try {
                resource.close();
            } catch (IOException e) {
                LOG.warn("Error closing stream : " + e.getLocalizedMessage());
            }
        }
    }

    public void setContentDirectory(String contentDirectory) {
      this.contentDirectory = contentDirectory;
    }

    public String getContentDirectory() {
      return contentDirectory;
    }

    public void setContext(String context) {
      this.context = context;
    }

    public String getContext() {
      return context;
    }

}
