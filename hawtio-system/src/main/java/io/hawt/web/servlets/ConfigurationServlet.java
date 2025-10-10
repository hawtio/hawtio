/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web.servlets;

import java.io.IOException;

import io.hawt.system.ConfigManager;
import io.hawt.web.auth.AuthenticationConfiguration;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Abstract base class for servlets that are mapped to a path like {@code /something/config/*}. It handles
 * integration with Hawtio {@link io.hawt.system.ConfigManager} and handles the
 * {@link HttpServletRequest#getPathInfo()} where first URL segment after Servlet mapping is kind of "operation"
 * to perform.
 */
public abstract class ConfigurationServlet extends HttpServlet {

    protected ConfigManager configManager;
    protected AuthenticationConfiguration authConfiguration;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
    }

    @Override
    public void init() throws ServletException {
        super.init();

        configManager = (ConfigManager) getServletContext().getAttribute(ConfigManager.CONFIG_MANAGER);
        if (configManager == null) {
            throw new IllegalStateException("Hawtio config manager not found, cannot proceed with Hawtio configuration");
        }

        authConfiguration = AuthenticationConfiguration.getConfiguration(getServletContext());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getPathInfo();
        if (path == null || path.isBlank()) {
            path = "";
        }
        path = path.trim();
        while (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.isEmpty()) {
            path = getDefaultPath();
        }

        handleGet(path, req, resp);
    }

    /**
     * Return default "operation" (path after servlet mapping accessible from
     * {@link HttpServletRequest#getPathInfo()}) in case nothing is provided.
     * (for example when a servlet is mapped to {@code /auth/config/*} and user sends a request
     * to {@code http://localhost:8080/hawtio/auth/config}).
     *
     * @return
     */
    protected abstract String getDefaultPath();

    /**
     * Handle {@code GET} request knowing the path from {@link HttpServletRequest#getPathInfo()}
     *
     * @param path
     * @param req
     * @param resp
     */
    protected abstract void handleGet(String path, HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException;

}
