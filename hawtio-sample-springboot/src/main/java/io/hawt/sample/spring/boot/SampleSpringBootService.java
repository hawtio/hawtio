package io.hawt.sample.spring.boot;

import io.hawt.config.ConfigFacade;
import io.hawt.springboot.HawtPlugin;
import io.hawt.springboot.PluginService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleSpringBootService {

    public static void main(String[] args) {
		SpringApplication.run(SampleSpringBootService.class, args);
    }

	/**
	 * Loading an example plugin
	 * @return
	 */
	@Bean
	public HawtPlugin samplePlugin() {
		return new HawtPlugin("sample-plugin", "/hawtio/plugins", "", new String[] { "sample-plugin/js/sample-plugin.js" });
	}
	
	/**
	 * Set things up to be in offline mode
	 * @return
	 * @throws Exception
	 */
	@Bean
	public ConfigFacade configFacade() throws Exception {
		ConfigFacade config = new ConfigFacade() {
			public boolean isOffline() {
				return true;
			}
		};
		config.init();
		return config;
	}
	
	/**
	 * Register rest endpoint to handle requests for /plugin, and return all registered plugins.
	 * @return
	 */
	@Bean
	public PluginService pluginService(){
		return new PluginService();
	}
}
