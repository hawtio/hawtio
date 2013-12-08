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

import org.ops4j.pax.web.service.WebContainer;
import org.osgi.service.http.HttpContext;

/**
 *
 */
public class DevServletFactory {

  private final static Logger LOG = Logger.getLogger(DevServletFactory.class);

  private WebContainer webContainer;
  private HttpContext httpContext;

  private DevServlet servlet = new DevServlet();

  public DevServletFactory() {
    LOG.info("DevServletFactory " + this + " instantiated");
  }

  public void init() {
    LOG.info("DevServletFactory " + this + " initialized");
  }

  public void destroy() {
    LOG.info("DevServletFactory " + this + " destroyed");
    try {
      webContainer.unregisterServlet(servlet);
    } catch (Exception e) {
      // ignored
    }
  }

  public String getContext() {
    return servlet.getContext();
  }

  public void setContext(String context) {
    servlet.setContext(context);
    try {
      LOG.info("registering servlet at context : " + context);
      webContainer.registerServlet(servlet, new String[]{context}, null, httpContext);
      LOG.info("registration succeeded");
    } catch (Exception retry) {
      try {
        LOG.info("servlet probably already registered, re-registering");
        webContainer.unregisterServlet(servlet);
        webContainer.registerServlet(servlet, new String[]{context}, null, httpContext);
      } catch (Exception e) {
        LOG.warn("registration failed", e);
      }
    }
  }

  public String getContent() {
    return servlet.getContentDirectory();
  }

  public void setContent(String content) {
    LOG.info("Using content directory : " + content);
    servlet.setContentDirectory(content);
  }

  public void setWebContainer(WebContainer webContainer) {
    this.webContainer = webContainer;
    httpContext = webContainer.getDefaultSharedHttpContext();
  }

  public WebContainer getWebContainer() {
    return webContainer;
  }

}
