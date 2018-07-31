/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.embedded;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

public class Options {

    private final List<Option> options = new ArrayList<>();
    private String warLocation;
    private String war;
    private String contextPath = "/hawtio";
    private String plugins = "plugins";
    private String host = "0.0.0.0";
    private Integer port = 8080;
    private String extraClassPath;
    private boolean help;
    private boolean jointServerThread;
    private boolean openUrl = true;
    private String keyStore = null;
    private String keyStorePass = null;

    private abstract class Option {
        private String abbreviation;
        private String fullName;
        private String description;

        protected Option(String abbreviation, String fullName, String description) {
            this.abbreviation = "-" + abbreviation;
            this.fullName = "--" + fullName;
            this.description = description;
        }

        public boolean processOption(String arg, LinkedList<String> remainingArgs) {
            if (arg.equalsIgnoreCase(abbreviation) || fullName.startsWith(arg)) {
                doProcess(arg, remainingArgs);
                return true;
            }
            return false;
        }

        public String getAbbreviation() {
            return abbreviation;
        }

        public String getDescription() {
            return description;
        }

        public String getFullName() {
            return fullName;
        }

        public String getInformation() {
            return "  " + getAbbreviation() + " or " + getFullName() + " = " + getDescription();
        }

        protected abstract void doProcess(String arg, LinkedList<String> remainingArgs);
    }

    private abstract class ParameterOption extends Option {

        protected ParameterOption(String abbreviation, String fullName, String description) {
            super(abbreviation, fullName, description);
        }

        protected void doProcess(String arg, LinkedList<String> remainingArgs) {
            if (remainingArgs.isEmpty()) {
                System.err.println("Expected fileName for ");
                showOptions();
            } else {
                String parameter = remainingArgs.removeFirst();
                doProcess(arg, parameter, remainingArgs);
            }
        }

        public String getInformation() {
            return "  " + getAbbreviation() + " or " + getFullName() + " = " + getDescription();
        }

        protected abstract void doProcess(String arg, String parameter, LinkedList<String> remainingArgs);
    }

    public void init() {
        addOption(new Option("h", "help", "Displays the help screen") {
            protected void doProcess(String arg, LinkedList<String> remainingArgs) {
                help = true;
            }
        });

        addOption(new ParameterOption("j", "join", "Join server thread") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                jointServerThread = Boolean.valueOf(parameter);
            }
        });

        addOption(new ParameterOption("w", "war", "War file or directory of the hawtio web application") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                war = parameter;
            }
        });

        addOption(new ParameterOption("l", "warLocation", "Directory to search for .war files") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                warLocation = parameter;
            }
        });

        addOption(new ParameterOption("pd", "pluginsDir", "Directory to search for .war files to install as 3rd party plugins") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                plugins = parameter;
            }
        });

        addOption(new ParameterOption("c", "contextPath", "Context path") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                // must have leading slash
                if (!parameter.startsWith("/")) {
                    contextPath = "/" + parameter;
                } else {
                    contextPath = parameter;
                }
            }
        });

        addOption(new ParameterOption("hst", "host", "Hostname to listen to") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                host = parameter;
            }
        });

        addOption(new ParameterOption("p", "port", "Port number") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                try {
                    port = Integer.parseInt(parameter);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Invalid port number " + parameter + " due " + e.getMessage());
                }
            }
        });

        addOption(new ParameterOption("ecp", "extraClassPath", "Extra classpath") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                extraClassPath = parameter;
            }
        });

        addOption(new ParameterOption("ou", "openUrl", "Open the web console automatic in the web browser") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                openUrl = Boolean.valueOf(parameter);
            }
        });
        addOption(new ParameterOption("ks", "keyStore", "JKS keyStore with the keys for https") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                keyStore = parameter;
            }
        });
        addOption(new ParameterOption("kp", "keyStorePass", "password for the JKS keyStore with the keys for https") {
            protected void doProcess(String arg, String parameter, LinkedList<String> remainingArgs) {
                keyStorePass = parameter;
            }
        });

    }

    private void addOption(Option option) {
        options.add(option);
    }

    public void showOptions() {
        System.out.println("hawtio takes the following options");
        System.out.println();
        for (Option option : options) {
            System.out.println(option.getInformation());
        }
        System.out.println();
        System.out.println();
    }

    public String usedOptionsSummary() {
        StringBuilder sb = new StringBuilder();
        sb.append("Using options [");
        if (war != null) {
            sb.append("\n\twar=").append(war);
        }
        if (warLocation != null) {
            sb.append("\n\twarLocation=").append(warLocation);
        }
        if (contextPath != null) {
            sb.append("\n\tcontextPath=").append(contextPath);
        }
        if (host != null) {
            sb.append("\n\thost=").append(host);
        }
        if (port != null) {
            sb.append("\n\tport=").append(port);
        }
        if (extraClassPath != null) {
            sb.append("\n\textraClassPath=").append(extraClassPath);
        }
        if (plugins != null) {
            sb.append("\n\tplugins=").append(plugins);
        }
        if (keyStore != null) {
            sb.append("\n\tkeyStore=").append(keyStore);
        }
        if (keyStorePass != null) {
            sb.append("\n\tkeyStore=").append(keyStorePass);
        }
        sb.append("\n\topenUrl=").append(openUrl);
        sb.append("\n\tjointServerThread=").append(jointServerThread);
        sb.append("\n\thelp=").append(help);
        sb.append("]");
        return sb.toString();
    }

    public boolean parseArguments(String[] arguments) {
        LinkedList<String> args = new LinkedList<>(Arrays.asList(arguments));

        boolean valid = true;
        while (!args.isEmpty()) {
            String arg = args.removeFirst();

            boolean handled = false;
            for (Option option : options) {
                if (option.processOption(arg, args)) {
                    handled = true;
                    break;
                }
            }
            if (!handled) {
                System.out.println("Error: Unknown option: " + arg);
                System.out.println();
                valid = false;
                break;
            }
        }

        return valid;
    }

    public String getWar() {
        return war;
    }

    public void setWar(String war) {
        this.war = war;
    }

    public String getWarLocation() {
        return warLocation;
    }

    public void setWarLocation(String warLocation) {
        this.warLocation = warLocation;
    }

    public String getContextPath() {
        return contextPath;
    }

    public void setContextPath(String contextPath) {
        this.contextPath = contextPath;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getPlugins() {
        return plugins;
    }

    public void setPlugins(String plugins) {
        this.plugins = plugins;
    }

    public String getExtraClassPath() {
        return extraClassPath;
    }

    public void setExtraClassPath(String extraClassPath) {
        this.extraClassPath = extraClassPath;
    }

    public boolean isJointServerThread() {
        return jointServerThread;
    }

    public void setJointServerThread(boolean jointServerThread) {
        this.jointServerThread = jointServerThread;
    }

    public boolean isOpenUrl() {
        return openUrl;
    }

    public void setOpenUrl(boolean openUrl) {
        this.openUrl = openUrl;
    }

    public boolean isHelp() {
        return help;
    }

    public String getKeyStore() {
        return keyStore;
    }

    public void setKeyStore(String keyStore) {
        this.keyStore = keyStore;
    }

    public String getKeyStorePass() {
        return keyStorePass;
    }

    public void setKeyStorePass(String keyStorePass) {
        this.keyStorePass = keyStorePass;
    }
}
