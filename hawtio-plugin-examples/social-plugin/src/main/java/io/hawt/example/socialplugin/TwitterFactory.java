package io.hawt.example.socialplugin;

import twitter4j.Twitter;
import twitter4j.conf.ConfigurationBuilder;

public class TwitterFactory {

    protected String consumerKey;
    protected String consumerSecret;
    protected String accessToken;
    protected String accessTokenSecret;
    protected Twitter twitter;

    public Twitter getInstance() {
        if (twitter != null) {
            return twitter;
        } else {
            ConfigurationBuilder cb = new ConfigurationBuilder();
            cb.setDebugEnabled(false)
                    .setOAuthConsumerKey(consumerKey)
                    .setOAuthConsumerSecret(consumerSecret)
                    .setOAuthAccessToken(accessToken)
                    .setOAuthAccessTokenSecret(accessTokenSecret);
            twitter4j.TwitterFactory tf =  new twitter4j.TwitterFactory(cb.build());
            twitter = tf.getInstance();
            return twitter;
        }
    }

    public String getConsumerKey() {
        return consumerKey;
    }

    public void setConsumerKey(String consumerKey) {
        this.consumerKey = consumerKey;
    }

    public String getConsumerSecret() {
        return consumerSecret;
    }

    public void setConsumerSecret(String consumerSecret) {
        this.consumerSecret = consumerSecret;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessTokenSecret() {
        return accessTokenSecret;
    }

    public void setAccessTokenSecret(String accessTokenSecret) {
        this.accessTokenSecret = accessTokenSecret;
    }
}