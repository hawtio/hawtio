package io.hawt.springboot;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PluginService {

	@Autowired
	List<HawtPlugin> registeredPlugins;

	@RequestMapping("/plugin")
	public @ResponseBody List<HawtPlugin> getPlugins() {
		return registeredPlugins;
	}

}
