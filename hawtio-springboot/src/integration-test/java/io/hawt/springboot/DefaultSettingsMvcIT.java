package io.hawt.springboot;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

@EnableAutoConfiguration
public class DefaultSettingsMvcIT extends AbstractMvcIT {

    @Test
    public void testHawtioRootIsUnauthorized() throws Exception {
        mockMvc.perform(get("/hawtio/")).andExpect(status().isUnauthorized());
    }

    @Test
    public void testJolokiaIsForbidden() throws Exception {
        mockMvc.perform(get("/jolokia")).andExpect(status().isForbidden());
    }

    @Test
    public void testHawtioJolokiaIsForbidden() throws Exception {
        mockMvc.perform(get("/hawtio/jolokia")).andExpect(status().isForbidden());
    }

    @Test
    public void testHawtioPluginIsUnauthorized() throws Exception {
        mockMvc.perform(get("/hawtio/plugin")).andExpect(status().isUnauthorized());
    }
}
