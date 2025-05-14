/*
 * Copyright 2024 hawt.io
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
package io.hawt.springboot;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementServerProperties;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletPath;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class EndpointPathResolverTest {

    ServerProperties serverProperties;
    ManagementServerProperties managementServerProperties;
    WebEndpointProperties webEndpointProperties;
    DispatcherServletPath dispatcherServletPath;

    EndpointPathResolver resolver;

    @BeforeEach
    public void setup() {
        // "server." prefixed properties
        serverProperties = new ServerProperties();
        // "management.server." prefixed properties
        managementServerProperties = new ManagementServerProperties();
        // "management.endpoints.web." prefixed properties
        webEndpointProperties = new WebEndpointProperties();

        // for non-management server it returns "spring.mvc.servlet.path" property value
        // - org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration.DispatcherServletRegistrationConfiguration.dispatcherServletRegistration
        //   new DispatcherServletRegistrationBean(dispatcherServlet, webMvcProperties.getServlet().getPath())
        // for management server it returns "/" - always
        // - org.springframework.boot.actuate.autoconfigure.web.servlet.WebMvcEndpointChildContextConfiguration.dispatcherServletRegistrationBean
        //   mew DispatcherServletRegistrationBean(dispatcherServlet, "/") (hardcoded)
        dispatcherServletPath = mock(DispatcherServletPath.class);

        resolver = new EndpointPathResolver(webEndpointProperties, serverProperties,
                managementServerProperties, dispatcherServletPath);
    }

    @Test
    public void defaultConfiguration() {
        assertEquals("/actuator/x", resolver.resolve("x"));
        assertEquals("/actuator/hawtio", resolver.resolve("hawtio"));
        assertEquals("/actuator/hawtio/jmx", resolver.resolve("hawtio///jmx"));
        assertEquals("/actuator", resolver.resolve("//"));
        assertEquals("/actuator", resolver.resolve(""));
    }

    @Test
    public void customNonManagementContext() {
        serverProperties.getServlet().setContextPath("/ctx");

        assertEquals("/actuator/x", resolver.resolve("x"));
        assertEquals("/actuator/hawtio", resolver.resolve("hawtio"));
        assertEquals("/actuator/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/actuator", resolver.resolve(""));
    }

    @Test
    public void customNonManagementContextAndDispatcherServletPath() {
        serverProperties.getServlet().setContextPath("/ctx");
        when(dispatcherServletPath.getPath()).thenReturn("/ds");

        assertEquals("/ds/actuator/x", resolver.resolve("x"));
        assertEquals("/ds/actuator/hawtio", resolver.resolve("hawtio"));
        assertEquals("/ds/actuator/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/ds/actuator", resolver.resolve(""));
    }

    @Test
    public void customManagementContextButSamePort() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setBasePath("/mctx");

        assertEquals("/actuator/x", resolver.resolve("x"));
        assertEquals("/actuator/hawtio", resolver.resolve("hawtio"));
        assertEquals("/actuator/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/actuator", resolver.resolve(""));
    }

    @Test
    public void customManagementContextButSamePortAndCustomActuatorBase() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setBasePath("/mctx");
        webEndpointProperties.setBasePath("/custom-actuator/endpoints");

        assertEquals("/custom-actuator/endpoints/x", resolver.resolve("x"));
        assertEquals("/custom-actuator/endpoints/hawtio", resolver.resolve("hawtio"));
        assertEquals("/custom-actuator/endpoints/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/custom-actuator/endpoints", resolver.resolve(""));
    }

    @Test
    public void customManagementContextAndDispatcherServletPathButSamePortAndCustomActuatorBase() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setBasePath("/mctx");
        webEndpointProperties.setBasePath("/custom-actuator/endpoints");
        when(dispatcherServletPath.getPath()).thenReturn("/ds");

        assertEquals("/ds/custom-actuator/endpoints/x", resolver.resolve("x"));
        assertEquals("/ds/custom-actuator/endpoints/hawtio", resolver.resolve("hawtio"));
        assertEquals("/ds/custom-actuator/endpoints/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/ds/custom-actuator/endpoints", resolver.resolve(""));
    }

    @Test
    public void customManagementContextWithDifferentPort() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setPort(10001);
        managementServerProperties.setBasePath("/mctx");

        assertEquals("/actuator/x", resolver.resolve("x"));
        assertEquals("/actuator/hawtio", resolver.resolve("hawtio"));
        assertEquals("/actuator/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/actuator", resolver.resolve(""));
    }

    @Test
    public void customManagementContextWithDifferentPortAndCustomActuatorBase() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setPort(10001);
        managementServerProperties.setBasePath("/mctx");
        webEndpointProperties.setBasePath("/custom-actuator/endpoints");

        // this doesn't matter when there's separate management server
        when(dispatcherServletPath.getPath()).thenReturn("/ds");

        assertEquals("/custom-actuator/endpoints/x", resolver.resolve("x"));
        assertEquals("/custom-actuator/endpoints/hawtio", resolver.resolve("hawtio"));
        assertEquals("/custom-actuator/endpoints/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/custom-actuator/endpoints", resolver.resolve(""));
    }

    @Test
    public void customManagementContextWithDifferentPortAndDispatcherServletPath() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setPort(10001);
        managementServerProperties.setBasePath("/mctx");

        // this doesn't matter when there's separate management server
        when(dispatcherServletPath.getPath()).thenReturn("/ds");

        assertEquals("/actuator/x", resolver.resolve("x"));
        assertEquals("/actuator/hawtio", resolver.resolve("hawtio"));
        assertEquals("/actuator/hawtio/jmx", resolver.resolve("hawtio/jmx"));
        assertEquals("/actuator", resolver.resolve(""));
    }

    @Test
    public void customManagementContextWithDifferentPortAndCustomEndpointMapping() {
        serverProperties.getServlet().setContextPath("/ctx");
        managementServerProperties.setPort(10001);
        managementServerProperties.setBasePath("/mctx");
        webEndpointProperties.getPathMapping().put("hawtio", "my-hawtio");

        assertEquals("/actuator/x", resolver.resolve("x"));
        assertEquals("/actuator/my-hawtio", resolver.resolve("hawtio"));
        assertEquals("/actuator", resolver.resolve(""));
    }

}
