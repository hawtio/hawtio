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

import java.io.File;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.git.GitFacade;
import io.hawt.git.GitFileManager;
import io.hawt.git.GitHelper;
import io.hawt.git.WriteCallback;
import io.hawt.git.WriteContext;
import io.hawt.util.Files;
import io.hawt.util.Function;
import io.hawt.util.Strings;
import io.hawt.util.Zips;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 */
public class GitServlet extends UploadServlet {
    private static final transient Logger LOG = LoggerFactory.getLogger(GitServlet.class);

    private static final int DEFAULT_BUFFER_SIZE = 10240; // 10KB.

    private GitFileManager gitFacade;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        gitFacade = GitFacade.getSingleton();
    }

    @Override
    public void destroy() {
        super.destroy();
    }

    @Override
    protected void doGet(HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
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
                try {
                    String name = file.getName();
                    if (!file.exists() && name.endsWith(".zip")) {
                        String folderName = name.substring(0, name.length() - 4);
                        File dir = new File(file.getParentFile(), folderName);
                        if (dir.exists()) {
                            file = dir;
                        }
                    }
                    if (file.isDirectory() && file.exists()) {
                        // lets create a temporary zip for a directory
                        file = createZip(file);
                    }
                    String type = getServletContext().getMimeType(file.getAbsolutePath());
                    if (type == null) {
                        type = "application/octet-stream";
                    }
                    resp.reset();
                    resp.setBufferSize(DEFAULT_BUFFER_SIZE);
                    resp.setContentType(type);
                    if (file.isFile() && file.exists()) {
                        byte[] bytes = Files.readBytes(file);
                        int length = bytes.length;
                        LOG.debug("Serving file: " + file.getAbsolutePath() + " of type " + type + " length: " + length);
                        resp.setContentLength(length);
                        resp.getOutputStream().write(bytes);
                    }
                } catch (IOException e) {
                    throw new RuntimeException("Failed to read file " + file + ". " + e, e);
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

    protected File createZip(File file) throws IOException {
        File answer = File.createTempFile(file.getName(), "zip");
        Zips.createZipFile(LOG, file, answer);
        return answer;
    }


    @Override
    protected void doPost(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
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
                String unpackZipFlag = req.getParameter("unpackZip");
                boolean unzip = true;
                if (Strings.isNotBlank(unpackZipFlag)) {
                    String lowerFlag = unpackZipFlag.toLowerCase();
                    if (lowerFlag.startsWith("f") || lowerFlag.equals("0")) {
                        unzip = false;
                    }
                }
                List<File> uploadedFiles = null;
                try {
                    uploadedFiles = uploadFiles(req, resp, file);
                } catch (ServletException e) {
                    throw new IOException(e);
                }
                GitHelper.doUploadFiles(context, file, unzip, uploadedFiles);
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
