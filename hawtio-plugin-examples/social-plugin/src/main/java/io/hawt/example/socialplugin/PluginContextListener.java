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

    private static final String CONSUMER_KEY = "rtPIDQIqbGsEK1TEQA5g";
    private static final String CONSUMER_SECRET = "HyoWW3B4wJHesm0tvf4IVI9C9aRHX40TuyEz8qrk";
    private static final String ACCESS_TOKEN = "DoreB85PQt3bCDMpQQYUsBTzRprjOAAulD2RmG0IP";
    private static final String ACCESS_TOKEN_SECRET = "VNjI9IrPNA2XHEnlGF37QZAzOuRzHY3esg0B8jWGs";

    HawtioPlugin plugin = null;
    SocialMedia socialMedia;
    TwitterFactory tf;
    TwitterService ts;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {

        ServletContext context = servletContextEvent.getServletContext();

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
        tf.setAccessToken(ACCESS_TOKEN);
        tf.setAccessTokenSecret(ACCESS_TOKEN_SECRET);
        tf.setConsumerKey(CONSUMER_KEY);
        tf.setConsumerSecret(CONSUMER_SECRET);

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
