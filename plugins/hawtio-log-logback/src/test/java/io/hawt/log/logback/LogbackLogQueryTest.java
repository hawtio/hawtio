package io.hawt.log.logback;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import io.hawt.log.LogEvent;
import io.hawt.log.LogFilter;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

public class LogbackLogQueryTest {
    private static final Logger LOG = LoggerFactory.getLogger(LogbackLogQueryTest.class);

    private LogbackLogQuery logQuery;

    @Before
    public void setUp() {
        logQuery = new LogbackLogQuery();
        logQuery.start();
    }

    @After
    public void tearDown() {
        logQuery.stop();
    }

    @Test
    public void testGetLogResults() {
        // Given
        String message = "testGetLogResults - Hello Hawtio";
        IntStream.range(0, 10).forEach(i -> LOG.info(message + " #{}", i));

        // When
        List<LogEvent> events = logQuery.getLogResults(10).getEvents();

        // Then
        assertThat(events.size()).isEqualTo(10);
        List<String> messages = events.stream()
            .map(LogEvent::getMessage)
            .collect(Collectors.toList());
        assertThat(messages).contains(message + " #5");
    }

    @Test
    public void testQueryLogResults() {
        // Given
        String message = "testQueryLogResults - Hello Hawtio";
        IntStream.range(0, 10).forEach(i -> LOG.info(message + " #{}", i));

        // When
        LogFilter filter = new LogFilter();
        filter.setMatchesText(message);
        filter.setCount(10);
        List<LogEvent> events = logQuery.queryLogResults(filter).getEvents();

        // Then
        assertThat(events.size()).isEqualTo(10);
        events.stream()
            .map(LogEvent::getMessage)
            .forEach(m -> assertThat(m).contains(message));
    }

}
