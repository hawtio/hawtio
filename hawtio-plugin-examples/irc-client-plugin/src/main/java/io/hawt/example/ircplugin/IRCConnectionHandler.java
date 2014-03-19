package io.hawt.example.ircplugin;

import org.schwering.irc.lib.IRCConnection;
import org.schwering.irc.lib.IRCEventAdapter;
import org.schwering.irc.lib.IRCModeParser;
import org.schwering.irc.lib.IRCUser;
import org.schwering.irc.lib.ssl.SSLDefaultTrustManager;
import org.schwering.irc.lib.ssl.SSLIRCConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * @author Stan Lewis
 */
public class IRCConnectionHandler extends IRCEventAdapter {

  private static final Logger LOG = LoggerFactory.getLogger(IRCConnectionHandler.class);

  private IRCConnection connection;
  LinkedBlockingQueue<Object> messageQueue;

  public static IRCConnectionHandler create(boolean useSSL, Map<String, Object> settings) throws IOException {

    String host = (String) settings.get("host");
    String pass = (String) settings.get("password");
    String nick = (String) settings.get("nickname");
    String username = (String) settings.get("username");
    String realname = (String) settings.get("realname");
    String portsString = (String) settings.get("ports");

    List<Integer> portsList = new ArrayList<Integer>();

    if (host == null || nick == null) {
      return null;
    }
    if (portsString == null) {
      if (useSSL) {
        portsList.add(6697);
      } else {
        portsList.add(6667);
      }
    } else {
      for (String port : portsString.split(",")) {
        portsList.add(Integer.parseInt(port.trim()));
      }
    }

    int[] ports = new int[portsList.size()];
    for (int i = 0; i < ports.length; i++) {
      ports[i] = portsList.get(i);
    }

    IRCConnectionHandler answer = new IRCConnectionHandler();
    IRCConnection connection;

    if (useSSL) {
      connection = new SSLIRCConnection(host, ports, pass, nick, username, realname);
      ((SSLIRCConnection) connection).addTrustManager(new SSLDefaultTrustManager());
    } else {
      connection = new IRCConnection(host, ports, pass, nick, username, realname);
    }

    connection.addIRCEventListener(answer);
    answer.setConnection(connection);

    connection.setDaemon(true);
    connection.setColors(false);
    connection.setPong(true);

    connection.connect();

    return answer;
  }

  protected IRCConnectionHandler() {
    messageQueue = new LinkedBlockingQueue<Object>();
  }

  public void destroy() {
    if (isConnected()) {
      connection.doQuit();
    }
  }

  public boolean isConnected() {
    if (connection == null) {
      return false;
    }
    return connection.isConnected();
  }

  public String toString() {
    return "ConnectionHandler connection to: " + connection.getHost() + " nick: " + connection.getNick() + " connected: " + connection.isConnected() + " alive: " + connection.isAlive();
  }

  public void setConnection(IRCConnection connection) {
    this.connection = connection;
  }

  public void send(String command) {
    connection.send(command);
  }

  public List<Object> fetch() {
    List<Object> answer = new ArrayList<Object>();
    messageQueue.drainTo(answer);
    return answer;
  }

  protected Map<Object, Object> getMap(Object ... args) {
    Map<Object, Object> answer = new HashMap<Object, Object>();
    if ( args.length % 2 != 0) {
      answer.put("invalid-args", args);
      return answer;
    }
    for (int i = 0; i < args.length; i += 2) {
      answer.put(args[i], args[i + 1]);
    }
    return answer;
  }

  private void putMessage(Map message) {
    LOG.debug("Putting \"" + message + "\" onto message queue");
    try {
      messageQueue.put(message);
    } catch (InterruptedException e) {
      LOG.debug("Interrupted exception putting \"" + message + "\" into queue for connection " + connection.getNick() + "@" + connection.getHost(), e);
    }
  }

  @Override
  public void onError(String msg) {
    Map message = getMap("type", "error", "message", msg);
    putMessage(message);
  }

  @Override
  public void onError(int num, String msg) {
    Map message = getMap("type", "error", "num", num, "message", msg);
    putMessage(message);
  }

  @Override
  public void onInvite(String chan, IRCUser user, String passiveNick) {
    Map message = getMap("type", "invite", "chan", chan, "user", user, "passiveNick", passiveNick);
    putMessage(message);
  }

  @Override
  public void onJoin(String chan, IRCUser user) {
    Map message = getMap("type", "join", "chan", chan, "user", user);
    putMessage(message);
  }

  @Override
  public void onKick(String chan, IRCUser user, String passiveNick, String msg) {
    Map message = getMap("type", "kick", "chan", chan, "user", user, "passiveNick", passiveNick, "message", msg);
    putMessage(message);
  }

  @Override
  public void onMode(String chan, IRCUser user, IRCModeParser modeParser) {
    Map message = getMap("type", "mode", "chan", chan, "user", user, "modeParser", modeParser);
    putMessage(message);
  }

  @Override
  public void onMode(IRCUser user, String passiveNick, String mode) {
    Map message = getMap("type", "mode", "user", user, "passiveNick", passiveNick, "mode", mode);
    putMessage(message);
  }

  @Override
  public void onNick(IRCUser user, String newNick) {
    Map message = getMap("type", "nick", "user", user, "newNick", newNick);
    putMessage(message);
  }

  @Override
  public void onNotice(String target, IRCUser user, String msg) {
    Map message = getMap("type", "notice", "target", target, "user", user, "message", msg);
    putMessage(message);
  }

  @Override
  public void onPart(String chan, IRCUser user, String msg) {
    Map message = getMap("type", "part", "chan", chan, "user", user, "message", msg);
    putMessage(message);
  }


  @Override
  public void onPrivmsg(String target, IRCUser user, String msg) {
    Map message = getMap("type", "privmsg", "target", target, "user", user, "message", msg);
    putMessage(message);
  }

  @Override
  public void onQuit(IRCUser user, String msg) {
    Map message = getMap("type", "quit", "user", user, "message", msg);
    putMessage(message);
  }

  @Override
  public void onReply(int num, String value, String msg) {
    Map message = getMap("type", "reply", "num", num, "value", value, "message", msg);
    putMessage(message);
  }

  @Override
  public void onTopic(String chan, IRCUser user, String topic) {
    Map message = getMap("type", "topic", "chan", chan, "user", user, "topic", topic);
    putMessage(message);
  }

  @Override
  public void unknown(String prefix, String command, String middle, String trailing) {
    Map message = getMap("type", "unknown", "prefix", prefix, "command", command, "middle", middle, "trailing", trailing);
    putMessage(message);
  }

  @Override
  public void onRegistered() {
    Map message = getMap("type", "registered");
    putMessage(message);
  }

  @Override
  public void onDisconnected() {
    Map message = getMap("type", "disconnected");
    putMessage(message);
  }

  @Override
  public void onPing(String ping) {
    Map message = getMap("type", "ping", "ping", ping);
    putMessage(message);
  }

  public void back() {
    connection.doAway();
  }

  public void away(String message) {
    connection.doAway(message);
  }

  public void join(String channel) {
    connection.doJoin(channel);
  }

  public void join(String channel, String key) {
    connection.doJoin(channel, key);
  }

  public void kick(String channel, String nick) {
    connection.doKick(channel, nick);
  }

  public void kick(String channel, String nick, String message) {
    connection.doKick(channel, nick, message);
  }

  public void list() {
    connection.doList();
  }
}
