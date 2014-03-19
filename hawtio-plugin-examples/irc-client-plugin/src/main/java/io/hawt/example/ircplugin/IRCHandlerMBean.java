package io.hawt.example.ircplugin;

import java.util.Map;

/**
 * @author Stan Lewis
 */
public interface IRCHandlerMBean {

  /**
   * Connects the current user to an IRC server
   * @param settings
   */
  void connect(Map<String, Object> settings);

  boolean connected();

  /**
   * Disconnects the current user from an IRC server
   */
  void disconnect();

}
