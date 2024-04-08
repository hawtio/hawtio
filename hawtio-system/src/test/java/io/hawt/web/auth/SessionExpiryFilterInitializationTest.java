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
package io.hawt.web.auth;

import java.lang.reflect.Field;

import io.hawt.system.ConfigManager;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.util.ReflectionUtils;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class SessionExpiryFilterInitializationTest {

    @Test
    public void initializationTest() throws Exception {
        FilterConfig fc = mock(FilterConfig.class);
        ServletContext sc = mock(ServletContext.class);
        when(fc.getServletContext()).thenReturn(sc);
        when(sc.getAttribute(ConfigManager.CONFIG_MANAGER)).thenReturn(new ConfigManager());

        ArgumentCaptor<AuthenticationConfiguration> ac = ArgumentCaptor.forClass(AuthenticationConfiguration.class);
        AuthenticationConfiguration.getConfiguration(sc);
        verify(sc).setAttribute(eq(AuthenticationConfiguration.AUTHENTICATION_CONFIGURATION), ac.capture());
        when(sc.getAttribute(AuthenticationConfiguration.AUTHENTICATION_CONFIGURATION)).thenReturn(ac.getValue());

        SessionExpiryFilter filter = new SessionExpiryFilter();
        Field pathIndexField = SessionExpiryFilter.class.getDeclaredField("pathIndex");

        when(sc.getAttribute(SessionExpiryFilter.SERVLET_PATH)).thenReturn("/my-special-actuator/hawtio");
        filter.init(fc);
        assertEquals(2, ReflectionUtils.tryToReadFieldValue(pathIndexField, filter).get());

        when(sc.getAttribute(SessionExpiryFilter.SERVLET_PATH)).thenReturn("/my-special-actuator/endpoints/hawtio");
        filter.init(fc);
        assertEquals(3, ReflectionUtils.tryToReadFieldValue(pathIndexField, filter).get());

        when(sc.getAttribute(SessionExpiryFilter.SERVLET_PATH)).thenReturn("/");
        filter.init(fc);
        assertEquals(0, ReflectionUtils.tryToReadFieldValue(pathIndexField, filter).get());
    }

}
