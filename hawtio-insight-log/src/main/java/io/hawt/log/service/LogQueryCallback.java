package io.hawt.log.service;

public interface LogQueryCallback<T> {

    T doWithLogQuery(LogQueryMBean mbean) throws Exception;

}
