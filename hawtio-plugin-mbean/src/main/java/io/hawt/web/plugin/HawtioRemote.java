/*
 * Copyright 2012 Red Hat, Inc.
 *
 * Red Hat licenses this file to you under the Apache License, version
 * 2.0 (the "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied.  See the License for the specific language governing
 * permissions and limitations under the License.
 */

package io.hawt.web.plugin;

/**
 * Hawtio v3 remote plugin interface.
 * <p>
 * Hawtio v3 plugin system is based on <a href="https://module-federation.github.io/">Webpack Module Federation</a>.
 * <p>
 * This interface is the Java representation of
 * <a href="https://github.com/hawtio/hawtio-next/blob/v0.2.0-dev.5/packages/hawtio/src/core/core.ts#L37-L39">HawtioRemote</a>
 * interface in hawtio-next project, which is compatible with
 * <a href="https://github.com/module-federation/universe/blob/utils-1.4.0/packages/utilities/src/utils/importRemote.ts#L9-L15">ImportRemoteOptions</a>
 * interface defined in @module-federation/utilities package.
 */
public interface HawtioRemote {

    String getUrl();

    String getScope();

    String getModule();

    String getRemoteEntryFileName();

    Boolean getBustRemoteEntryCache();

    String getPluginEntry();
}
