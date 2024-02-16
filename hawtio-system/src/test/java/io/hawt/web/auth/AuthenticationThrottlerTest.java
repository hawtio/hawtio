package io.hawt.web.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AuthenticationThrottlerTest {

    private AuthenticationThrottler throttler;

    @BeforeEach
    public void setUp() {
        throttler = new AuthenticationThrottler();
    }

    @Test
    public void throttle() throws Exception {
        // 1st attempt
        assertNull(throttler.attempt("user1"));
        throttler.increase("user1");

        // 2nd attempt
        var attempt = throttler.attempt("user1");
        assertNotNull(attempt);
        assertEquals("user1", attempt.username);
        // First 3 attempts should be ignored
        assertFalse(attempt.retryAfter() > 0);
        assertFalse(attempt.isBlocked());
        throttler.increase("user1");

        // 3rd attempt
        assertFalse(attempt.retryAfter() > 0);
        assertFalse(attempt.isBlocked());
        throttler.increase("user1");

        // 4th attempt in case for test stability
        throttler.increase("user1");

        // 5th attempt
        assertTrue(attempt.retryAfter() > 0);
        assertTrue(attempt.isBlocked());
        Thread.sleep(attempt.retryAfter() * 1000 + 100);
        assertFalse(attempt.retryAfter() > 0);
        assertFalse(attempt.isBlocked());

        throttler.reset("user1");
        assertNull(throttler.attempt("user1"));
    }

    @Test
    public void throttle_annonymousUser() {
        assertNull(throttler.attempt(null));
        assertNull(throttler.attempt("public"));

        throttler.increase(null);
        throttler.increase("public");
        assertNull(throttler.attempt(null));
        assertNull(throttler.attempt("public"));

        throttler.reset(null);
        throttler.reset("public");
        assertNull(throttler.attempt(null));
        assertNull(throttler.attempt("public"));
    }
}
