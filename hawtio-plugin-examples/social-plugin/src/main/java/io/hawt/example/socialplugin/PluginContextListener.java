package io.hawt.example.socialplugin;

import io.hawt.web.plugin.HawtioPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * @author Charles Moulliard
 */
public class PluginContextListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(PluginContextListener.class);

    private String CONSUMER_KEY;
    private String CONSUMER_SECRET;
    private String ACCESS_TOKEN;
    private String ACCESS_TOKEN_SECRET;
    private ServletContext context;

    HawtioPlugin plugin = null;
    SocialMedia socialMedia;
    TwitterFactory tf;
    TwitterService ts;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {

        context = servletContextEvent.getServletContext();

        plugin = new HawtioPlugin();
        plugin.setContext((String) context.getInitParameter("plugin-context"));
        plugin.setName(context.getInitParameter("plugin-name"));
        plugin.setScripts(context.getInitParameter("plugin-scripts"));
        plugin.setDomain(null);
        plugin.init();

        initMbean();

        LOG.info("Initialized {} plugin", plugin.getName());
    }

    public void initMbean() {
        tf = new TwitterFactory();
        tf.setAccessToken(context.getInitParameter("access-token"));
        tf.setAccessTokenSecret(context.getInitParameter("access-token-secret"));
        tf.setConsumerKey(context.getInitParameter("consumer-key"));
        tf.setConsumerSecret(context.getInitParameter("consumer-secret"));

        ts = new TwitterService();
        ts.setTwitterFactory(tf);

        socialMedia = new SocialMedia();
        socialMedia.setTwitterService(ts);
        socialMedia.init();
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        plugin.destroy();
        socialMedia.destroy();
        LOG.info("Destroyed {} plugin", plugin.getName());
    }
}
