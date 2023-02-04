package io.hawt.log.rest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonCreator;

public class LogRequest {
    private long from;
    private long size;
    private List<Map<String, String>> sort;
    private Map query;

    public static LogRequest newInstance(Long maxLogSeq) {
        List<Map<String, String>> s = new ArrayList<>();
        s.add(keyValueMap("timestamp", "desc"));
        s.add(keyValueMap("seq", "desc"));

        Map<String, Object> q = new HashMap<>();
        Map<String, Object> constantScore = new HashMap<>();
        Map<String, Object> filter = new HashMap<>();

        q.put("constant_score", constantScore);
        constantScore.put("filter", filter);

        List<Map<String, Object>> listOfTerms = new ArrayList<>();
        //listOfTerms.add(createSearchTerm("host", "root"));
        listOfTerms.add(createSearchTerms("level", "error", "warn", "info"));

        if (maxLogSeq != null) {
            listOfTerms.add(createSearchRangeGt("seq", maxLogSeq));
        }

        filter.put("and", listOfTerms);

        return new LogRequest(0, 50, s, q);
    }

    private static Map<String, String> keyValueMap(String key, String value) {
        Map<String, String> answer = new HashMap<String, String>();
        answer.put(key, value);
        return answer;
    }

    protected static Map<String, Object> createSearchRangeGt(String name, Object value) {
        return createSearchRange(name, "gt", value);
    }

    protected static Map<String, Object> createSearchRange(String name, String compareOperation, Object value) {
        Map<String, Object> answer = new HashMap<>();
        Map<String, Object> range = new HashMap<>();
        Map<String, Object> compare = new HashMap<>();
        answer.put("range", range);
        range.put(compareOperation, compare);
        compare.put(name, value);
        return answer;
    }

    protected static Map createSearchTerm(String name, String value) {
        Map answer = new HashMap();
        Map term = new HashMap();
        answer.put("term", term);
        term.put(name, value);
        return answer;
    }

    protected static Map<String, Object> createSearchTerms(String name, String... values) {
        Map<String, Object> answer = new HashMap<>();
        Map<String, Object> term = new HashMap<>();
        answer.put("terms", term);
        term.put(name, new ArrayList<>(Arrays.asList(values)));
        return answer;
    }

    @JsonCreator
    public LogRequest(long from, long size, List<Map<String, String>> sort, Map query) {
        this.from = from;
        this.size = size;
        this.sort = sort;
        this.query = query;
    }

    public long getFrom() {
        return from;
    }

    public void setFrom(long from) {
        this.from = from;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public List<Map<String, String>> getSort() {
        return sort;
    }

    public void setSort(List<Map<String, String>> sort) {
        this.sort = sort;
    }

    public Map getQuery() {
        return query;
    }

    public void setQuery(Map query) {
        this.query = query;
    }

}
