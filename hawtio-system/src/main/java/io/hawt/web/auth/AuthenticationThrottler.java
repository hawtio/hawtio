package io.hawt.web.auth;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.hawt.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class implements authentication throttling to protect Hawtio
 * from brute force attacks.
 */
public class AuthenticationThrottler {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticationThrottler.class);

    /**
     * The length of time (in days) until a cache entry is invalidated after last access.
     */
    private static final long CACHE_DURATION = 1;

    private final Cache<String, Attempt> attempts;

    public AuthenticationThrottler() {
        LOG.debug("{} initialised", getClass().getSimpleName());
        attempts = Caffeine.newBuilder()
            .expireAfterAccess(CACHE_DURATION, TimeUnit.DAYS)
            .build();
    }

    public Attempt attempt(String username) {
        LOG.debug("Attempt: {}", username);

        if (Strings.isBlank(username)) {
            return null;
        }

        return attempts.getIfPresent(username);
    }

    public void increase(String username) {
        LOG.debug("Increase: {}", username);

        if (Strings.isBlank(username) || "public".equals(username)) {
            return;
        }

        Attempt attempt = attempts.get(username, Attempt::new);
        attempt.increase();
    }

    public void reset(String username) {
        LOG.debug("Reset: {}", username);

        if (Strings.isBlank(username)) {
            return;
        }

        attempts.invalidate(username);
    }

    public static class Attempt {
        static final long INTERVAL = 1; // In seconds
        static final long MULTIPLIER = 2;
        static final long MAX_BACKOFF = 24 * 60 * 60; // 24h in seconds

        final String username;
        private long timestamp = 0;
        private int count = 0;

        private Attempt(String username) {
            this.username = username;
        }

        private void increase() {
            timestamp = System.currentTimeMillis();
            count++;
        }

        private long backoff() {
            // Ignore first 3 attempts
            if (count < 3) {
                return timestamp;
            }
            int power = count - 3;
            // backoff = interval * multiplier ^ power
            long backoff = (long) (INTERVAL * Math.pow(MULTIPLIER, power));
            return timestamp + Math.min(backoff, MAX_BACKOFF) * 1000;
        }

        public long retryAfter() {
            long now = System.currentTimeMillis();
            return (backoff() - now) / 1000;
        }

        public boolean isBlocked() {
            return retryAfter() > 0;
        }

        @Override
        public String toString() {
            return String.format(
                "Attempt{username=%s, timestamp=%s, count=%s, retryAfter=%s}",
                username,
                new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(timestamp)),
                count,
                retryAfter());
        }
    }
}
