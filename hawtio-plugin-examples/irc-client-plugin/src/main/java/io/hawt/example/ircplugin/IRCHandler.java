package io.hawt.example.ircplugin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.security.auth.Subject;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.security.AccessControlContext;
import java.security.AccessController;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Stan Lewis
 */
public class IRCHandler implements IRCHandlerMBean {

  private static final Logger LOG = LoggerFactory.getLogger(IRCHandler.class);

  Map<Subject, IRCConnectionHandler> connections;
  private MBeanServer mBeanServer;
  private ObjectName objectName;

  public void init() {
    this.connections = new ConcurrentHashMap<Subject, IRCConnectionHandler>();
    if (objectName == null) {
      try {
        objectName = getObjectName();
      } catch (Exception e) {
        LOG.warn("Failed to create object name: ", e);
        throw new RuntimeException("Failed to create object name: ", e);
      }
    }

    if (mBeanServer == null) {
      mBeanServer = ManagementFactory.getPlatformMBeanServer();
    }

    if (mBeanServer != null) {
      try {
        mBeanServer.registerMBean(this, objectName);
      } catch(InstanceAlreadyExistsException iaee) {
        // Try to remove and re-register
        try {
          mBeanServer.unregisterMBean(objectName);
          mBeanServer.registerMBean(this, objectName);
        } catch (Exception e) {
          LOG.warn("Failed to register mbean: ", e);
          throw new RuntimeException("Failed to register mbean: ", e);
        }
      } catch (Exception e) {
        LOG.warn("Failed to register mbean: ", e);
        throw new RuntimeException("Failed to register mbean: ", e);
      }
    }

  }

  @Override
  public void connect(Map<String, Object> settings) {

    Subject subject = getSubject();

    IRCConnectionHandler connection = connections.remove(subject);
    if (connection != null) {
      connection.destroy();
    }

    Boolean useSSL = (Boolean)settings.get("useSSL");
    if (useSSL == null) {
      useSSL = Boolean.FALSE;
    }

    try {
      connection = IRCConnectionHandler.create(useSSL, settings);
    } catch (IOException e) {
      throw new RuntimeException("Failed to create connection: ", e);
    }

    if (connection == null) {
      throw new RuntimeException("Failed to create connection, please ensure both a host and nickname are specified");
    }

    System.out.println("Created connection: " + connection);

    connections.put(subject, connection);
  }

  @Override
  public List<Object> fetch() {
    return getConnection().fetch();
  }

  @Override
  public void send(String command) {
    getConnection().send(command);
  }

  @Override
  public boolean connected() {
    Subject subject = getSubject();
    IRCConnectionHandler connection = connections.get(subject);
    if (connection == null) {
      return false;
    }
    return connection.isConnected();
  }

  @Override
  public void disconnect() {
    Subject subject = getSubject();
    IRCConnectionHandler connection = connections.remove(subject);
    if (connection != null) {
      connection.destroy();
    }
  }

  protected Subject getSubject() {
    AccessControlContext acc = AccessController.getContext();
    Subject subject = Subject.getSubject(acc);
    if (subject == null) {
      throw new RuntimeException("Subject is not available, user would not be able to be associated with a connection");
    }
    return subject;
  }

  protected IRCConnectionHandler getConnection() {
    Subject subject = getSubject();
    IRCConnectionHandler answer = connections.get(subject);
    if (answer == null) {
      throw new RuntimeException("No connection");
    }
    return answer;
  }

  protected ObjectName getObjectName() throws Exception {
    return new ObjectName("hawtio:type=IRCHandler");
  }

  public void destroy() {
    for (Subject subject : connections.keySet()) {
      IRCConnectionHandler connection = connections.get(subject);
      if (connection != null) {
        connection.destroy();
      }
    }
    connections.clear();
  }

  @Override
  public void back() {
    getConnection().back();
  }

  @Override
  public void away(String message) {
    getConnection().away(message);
  }

  @Override
  public void join(String channel) {
    getConnection().join(channel);
  }

  @Override
  public void join(String channel, String key) {
    getConnection().join(channel, key);
  }

  @Override
  public void kick(String channel, String nick) {
    getConnection().kick(channel, nick);
  }

  @Override
  public void kick(String channel, String nick, String message) {
    getConnection().kick(channel, nick, message);
  }

  @Override
  public void list() {
    getConnection().list();
  }

  @Override
  public void list(String channels) {
    getConnection().list(channels);
  }

  @Override
  public void names() {
    getConnection().names();
  }

  @Override
  public void names(String channels) {
    getConnection().names(channels);
  }

  @Override
  public void nick(String nick) {
    getConnection().nick(nick);
  }

  @Override
  public void notice(String target, String message) {
    getConnection().notice(target, message);
  }

  @Override
  public void part(String channel) {
    getConnection().part(channel);
  }

  @Override
  public void part(String channel, String message) {
    getConnection().part(channel, message);
  }

  @Override
  public void topic(String channel) {
    getConnection().topic(channel);
  }

  @Override
  public void changeTopic(String channel, String topic) {
    getConnection().changeTopic(channel, topic);
  }

  @Override
  public void getUserHost(String nicknames) {
    getConnection().getUserHost(nicknames);
  }

  @Override
  public void who(String nick) {
    getConnection().who(nick);
  }

  @Override
  public void whowas(String nick) {
    getConnection().whowas(nick);
  }

  @Override
  public void whois(String nick) {
    getConnection().whois(nick);
  }

  @Override
  public void message(String target, String message) {
    getConnection().message(target, message);
  }
}
