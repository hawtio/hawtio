/*
 * Copyright 2026
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
package io.hawt.system.security;

import java.util.concurrent.Callable;
import javax.security.auth.Subject;

public interface SubjectAccess {

    /**
     * Single accessor for <em>current subject</em> for JDKs before and after
     * <a href="https://openjdk.org/jeps/411">JEP 411</a> marked {@code javax.security.auth.Subject#getSubject()}
     * as "for removal".
     *
     * @return
     */
    Subject currentSubject();

    /**
     * Single accessor for {@code Subject.doAs} / {@code Subject.callAs}
     * @param subject
     * @param action
     * @return
     * @param <T>
     */
    <T> T callAs(Subject subject, Callable<T> action) throws Exception;

}
