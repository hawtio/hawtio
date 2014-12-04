/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web.plugin.karaf.terminal;

import java.io.PipedInputStream;
import java.io.PrintStream;

import org.apache.felix.service.command.CommandProcessor;
import org.apache.felix.service.command.CommandSession;
import org.apache.felix.service.threadio.ThreadIO;
import org.osgi.framework.BundleContext;

/**
 * Karaf is incompatible between 2.2 and 2.x and also between 2.x and 3.x versions.
 * So we need a factory to support both of them.
 */
public interface KarafConsoleFactory {

    CommandSession getSession(Object console);

    void close(Object console, boolean param);

    Object createConsole(CommandProcessor commandProcessor,
                         PipedInputStream in,
                         PrintStream pipedOut,
                         ThreadIO threadIO,
                         BundleContext bundleContext) throws Exception;

}
