/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web;

import io.hawt.git.GitFacade;
import io.hawt.git.WriteCallback;
import io.hawt.git.WriteContext;
import io.hawt.util.Files;
import io.hawt.util.Function;
import io.hawt.util.IOHelper;
import io.hawt.util.Strings;
import io.hawt.util.Zips;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

/**
 */
public class GitServlet extends UploadServlet {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitServlet.class);

    private static final int DEFAULT_BUFFER_SIZE = 10240; // 10KB.

    @Override
    protected void doGet(HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
        GitFacade gitFacade = GitFacade.getSingleton();
        if (gitFacade == null) {
            throw new ServletException("No GitFacade object available!");
        }
        Params params = parsePararams(req, resp);
        if (params == null) {
            return;
        }
        String branch = params.getBranch();
        String path = params.getPath();

        Function<File, Object> callback = new Function<File, Object>() {
            @Override
            public Object apply(File file) {
                String type = getServletContext().getMimeType(file.getAbsolutePath());
                if (type == null) {
                    type = "application/octet-stream";
                }
                resp.reset();
                resp.setBufferSize(DEFAULT_BUFFER_SIZE);
                resp.setContentType(type);
                if (file.isFile() && file.exists()) {
                    try {
                        byte[] bytes = Files.readBytes(file);
                        int length = bytes.length;
                        LOG.debug("Serving file: " + file.getAbsolutePath() + " of type " + type + " length: " + length);
                        resp.setContentLength(length);
                        resp.getOutputStream().write(bytes);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to read file " + file + ". " + e, e);
                    }
                }
                return null;
            }
        };
        try {
            gitFacade.readFile(branch, path, callback);
        } catch (GitAPIException e) {
            throw new ServletException("Failed to read file: " + path + " on branch " + branch + ". " + e, e);
        }
    }


    @Override
    protected void doPost(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
        GitFacade gitFacade = GitFacade.getSingleton();
        if (gitFacade == null) {
            throw new ServletException("No GitFacade object available!");
        }
        Params params = parsePararams(req, resp);
        if (params == null) {
            return;
        }
        String branch = params.getBranch();
        String path = params.getPath();

        WriteCallback<Object> callback = new WriteCallback<Object>() {
            @Override
            public Object apply(WriteContext context) throws IOException, GitAPIException {
                File file = context.getFile();
                List<File> uploadedFiles = null;
                try {
                    uploadedFiles = uploadFiles(req, resp, file);
                } catch (ServletException e) {
                    throw new IOException(e);
                }
                if (uploadedFiles != null) {
                    boolean unzip = true;
                    String unpackZipFlag = req.getParameter("unpackZip");
                    if (Strings.isNotBlank(unpackZipFlag)) {
                        String lowerFlag = unpackZipFlag.toLowerCase();
                        if (lowerFlag.startsWith("f") || lowerFlag.equals("0")) {
                            unzip = false;
                        }
                    }
                    for (File uploadedFile : uploadedFiles) {
                        String name = uploadedFile.getName();
                        if (unzip && name.endsWith(".zip")) {
                            // lets unzip zip files into a folder
                            String folderName = name.substring(0, name.length() - 4);
                            File unzipDir = new File(uploadedFile.getParentFile(), folderName);
                            Zips.unzip(new FileInputStream(uploadedFile), unzipDir);
                            uploadedFile.delete();
                            uploadedFile = unzipDir;
                        }
                        LOG.info("Adding to folder: " + file + " file: " + uploadedFile + " to git");
                        context.addFile(uploadedFile);
                    }
                }
                return null;
            }
        };
        try {
            gitFacade.writeFile(branch, path, callback);
        } catch (GitAPIException e) {
            throw new ServletException("Failed to read file: " + path + " on branch " + branch + ". " + e, e);
        }
    }


    protected Params parsePararams(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String requested = req.getPathInfo();
        LOG.debug("Requested file : " + requested);
        if (requested == null) {
            notFound(resp);
            return null;
        }
        while (requested.startsWith("/")) {
            requested = requested.substring(1);
        }
        int idx = requested.indexOf('/');
        if (idx < 0) {
            notFound(resp);
            return null;
        }
        String branch = requested.substring(0, idx);
        if (branch.length() <= 0) {
            resp.getWriter().println("No branch specified!");
            notFound(resp);
        }
        String path = requested.substring(idx + 1);
        if (path == null || path.length() == 0) {
            path = "/";
        }
        return new Params(branch, path);
    }


    protected void notFound(HttpServletResponse resp) throws IOException {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    protected static class Params {
        private final String branch;
        private final String path;

        public Params(String branch, String path) {
            this.branch = branch;
            this.path = path;
        }

        public String getBranch() {
            return branch;
        }

        public String getPath() {
            return path;
        }
    }
}
