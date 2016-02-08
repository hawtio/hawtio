package io.hawt.example.socialplugin;

import twitter4j.TwitterException;

import java.util.List;

public interface SocialMediaMBean {

    /* Attributes */

    /* Operations */
    List<String> searchTweets(String keywords) throws TwitterException;
    String userInfo(String id) throws TwitterException;
}
