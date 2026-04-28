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

import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.util.concurrent.Callable;
import javax.security.auth.Subject;

public class ModernSubjectAccess implements SubjectAccess {

    private final MethodHandle current;
    private final MethodHandle callAs;

    public ModernSubjectAccess() {
        try {
            MethodHandles.Lookup lookup = MethodHandles.publicLookup();
            this.current = lookup.findStatic(Subject.class, "current", MethodType.methodType(Subject.class));
            this.callAs = lookup.findStatic(Subject.class, "callAs", MethodType.methodType(Object.class, Subject.class, Callable.class));
        } catch (NoSuchMethodException | IllegalAccessException e) {
            throw new UnsupportedOperationException("Use legacy javax.security.auth.Subject API");
        }
        try {
            current.invoke();
        } catch (Throwable e) {
            throw new UnsupportedOperationException("Use legacy javax.security.auth.Subject API");
        }
    }

    @Override
    public Subject currentSubject() {
        try {
            return (Subject) current.invoke();
        } catch (Throwable e) {
            throw new UnsupportedOperationException("Can't use JDK18+ (JEP 411) javax.security.auth.Subject.current() call", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T callAs(Subject subject, Callable<T> action) throws Exception {
        try {
            return (T) this.callAs.invoke(subject, action);
        } catch (Exception e) {
            throw e;
        } catch (Throwable e) {
            throw new UnsupportedOperationException("Can't use JDK18+ (JEP 411) javax.security.auth.Subject.callAs() call", e);
        }
    }

}
