package io.hawt.springboot;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

@EnableAutoConfiguration
public class DefaultSettingsMvcIT extends AbstractMvcIT {

    @Test
    public void testHawtioLoginRedirect() throws Exception {
        mockMvc.perform(get("/hawtio/"))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("/hawtio/auth/login"));
    }

    @Test
    public void testJolokiaIsForbidden() throws Exception {
        mockMvc.perform(get("/jolokia")).andExpect(status().isForbidden());
    }

    @Test
    public void testHawtioPluginLoginRedirect() throws Exception {
        mockMvc.perform(get("/hawtio/plugin")).andExpect(status().isFound());
    }
}
