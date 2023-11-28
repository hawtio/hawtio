///usr/bin/env jbang "$0" "$@" ; exit $?

/*
 * Copyright (C) 2013 the original author or authors.
 * See the NOTICE file distributed with this work for additional
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

//JAVA 17+
//REPOS mavencentral
//DEPS io.hawt:hawtio-embedded:${hawtio.jbang.version:4.0-M3}

package main;

import io.hawt.embedded.Main;

/**
 * Main to run HawtioJBang
 */
public class HawtioJBang {

    public static void main(String... args) {
        Main.run(args);
    }

}
