package io.hawt.springboot;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.ManagementContextResolver;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import io.hawt.util.Strings;

@RunWith(Enclosed.class)
public abstract class HawtioAuthenticationIsDisabledMvcIT {

    private static abstract class AbstractDisabledAuthMvcIT extends AbstractMvcIT {

        protected final String contextPath;
        protected final String servletPrefix;
        protected final String managementContextPath;
        protected final String jolokiaPath;
        protected final String hawtioPath;

        public AbstractDisabledAuthMvcIT(final String contextPath,
                final String servletPrefix, final String managementContextPath,
                final String jolokiaPath, final String hawtioPath) {
            setProperty("hawtio.authenticationEnabled", "false");

            setProperty("server.context-path", contextPath);
            setProperty("server.servlet-path", servletPrefix);
            setProperty("management.context-path", managementContextPath);
            setProperty("endpoints.jolokia.path", jolokiaPath);
            setProperty("endpoints.hawtio.path", hawtioPath);

            this.contextPath = Strings.webContextPath(contextPath);
            this.servletPrefix = Strings.webContextPath(servletPrefix);
            this.managementContextPath = Strings
                    .webContextPath(managementContextPath);
            this.jolokiaPath = jolokiaPath == null ? "/jolokia"
                    : Strings.webContextPath(jolokiaPath);
            this.hawtioPath = hawtioPath == null ? "/hawtio"
                    : Strings.webContextPath(hawtioPath);
        }

    }

    @RunWith(Enclosed.class)
    public static abstract class ManagementPortsIsTheSameIT {

        @EnableAutoConfiguration
        public static class HawtioEndpointIsSensitiveJolokiaEndpointIsNotSensitiveMvcIT
                extends AbstractMvcIT {

            public HawtioEndpointIsSensitiveJolokiaEndpointIsNotSensitiveMvcIT() {
                setProperty("hawtio.authenticationEnabled", "false");
                setProperty("endpoints.jolokia.sensitive", "false");
            }

            @Test
            public void hawtioHawtioRootIsUnauthorized() throws Exception {
                mockMvc.perform(get("/hawtio/"))
                        .andExpect(status().isUnauthorized());
            }

            @Test
            public void testJolokiaIsAccessible() throws Exception {
                mockMvc.perform(get("/jolokia")).andExpect(status().isOk());
            }

            @Test
            public void testHawtioJolokiaRequestIsForwarded() throws Exception {
                mockMvc.perform(get("/hawtio/jolokia/foo/bar?foo=bar"))
                        .andExpect(status().isOk())
                        .andExpect(forwardedUrl("/jolokia/foo/bar?foo=bar"));
            }

            @Test
            public void testHawtioPluginIsUnauthorized() throws Exception {
                mockMvc.perform(get("/hawtio/plugin"))
                        .andExpect(status().isUnauthorized());
            }
        }

        @EnableAutoConfiguration
        public static class HawtioEndpointIsNotSensitiveJolokiaEndpointIsSensitiveMvcIT
                extends AbstractMvcIT {

            public HawtioEndpointIsNotSensitiveJolokiaEndpointIsSensitiveMvcIT() {
                setProperty("hawtio.authenticationEnabled", "false");
                setProperty("endpoints.hawtio.sensitive", "false");
            }

            @Test
            public void hawtioRootRedirectsToIndexHtml() throws Exception {
                mockMvc.perform(get("/hawtio/"))
                        .andExpect(status().isOk()).andExpect(
                                forwardedUrl("/hawtio/index.html"));
            }

            @Test
            public void testJolokiaIsUnauthorized() throws Exception {
                mockMvc.perform(get("/jolokia"))
                        .andExpect(status().isUnauthorized());
            }

            @Test
            public void testHawtioJolokiaRequestIsForwarded() throws Exception {
                mockMvc.perform(get("/hawtio/jolokia/foo/bar?foo=bar"))
                        .andExpect(status().isOk())
                        .andExpect(forwardedUrl("/jolokia/foo/bar?foo=bar"));
            }

            @Test
            public void testHawtioPluginReturnsEmptyJsonArray() throws Exception {
                mockMvc.perform(get("/hawtio/plugin")).andExpect(status().isOk())
                        .andExpect(content().string("[]"));
            }
        }

        private static abstract class AbstractNonSensitiveMvcIT
                extends AbstractDisabledAuthMvcIT {

            public AbstractNonSensitiveMvcIT(final String contextPath,
                    final String servletPrefix, final String managementContextPath,
                    final String jolokiaPath, final String hawtioPath) {
                super(contextPath, servletPrefix, managementContextPath, jolokiaPath,
                        hawtioPath);
                setProperty("endpoints.hawtio.sensitive", "false");
                setProperty("endpoints.jolokia.sensitive", "false");
            }

            protected MockHttpServletRequestBuilder getRequest(final String path) {
                final String absolutePath = contextPath + servletPrefix
                        + managementContextPath + path;
                return get(absolutePath).contextPath(contextPath)
                        .servletPath(servletPrefix);
            }

            @Test
            public void testHawtioRootRedirectsToIndexHtml() throws Exception {
                mockMvc.perform(getRequest(hawtioPath + "/"))
                        .andExpect(status().isOk())
                        .andExpect(forwardedUrl(servletPrefix + managementContextPath + hawtioPath + "/index.html"));
            }

            @Test
            public void testJolokiaRequest() throws Exception {
                mockMvc.perform(getRequest(jolokiaPath)).andExpect(status().isOk())
                        .andExpect(forwardedUrl(null));
            }

            @Test
            public void testHawtioJolokiaRequest() throws Exception {
                mockMvc.perform(getRequest(hawtioPath + "/jolokia/foo/bar?foo=bar"))
                        .andExpect(forwardedUrl(servletPrefix + managementContextPath
                                + jolokiaPath + "/foo/bar?foo=bar"));
            }

            @Test
            public void testHawtioPluginRequest() throws Exception {
                mockMvc.perform(getRequest(hawtioPath + "/plugin"))
                        .andExpect(status().isOk())
                        .andExpect(content().string("[]"));
            }
        }

        @RunWith(Enclosed.class)
        public static abstract class HawtioAndJolokiaEndpointsAreNotSensitiveMvcIT {

            @EnableAutoConfiguration
            public static class MvcIT1 extends AbstractNonSensitiveMvcIT {
                public MvcIT1() {
                    super(null, null, null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT2 extends AbstractNonSensitiveMvcIT {
                public MvcIT2() {
                    super(null, null, "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT3 extends AbstractNonSensitiveMvcIT {
                public MvcIT3() {
                    super(null, "/s", null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT4 extends AbstractNonSensitiveMvcIT {
                public MvcIT4() {
                    super(null, "/s", "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT5 extends AbstractNonSensitiveMvcIT {
                public MvcIT5() {
                    super("/c", null, null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT6 extends AbstractNonSensitiveMvcIT {
                public MvcIT6() {
                    super("/c", null, "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT7 extends AbstractNonSensitiveMvcIT {
                public MvcIT7() {
                    super("/c", "/s", null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT8 extends AbstractNonSensitiveMvcIT {
                public MvcIT8() {
                    super("/c", "/s", "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT9 extends AbstractNonSensitiveMvcIT {
                public MvcIT9() {
                    super("/c", "/s", "/m", null, "/h");
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT10 extends AbstractNonSensitiveMvcIT {
                public MvcIT10() {
                    super("/c", "/s", "/m", "/j", null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT11 extends AbstractNonSensitiveMvcIT {
                public MvcIT11() {
                    super("/c", "/s", "/m", "/j", "/h");
                }
            }

            @EnableAutoConfiguration
            public static class HawtioIsServedFromRootWithCustomJolokiaPath
                    extends AbstractNonSensitiveMvcIT {
                public HawtioIsServedFromRootWithCustomJolokiaPath() {
                    super("/c", "/s", "/m", "/j", "/");
                }
            }

            @EnableAutoConfiguration
            public static class HawtioIsServedFromRootWithDefaultJolokiaPathMvcIT
                    extends AbstractNonSensitiveMvcIT {
                public HawtioIsServedFromRootWithDefaultJolokiaPathMvcIT() {
                    super("/c", "/s", "/m", null, "/");
                }

                @Test
                @Override
                public void testHawtioJolokiaRequest() throws Exception {
                    mockMvc.perform(
                            getRequest(hawtioPath + "/jolokia/foo/bar?foo=bar"))
                            .andExpect(status().isOk())
                            .andExpect(forwardedUrl(null));
                }
            }

            @EnableAutoConfiguration
            public static class JolokoiaEndpointIsDisabledMvcIT
                    extends AbstractNonSensitiveMvcIT {
                public JolokoiaEndpointIsDisabledMvcIT() {
                    super("/c", "/s", "/m", null, "/");
                    setProperty("endpoints.jolokia.enabled", "false");
                }

                @Test
                @Override
                public void testJolokiaRequest() throws Exception {
                    mockMvc.perform(getRequest(jolokiaPath))
                            .andExpect(status().isNotFound())
                            .andExpect(forwardedUrl(null));
                }

                @Test
                @Override
                public void testHawtioJolokiaRequest() throws Exception {
                    mockMvc.perform(
                            getRequest(hawtioPath + "/jolokia/foo/bar?foo=bar"))
                            .andExpect(status().isNotFound())
                            .andExpect(forwardedUrl(null));
                }
            }
        }
    }

    @RunWith(Enclosed.class)
    public static abstract class ManagementPortIsDifferentIT {

        private static abstract class AbstractNonSensitiveMvcIT
                extends AbstractDisabledAuthMvcIT {

            @Autowired
            public ManagementContextResolver resolver;

            @Before
            public void setUp() {
                mockMvc = MockMvcBuilders.webAppContextSetup(
                        (WebApplicationContext) resolver.getApplicationContext())
                        .build();
            }

            public AbstractNonSensitiveMvcIT(final String contextPath,
                    final String servletPrefix, final String managementContextPath,
                    final String jolokiaPath, final String hawtioPath) {
                super(contextPath, servletPrefix, managementContextPath, jolokiaPath,
                        hawtioPath);
                setProperty("endpoints.hawtio.sensitive", "false");
                setProperty("endpoints.jolokia.sensitive", "false");

                setProperty("server.port", findFreePort());
                setProperty("management.port", findFreePort());
            }

            protected MockHttpServletRequestBuilder getRequest(final String path) {
                return get(managementContextPath + path);
            }

            @Test
            public void testHawtioRootRedirectsToIndexHtml() throws Exception {
                mockMvc.perform(getRequest(hawtioPath + "/"))
                        .andExpect(status().isOk())
                        .andExpect(forwardedUrl(managementContextPath + hawtioPath + "/index.html"));
            }

            @Test
            public void testJolokiaRequest() throws Exception {
                mockMvc.perform(getRequest(jolokiaPath)).andExpect(status().isOk())
                        .andExpect(forwardedUrl(null));
            }

            @Test
            public void testHawtioJolokiaRequest() throws Exception {
                mockMvc.perform(getRequest(hawtioPath + "/jolokia/foo/bar?foo=bar"))
                        .andExpect(forwardedUrl(managementContextPath + jolokiaPath
                                + "/foo/bar?foo=bar"));
            }

            @Test
            public void testHawtioPluginRequest() throws Exception {
                mockMvc.perform(getRequest(hawtioPath + "/plugin"))
                        .andExpect(status().isOk())
                        .andExpect(content().string("[]"));
            }
        }

        @RunWith(Enclosed.class)
        public static abstract class HawtioAndJolokiaEndpointsAreNotSensitiveMvcIT {

            @EnableAutoConfiguration
            public static class MvcIT1 extends AbstractNonSensitiveMvcIT {
                public MvcIT1() {
                    super(null, null, null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT2 extends AbstractNonSensitiveMvcIT {
                public MvcIT2() {
                    super(null, null, "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT3 extends AbstractNonSensitiveMvcIT {
                public MvcIT3() {
                    super(null, "/s", null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT4 extends AbstractNonSensitiveMvcIT {
                public MvcIT4() {
                    super(null, "/s", "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT5 extends AbstractNonSensitiveMvcIT {
                public MvcIT5() {
                    super("/c", null, null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT6 extends AbstractNonSensitiveMvcIT {
                public MvcIT6() {
                    super("/c", null, "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT7 extends AbstractNonSensitiveMvcIT {
                public MvcIT7() {
                    super("/c", "/s", null, null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT8 extends AbstractNonSensitiveMvcIT {
                public MvcIT8() {
                    super("/c", "/s", "/m", null, null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT9 extends AbstractNonSensitiveMvcIT {
                public MvcIT9() {
                    super("/c", "/s", "/m", null, "/h");
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT10 extends AbstractNonSensitiveMvcIT {
                public MvcIT10() {
                    super("/c", "/s", "/m", "/j", null);
                }
            }

            @EnableAutoConfiguration
            public static class MvcIT11 extends AbstractNonSensitiveMvcIT {
                public MvcIT11() {
                    super("/c", "/s", "/m", "/j", "/h");
                }
            }

            @EnableAutoConfiguration
            public static class HawtioIsServedFromRootWithCustomJolokiaPathMvcIT
                    extends AbstractNonSensitiveMvcIT {
                public HawtioIsServedFromRootWithCustomJolokiaPathMvcIT() {
                    super("/c", "/s", "/m", "/j", "/");
                }
            }

            @EnableAutoConfiguration
            public static class HawtioIsServedFromRootWithDefaultJolokiaPathMvcIT
                    extends AbstractNonSensitiveMvcIT {
                public HawtioIsServedFromRootWithDefaultJolokiaPathMvcIT() {
                    super("/c", "/s", "/m", null, "/");
                }

                @Test
                @Override
                public void testHawtioJolokiaRequest() throws Exception {
                    mockMvc.perform(
                            getRequest(hawtioPath + "/jolokia/foo/bar?foo=bar"))
                            .andExpect(status().isOk())
                            .andExpect(forwardedUrl(null));
                }
            }

            @EnableAutoConfiguration
            public static class JolokoiaEndpointIsDisabledMvcIT
                    extends AbstractNonSensitiveMvcIT {
                public JolokoiaEndpointIsDisabledMvcIT() {
                    super("/c", "/s", "/m", null, "/h");
                    setProperty("endpoints.jolokia.enabled", "false");
                }

                @Test
                @Override
                public void testJolokiaRequest() throws Exception {
                    mockMvc.perform(getRequest(jolokiaPath))
                            .andExpect(status().isNotFound())
                            .andExpect(forwardedUrl(null));
                }

                @Test
                @Override
                public void testHawtioJolokiaRequest() throws Exception {
                    mockMvc.perform(
                            getRequest(hawtioPath + "/jolokia/foo/bar?foo=bar"))
                            .andExpect(status().isNotFound())
                            .andExpect(forwardedUrl(null));
                }
            }
        }
    }
}
