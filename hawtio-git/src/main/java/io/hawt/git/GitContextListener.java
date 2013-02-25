/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.git;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.File;

/**
 * A {@link ServletContextListener} which initialises the {@link GitFacade} in the web app
 */
public class GitContextListener  implements ServletContextListener {
    private GitFacade helper = new GitFacade();

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            ServletContext context = servletContextEvent.getServletContext();
            String configDir = context.getInitParameter("hawtio.config.dir");
            if (configDir != null) {
                helper.setConfigDirectory(new File(configDir));
            }
            String repo = context.getInitParameter("hawtio.config.repo");
            if (repo != null) {
                helper.setRemoteRepository(repo);
            }
            String cloneRemoteRepoOnStartup = context.getInitParameter("hawtio.config.cloneOnStartup");
            if (cloneRemoteRepoOnStartup != null && cloneRemoteRepoOnStartup.equals("false")) {
                helper.setCloneRemoteRepoOnStartup(false);
            }
            helper.init();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        try {
            helper.destroy();
        } catch (Exception e) {
            throw createServletException(e);
        }
    }

    protected RuntimeException createServletException(Exception e) {
        return new RuntimeException(e);
    }
}
