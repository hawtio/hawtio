package io.hawt.example.socialplugin;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import twitter4j.*;

import java.util.ArrayList;
import java.util.List;

public class TwitterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TwitterService.class);
    protected TwitterFactory tf;
    private Twitter twitter;

    public List<String> searchTweets(String keywords) throws TwitterException {

        List<String> tweets = new ArrayList<String>();
        Query query = new Query(keywords);
        QueryResult result = null;

        twitter = getTwitterInstance();

        do {
            result = twitter.search(query);
            List<Status> tweetList = result.getTweets();
            for (Status tweet : tweetList) {
                String message = "@" + tweet.getUser().getScreenName() + " - " + tweet.getText();
                //tweets.add(message);
                LOGGER.debug(message);

                StringBuilder builder = new StringBuilder();
                builder.append("{\"tweet\":\"");
                builder.append(message);
                builder.append("\"}");

                //tweets.add(builder.toString());
                tweets.add(message);

            }
        } while ((query = result.nextQuery()) != null);

        return tweets;
    }

    public String userInfo(String id) throws TwitterException {

        twitter = getTwitterInstance();
        ResponseList<User> users = twitter.searchUsers(id,-1);
        User user = users.get(0);

        Gson gson = new Gson();
        String userJSON = gson.toJson(user);

        LOGGER.debug(
                "User info Name : " + user.getName()
                        + ", TimeZone : " + user.getTimeZone()
                        + ", Language : " + user.getLang()
                        + ", Description : " + user.getDescription()
                        + ", Location : " + user.getLocation()
                        + ", Followers : " + user.getFollowersCount()
                        + ", Friends : " + user.getFriendsCount()
                        + ", Favourited : " + user.getFavouritesCount()
                        + ", Tweets : " + user.getStatusesCount()
        );

        return userJSON;
    }

    private Twitter getTwitterInstance() {
        if (twitter != null) {
            return twitter;
        } else {
            twitter = tf.getInstance();
        }
        return twitter;
    }


    public void setTwitterFactory(TwitterFactory tf) {
        this.tf = tf;
    }
}
