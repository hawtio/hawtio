package io.hawt.example.socialplugin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import twitter4j.TwitterException;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import java.lang.management.ManagementFactory;
import java.util.List;

public class SocialMedia implements SocialMediaMBean {

    private static final transient Logger LOG = LoggerFactory.getLogger(SocialMedia.class);

    private MBeanServer mBeanServer;
    private ObjectName objectName;
    private Integer result;
    private TwitterService twitterService;
    private Integer counter;

    public String userInfo(String id) throws TwitterException {
        return twitterService.userInfo(id);
    }

    public List<String> searchTweets(String keywords) throws TwitterException {
       return twitterService.searchTweets(keywords);
    }

    public void init() {
        try {
            if (objectName == null) {
                objectName = new ObjectName("hawtio:type=SocialMedia");
            }
            if (mBeanServer == null) {
                mBeanServer = ManagementFactory.getPlatformMBeanServer();
            }
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                LOG.info("Re-registering Social MBean");
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception during initialization: ", e);
            throw new RuntimeException(e);
        }
    }

    public void destroy() {
        try {
            if (objectName != null && mBeanServer != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        } catch (Exception e) {
            LOG.warn("Exception unregistering mbean: ", e);
            throw new RuntimeException(e);
        }
    }

    public void setTwitterService(TwitterService twitterService) {
        this.twitterService = twitterService;
    }

}
