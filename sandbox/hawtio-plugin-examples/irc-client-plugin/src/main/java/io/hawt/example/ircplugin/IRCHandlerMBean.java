package io.hawt.example.ircplugin;

import java.util.List;
import java.util.Map;

/**
 * @author Stan Lewis
 */
public interface IRCHandlerMBean {

  /**
   * Connects the current user to an IRC server, the map should be in a format like:
   * {
   *   "host": "my.irc.hostname",
   *   "nickname": "myNick",
   *   "ports": "6667,6668",
   *   "password": "mypass",
   *   "username": "myuser",
   *   "realname": "my name",
   *   "useSSL": false
   * }
   * only "host" and "nickname" are required.
   *
   * @param settings
   */
  void connect(Map<String, String> settings);

  /**
   * Fetch any available messages from the server that the mbean has
   * received
   * @return
   */
  List<Object> fetch();

  /**
   * Send a low-level IRC command to the IRC server
   * @param command
   */
  void send(String command);

  /**
   * Checks to see if we have a connection to the IRC server
   * @return
   */
  boolean connected();

  /**
   * Disconnects the current user from an IRC server
   */
  void disconnect();

  /**
   * Remove away message
   */
  void back();

  /**
   * Sets the user's status to away
   * @param message
   */
  void away(String message);

  /**
   * Join an IRC channel
   * @param channel
   */
  void join(String channel);

  /**
   * Join an IRC channel with a key
   * @param channel
   * @param key
   */
  void join(String channel, String key);

  void kick(String channel, String nick);

  void kick(String channel, String nick, String message);

  void list();

  void list(String channels);

  void names();

  void names(String channels);

  void nick(String nick);

  void notice(String target, String message);

  void part(String channel);

  void part(String channel, String message);

  void topic(String channel);

  void changeTopic(String channel, String topic);

  void getUserHost(String nicknames);

  void who(String nick);

  void whowas(String nick);

  void whois(String nick);

  void message(String target, String message);



}
