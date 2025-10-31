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
package io.hawt.web.auth;

import java.security.Principal;

/**
 * Simple principal to hold a user name of authenticated user (JAAS {@link javax.security.auth.Subject}).
 */
public class UserPrincipal implements Principal {

    private final String userName;

    public UserPrincipal(String userName) {
        this.userName = userName;
    }

    @Override
    public String getName() {
        return userName;
    }

}
