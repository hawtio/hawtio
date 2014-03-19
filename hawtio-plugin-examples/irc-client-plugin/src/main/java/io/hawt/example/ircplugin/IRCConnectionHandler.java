package io.hawt.example.ircplugin;

import org.schwering.irc.lib.IRCConnection;
import org.schwering.irc.lib.IRCEventAdapter;
import org.schwering.irc.lib.ssl.SSLDefaultTrustManager;
import org.schwering.irc.lib.ssl.SSLIRCConnection;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Stan Lewis
 */
public class IRCConnectionHandler extends IRCEventAdapter {

  private IRCConnection connection;

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
        portsList.add(6697);
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
    connection.setDaemon(true);
    connection.setColors(false);
    connection.setPong(true);
    connection.connect();

    answer.setConnection(connection);

    return answer;
  }

  protected IRCConnectionHandler() {

  }


  public void destroy() {
    connection.close();
  }

  public boolean isConnected() {
    if (connection == null) {
      return false;
    }
    return connection.isConnected();
  }

  public void setConnection(IRCConnection connection) {
    this.connection = connection;
  }
}
