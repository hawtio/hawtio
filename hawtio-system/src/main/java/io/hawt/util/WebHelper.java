/*
 * Copyright 2024 hawt.io
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
package io.hawt.util;

import io.hawt.web.auth.SessionExpiryFilter;
import jakarta.servlet.ServletContext;

public class WebHelper {

    /**
     * Normalizes a path. If the path contains a single '/' character it is returned
     * unchanged, otherwise the path is:
     * <ol>
     * <li>stripped from all multiple consecutive occurrences of '/' characters</li>
     * <li>stripped from trailing '/' character(s)</li>
     * </ol>
     *
     * @param path
     *            path to normalize
     * @return normalized path
     */
    public static String cleanPath(final String path) {
        final String result = path.replaceAll("//+", "/");
        return result.length() == 1 && result.charAt(0) == '/' ? result
            : result.replaceAll("/+$", "");
    }

    /**
     * Creates a web context path from components. Concatenates all path components
     * using '/' character as delimiter and the result is then:
     * <ol>
     * <li>prefixed with '/' character</li>
     * <li>stripped from all multiple consecutive occurrences of '/' characters</li>
     * <li>stripped from trailing '/' character(s)</li>
     * </ol>
     *
     * @return empty string or string which starts with a "/" character but does not
     *         end with a "/" character
     */
    public static String webContextPath(final String first, final String... more) {
        if (more.length == 0 && (first == null || first.isEmpty())) {
            return "";
        }

        final StringBuilder b = new StringBuilder();
        if (first != null) {
            if (!first.startsWith("/")) {
                b.append('/');
            }
            b.append(first);
        }

        for (final String s : more) {
            if (s != null && !s.isEmpty()) {
                b.append('/');
                b.append(s);
            }
        }

        final String cleanedPath = cleanPath(b.toString());
        return cleanedPath.length() == 1 ? "" : cleanedPath;
    }

    /**
     * Return a number of web path segments that need to be skipped to reach <em>hawtio path</em>. In JakartaEE
     * environment (WAR) everything after context path is "hawtio path", so {@code 0} is returned. In Spring Boot
     * we may have to skip some segments (like {@code /actuator/hawtio}).
     *
     * @param servletContext
     * @return
     */
    public static int hawtioPathIndex(ServletContext servletContext) {
        String servletPath = (String) servletContext.getAttribute(SessionExpiryFilter.SERVLET_PATH);
        if (servletPath == null) {
            // this attribute is set only in non JakartaEE environments, so here we are in standard WAR
            // deployment. Just return "0", which means full path without initial context path
            return 0;
        } else {
            // when SessionExpiryFilter.SERVLET_PATH is set, it contains prefix which should be skipped and which
            // is not standard JakartaEE path components (context path, servlet path, path info).
            // for Spring Boot we have to skip dispatcher servlet path, management endpoints base ("/actuator")
            // and management endpoint mapping
            String cleanPath = webContextPath(servletPath);
            int pathIndex = 0;
            // for "/actuator/hawtio", we have to return "2", so count slashes
            for (char c : cleanPath.toCharArray()) {
                if (c == '/') {
                    pathIndex++;
                }
            }
            return pathIndex;
        }
    }

}
