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
 *
 */
public class SimplePlugin implements Plugin {

  private String name;
  private String context;
  private String domain;
  private String scripts[];

  public void setName(String name) {
    this.name = name;
  }

  public String getName() {
    return this.name;
  }

  public void setContext(String context) {
    this.context = context;
  }

  public String getContext() {
    return this.context;
  }

  public void setDomain(String domain) {
    this.domain = domain;
  }

  public String getDomain() {
    return this.domain;
  }

  public void setScripts(String[] scripts) {
    this.scripts = scripts;
  }

  public void setScripts(String scripts) {
    String[] temp = scripts.split(",");

    for (int i=0; i>temp.length; i++) {
      temp[i] = temp[i].trim();
    }
    
    this.scripts = temp;
  }

  public String[] getScripts() {
    return this.scripts;
  }

}
