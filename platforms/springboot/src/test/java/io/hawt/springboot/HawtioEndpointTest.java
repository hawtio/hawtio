package io.hawt.springboot;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.Iterator;
import java.util.Set;
import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementServerProperties;
import org.springframework.boot.actuate.endpoint.EndpointId;
import org.springframework.boot.actuate.endpoint.web.EndpointMapping;
import org.springframework.boot.actuate.endpoint.web.PathMappedEndpoint;
import org.springframework.boot.actuate.endpoint.web.annotation.ExposableControllerEndpoint;
import org.springframework.boot.actuate.endpoint.web.servlet.ControllerEndpointHandlerMapping;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletPath;
import org.springframework.http.server.PathContainer;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.condition.PathPatternsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


public class HawtioEndpointTest {

    private EndpointPathResolver resolver;
    private HawtioPluginController hawtioEndpoint;
    private HttpServletRequest httpServletRequest;

    @BeforeEach
    public void setUp() {
        resolver = mock(EndpointPathResolver.class);
        hawtioEndpoint = new HawtioPluginController(resolver);
        httpServletRequest = mock(HttpServletRequest.class);
    }

    @Test
    public void testForwardHawtioRequestToIndexHtml() {
        when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio/");
        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml(httpServletRequest);
        assertEquals("forward:/actuator/hawtio/index.html", result);
    }

    @Test
    public void testRedirectHawtioInvalidRequest() {
        when(resolver.resolve("hawtio")).thenReturn("/actuator/hawtio");
        when(httpServletRequest.getRequestURI()).thenReturn("/actuator/hawtio");

        String result = hawtioEndpoint.forwardHawtioRequestToIndexHtml(httpServletRequest);
        assertEquals("redirect:/actuator/hawtio/index.html", result);
    }

    @Test
    public void testRegexpMatchingForHawtioEndpoint() throws Exception {
        // this is a test for a pattern from io.hawt.springboot.HawtioEndpoint.forwardHawtioRequestToIndexHtml:
        // org.springframework.web.bind.annotation.RequestMapping.value
        //     = {"", "{path:^(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|user|static|\\.).)*$}/**"}

        // in org.springframework.web.servlet.mvc.condition.PathPatternsRequestCondition.getMatchingPatterns(), for
        // request URI == /actuator/hawtio/index.html:
        // this.patterns = {java.util.TreeSet@9407}  size = 2
        //     0 = {org.springframework.web.util.pattern.PathPattern@9412} "/actuator/hawtio"
        //     1 = {org.springframework.web.util.pattern.PathPattern@7844} "/actuator/hawtio/{path:^(?:(?!\bjolokia\b|auth|css|fonts|img|js|user|static|\.).)*$}/**"
        // matching against:
        // path = {org.springframework.http.server.DefaultPathContainer@9406} "/actuator/hawtio/index.html"
        // elements: java.util.List  = {java.util.Collections$UnmodifiableRandomAccessList@7837}  size = 6
        //     0 = {org.springframework.http.server.DefaultPathContainer$DefaultSeparator@9453}
        //     1 = {org.springframework.http.server.DefaultPathContainer$DefaultPathSegment@9454} "[value='actuator']"
        //     2 = {org.springframework.http.server.DefaultPathContainer$DefaultSeparator@9453}
        //     3 = {org.springframework.http.server.DefaultPathContainer$DefaultPathSegment@9455} "[value='hawtio']"
        //     4 = {org.springframework.http.server.DefaultPathContainer$DefaultSeparator@9453}
        //     5 = {org.springframework.http.server.DefaultPathContainer$DefaultPathSegment@9456} "[value='index.html']"
        // path: java.lang.String  = {@9418} "/actuator/hawtio/index.html"
        //
        // see https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-uri-templates

        // "server." prefixed properties
        ServerProperties serverProperties = new ServerProperties();
        // "management.server." prefixed properties
        ManagementServerProperties managementServerProperties = new ManagementServerProperties();
        // "management.endpoints.web." prefixed properties
        WebEndpointProperties webEndpointProperties = new WebEndpointProperties();

        DispatcherServletPath dispatcherServletPath = mock(DispatcherServletPath.class);
        when(dispatcherServletPath.getPath()).thenReturn("/");

        HawtioPluginController hawtioEndpoint = new HawtioPluginController(new EndpointPathResolver(webEndpointProperties,
                serverProperties, managementServerProperties, dispatcherServletPath));

        PathMappedEndpoint pme = mock(PathMappedEndpoint.class);
        when(pme.getRootPath()).thenReturn("hawtio");

        RequestMappingInfo.BuilderConfiguration options = new RequestMappingInfo.BuilderConfiguration();
        options.setPatternParser(new PathPatternParser());
        RequestMappingInfo rmi = RequestMappingInfo
                .paths("", "{path:^(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|user|static|\\.).)*$}/**")
                .options(options)
                .build();

        EndpointMapping ep = new EndpointMapping("/actuator");
        PathPatternsRequestCondition pprc = rmi.getPathPatternsCondition();
        assertNotNull(pprc);
        Set<PathPattern> patterns = pprc.getPatterns();
        String[] endpointMappedPatterns = patterns.stream()
                .map(p -> ep.createSubPath(pme.getRootPath() + p.getPatternString()))
                .toArray(String[]::new);
        rmi = rmi.mutate().paths(endpointMappedPatterns).build();
        assertNotNull(rmi.getPathPatternsCondition());
        assertNotNull(rmi.getPathPatternsCondition().getPatterns());

        ExposableControllerEndpoint ece = mock(ExposableControllerEndpoint.class);
        when(ece.getEndpointId()).thenReturn(EndpointId.fromPropertyValue("hawtio"));
        when(ece.getRootPath()).thenReturn("hawtio");
        when(ece.getController()).thenReturn("hawtio");

        ControllerEndpointHandlerMapping handlerMapping = new ControllerEndpointHandlerMapping(ep,
                Collections.singletonList(ece), null);

        handlerMapping.registerMapping(rmi, hawtioEndpoint,
                HawtioPluginController.class.getDeclaredMethod("forwardHawtioRequestToIndexHtml", HttpServletRequest.class));

        // just basic usage to simulate handler mapping by DispatcherServlet
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/actuator/hawtio");
        HandlerExecutionChain handler = handlerMapping.getHandler(req);
        assertNotNull(handler);
        assertSame(hawtioEndpoint, ((HandlerMethod) handler.getHandler()).getBean());

        // now the fun part - I want to understand what
        // "{path:^(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|user|static|\\.).)*$}/**" pattern does...

        assertEquals("redirect:/actuator/hawtio/index.html", invokeHawtioHandler(handlerMapping, "/actuator/hawtio"),
                "Root page should be redirected");
        assertEquals("forward:/actuator/hawtio/index.html", invokeHawtioHandler(handlerMapping, "/actuator/hawtio/jmx"),
                "React /jmx route should be forwarded to /index.html");

        // these URIs should not be matched by the magic RegExp
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/favicon.ico")));
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/index.html")));
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/jolokia/read/java.lang:type=Runtime/Name")));
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/jolokia/version")));
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/jolokia/")));
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/user")));
        assertNull(handlerMapping.getHandler(new MockHttpServletRequest("GET", "/actuator/hawtio/muserx")));

        // "jolokia" is declared as "\bjolokia\b" RegExp, so jolokia2 should pass
        assertEquals("forward:/actuator/hawtio/index.html", invokeHawtioHandler(handlerMapping, "/actuator/hawtio/jolokia2"));

        // now low-level
        Iterator<PathPattern> it = rmi.getPathPatternsCondition().getPatterns().iterator();
        it.next();
        PathPattern pattern = it.next();

        assertFalse(pattern.matches(PathContainer.parsePath("/actuator/hawtio/index.html")));
        assertTrue(pattern.matches(PathContainer.parsePath("/actuator/hawtio/jmx")));

        PathPattern.PathMatchInfo info;
        info = pattern.matchAndExtract(PathContainer.parsePath("/actuator/hawtio/jmx"));
        assertEquals("jmx", info.getUriVariables().get("path"));
        info = pattern.matchAndExtract(PathContainer.parsePath("/actuator/hawtio/jmx/attributes"));
        assertEquals("jmx", info.getUriVariables().get("path"));

        // and even more low-level
        // (?:xxx) - non-capturing group
        // (?!xxx) - zero-width negative lookahead - "if you want to match something not followed by something else"
        Pattern p = Pattern.compile("^(?:(?!\\bjolokia\\b|auth|css|fonts|img|js|user|static|\\.).)*$");
        assertFalse(p.matcher("auth").matches());
        assertFalse(p.matcher("auth2").matches());
        assertFalse(p.matcher(".").matches());
        assertFalse(p.matcher("..").matches());
        assertTrue(p.matcher("c2ss").matches());
        assertFalse(p.matcher("auth").matches());
        assertFalse(p.matcher("jolokia").matches());
        assertTrue(p.matcher("jolokia2").matches());
        assertTrue(p.matcher("2jolokia").matches());
        assertTrue(p.matcher("2jolokia2").matches());
    }

    private String invokeHawtioHandler(ControllerEndpointHandlerMapping handlerMapping, String request) throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", request);
        HandlerExecutionChain hec = handlerMapping.getHandler(req);
        assertNotNull(hec);
        assertNotNull(hec.getHandler());
        Method m = ((HandlerMethod) hec.getHandler()).getMethod();
        Object endpoint = ((HandlerMethod) hec.getHandler()).getBean();
        return (String) m.invoke(endpoint, req);
    }

}
