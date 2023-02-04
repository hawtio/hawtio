package io.hawt.log;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class LogFilter implements Serializable {
    private static final long serialVersionUID = 1L;
    private int count;
    private String[] levels;
    private String matchesText;
    private Long beforeTimestamp;
    private Long afterTimestamp;

    @Override
    public String toString() {
        return "LogFilter{" +
            "count=" + count +
            ", afterTimestamp=" + afterTimestamp +
            ", matchesText='" + matchesText + '\'' +
            '}';
    }

    public Set<String> getLevelsSet() {
        if (levels == null || levels.length == 0) {
            return Collections.emptySet();
        }
        return new HashSet<>(Arrays.asList(levels));
    }

    // Properties
    //-------------------------------------------------------------------------

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public String[] getLevels() {
        return levels;
    }

    public void setLevels(String[] levels) {
        this.levels = levels;
    }

    public String getMatchesText() {
        return matchesText;
    }

    public void setMatchesText(String matchesText) {
        this.matchesText = matchesText;
    }

    public Long getBeforeTimestamp() {
        return beforeTimestamp;
    }

    public Long getAfterTimestamp() {
        return afterTimestamp;
    }

    public void setAfterTimestamp(Long afterTimestamp) {
        this.afterTimestamp = afterTimestamp;
    }

    public void setBeforeTimestamp(Long beforeTimestamp) {
        this.beforeTimestamp = beforeTimestamp;
    }
}
