package io.hawt.log.osgi;

public interface LogQueryCallback<T> {

    T doWithLogQuery(LogQueryMBean mbean) throws Exception;

}
