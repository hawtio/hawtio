var _apacheCamelModelVersion = '2.20.0';

var _apacheCamelModel ={
  "definitions": {
    "expression": {
      "type": "object",
      "title": "expression",
      "group": "language",
      "icon": "generic24.png",
      "description": "Expression in the choose language",
      "properties": {
        "expression": {
          "kind": "element",
          "type": "string",
          "title": "Expression",
          "description": "The expression",
          "required": true
        },
        "language": {
          "kind": "element",
          "type": "string",
          "title": "Expression",
          "description": "The chosen language",
          "required": true,
          "enum": [ "constant", "el", "exchangeProperty", "groovy", "header", "javaScript", "jsonpath", "jxpath", "language", "method", "mvel", "ognl", "php", "python", "ref", "ruby", "simple", "spel", "sql", "terser", "tokenize", "xpath", "xquery", "xtokenize" ]
        }
      }
    },
    "aggregate": {
      "type": "object",
      "title": "Aggregate",
      "group": "eip,routing",
      "icon": "aggregate24.png",
      "description": "Aggregates many messages into a single message",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "correlationExpression": {
          "kind": "expression",
          "type": "object",
          "description": "The expression used to calculate the correlation key to use for aggregation. The Exchange which has the same correlation key is aggregated together. If the correlation key could not be evaluated an Exception is thrown. You can disable this by using the ignoreBadCorrelationKeys option.",
          "title": "Correlation Expression",
          "required": true,
          "deprecated": false
        },
        "completionPredicate": {
          "kind": "expression",
          "type": "object",
          "description": "A Predicate to indicate when an aggregated exchange is complete. If this is not specified and the AggregationStrategy object implements Predicate the aggregationStrategy object will be used as the completionPredicate.",
          "title": "Completion Predicate",
          "required": false,
          "deprecated": false
        },
        "completionTimeoutExpression": {
          "kind": "expression",
          "type": "object",
          "description": "Time in millis that an aggregated exchange should be inactive before its complete (timeout). This option can be set as either a fixed value or using an Expression which allows you to evaluate a timeout dynamically - will use Long as result. If both are set Camel will fallback to use the fixed value if the Expression result was null or 0. You cannot use this option together with completionInterval only one of the two can be used. By default the timeout checker runs every second you can use the completionTimeoutCheckerInterval option to configure how frequently to run the checker. The timeout is an approximation and there is no guarantee that the a timeout is triggered exactly after the timeout value. It is not recommended to use very low timeout values or checker intervals.",
          "title": "Completion Timeout",
          "required": false,
          "deprecated": false
        },
        "completionSizeExpression": {
          "kind": "expression",
          "type": "object",
          "description": "Number of messages aggregated before the aggregation is complete. This option can be set as either a fixed value or using an Expression which allows you to evaluate a size dynamically - will use Integer as result. If both are set Camel will fallback to use the fixed value if the Expression result was null or 0.",
          "title": "Completion Size",
          "required": false,
          "deprecated": false
        },
        "optimisticLockRetryPolicy": {
          "kind": "element",
          "type": "object",
          "description": "Allows to configure retry settings when using optimistic locking.",
          "title": "Optimistic Lock Retry Policy",
          "required": false,
          "deprecated": false
        },
        "parallelProcessing": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "When aggregated are completed they are being send out of the aggregator. This option indicates whether or not Camel should use a thread pool with multiple threads for concurrency. If no custom thread pool has been specified then Camel creates a default pool with 10 concurrent threads.",
          "title": "Parallel Processing",
          "required": false,
          "deprecated": false
        },
        "optimisticLocking": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Turns on using optimistic locking which requires the aggregationRepository being used is supporting this by implementing org.apache.camel.spi.OptimisticLockingAggregationRepository.",
          "title": "Optimistic Locking",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "If using parallelProcessing you can specify a custom thread pool to be used. In fact also if you are not using parallelProcessing this custom thread pool is used to send out aggregated exchanges as well.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "timeoutCheckerExecutorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "If using either of the completionTimeout completionTimeoutExpression or completionInterval options a background thread is created to check for the completion for every aggregator. Set this option to provide a custom thread pool to be used rather than creating a new thread for every aggregator.",
          "title": "Timeout Checker Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "aggregationRepositoryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the custom aggregate repository to use Will by default use org.apache.camel.processor.aggregate.MemoryAggregationRepository",
          "title": "Aggregation Repository Ref",
          "required": false,
          "deprecated": false
        },
        "strategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "A reference to lookup the AggregationStrategy in the Registry. Configuring an AggregationStrategy is required and is used to merge the incoming Exchange with the existing already merged exchanges. At first call the oldExchange parameter is null. On subsequent invocations the oldExchange contains the merged exchanges and newExchange is of course the new incoming Exchange.",
          "title": "Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "strategyMethodName": {
          "kind": "attribute",
          "type": "string",
          "description": "This option can be used to explicit declare the method name to use when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Name",
          "required": false,
          "deprecated": false
        },
        "strategyMethodAllowNull": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used for the very first aggregation. If this option is true then null values is used as the oldExchange (at the very first aggregation) when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Allow Null",
          "required": false,
          "deprecated": false
        },
        "completionSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Number of messages aggregated before the aggregation is complete. This option can be set as either a fixed value or using an Expression which allows you to evaluate a size dynamically - will use Integer as result. If both are set Camel will fallback to use the fixed value if the Expression result was null or 0.",
          "title": "Completion Size",
          "required": false,
          "deprecated": false
        },
        "completionInterval": {
          "kind": "attribute",
          "type": "integer",
          "description": "A repeating period in millis by which the aggregator will complete all current aggregated exchanges. Camel has a background task which is triggered every period. You cannot use this option together with completionTimeout only one of them can be used.",
          "title": "Completion Interval",
          "required": false,
          "deprecated": false
        },
        "completionTimeout": {
          "kind": "attribute",
          "type": "integer",
          "description": "Time in millis that an aggregated exchange should be inactive before its complete (timeout). This option can be set as either a fixed value or using an Expression which allows you to evaluate a timeout dynamically - will use Long as result. If both are set Camel will fallback to use the fixed value if the Expression result was null or 0. You cannot use this option together with completionInterval only one of the two can be used. By default the timeout checker runs every second you can use the completionTimeoutCheckerInterval option to configure how frequently to run the checker. The timeout is an approximation and there is no guarantee that the a timeout is triggered exactly after the timeout value. It is not recommended to use very low timeout values or checker intervals.",
          "title": "Completion Timeout",
          "required": false,
          "deprecated": false
        },
        "completionTimeoutCheckerInterval": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Interval in millis that is used by the background task that checks for timeouts (org.apache.camel.TimeoutMap). By default the timeout checker runs every second. The timeout is an approximation and there is no guarantee that the a timeout is triggered exactly after the timeout value. It is not recommended to use very low timeout values or checker intervals.",
          "title": "Completion Timeout Checker Interval",
          "required": false,
          "deprecated": false
        },
        "completionFromBatchConsumer": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enables the batch completion mode where we aggregate from a org.apache.camel.BatchConsumer and aggregate the total number of exchanges the org.apache.camel.BatchConsumer has reported as total by checking the exchange property link org.apache.camel.ExchangeBATCH_COMPLETE when its complete.",
          "title": "Completion From Batch Consumer",
          "required": false,
          "deprecated": false
        },
        "groupExchanges": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enables grouped exchanges so the aggregator will group all aggregated exchanges into a single combined Exchange holding all the aggregated exchanges in a java.util.List.",
          "title": "Group Exchanges",
          "required": false,
          "deprecated": true
        },
        "eagerCheckCompletion": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Use eager completion checking which means that the completionPredicate will use the incoming Exchange. As opposed to without eager completion checking the completionPredicate will use the aggregated Exchange.",
          "title": "Eager Check Completion",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidCorrelationKeys": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If a correlation key cannot be successfully evaluated it will be ignored by logging a DEBUG and then just ignore the incoming Exchange.",
          "title": "Ignore Invalid Correlation Keys",
          "required": false,
          "deprecated": false
        },
        "closeCorrelationKeyOnCompletion": {
          "kind": "attribute",
          "type": "integer",
          "description": "Closes a correlation key when its complete. Any late received exchanges which has a correlation key that has been closed it will be defined and a ClosedCorrelationKeyException is thrown.",
          "title": "Close Correlation Key On Completion",
          "required": false,
          "deprecated": false
        },
        "discardOnCompletionTimeout": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Discards the aggregated message on completion timeout. This means on timeout the aggregated message is dropped and not sent out of the aggregator.",
          "title": "Discard On Completion Timeout",
          "required": false,
          "deprecated": false
        },
        "forceCompletionOnStop": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Indicates to complete all current aggregated exchanges when the context is stopped",
          "title": "Force Completion On Stop",
          "required": false,
          "deprecated": false
        },
        "completeAllOnStop": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Indicates to wait to complete all current and partial (pending) aggregated exchanges when the context is stopped. This also means that we will wait for all pending exchanges which are stored in the aggregation repository to complete so the repository is empty before we can stop. You may want to enable this when using the memory based aggregation repository that is memory based only and do not store data on disk. When this option is enabled then the aggregator is waiting to complete all those exchanges before its stopped when stopping CamelContext or the route using it.",
          "title": "Complete All On Stop",
          "required": false,
          "deprecated": false
        },
        "aggregateControllerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a org.apache.camel.processor.aggregate.AggregateController to allow external sources to control this aggregator.",
          "title": "Aggregate Controller Ref",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "aop": {
      "type": "object",
      "title": "Aop",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Does processing before and/or after the route is completed",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "beforeUri": {
          "kind": "attribute",
          "type": "string",
          "description": "Endpoint to call in AOP before.",
          "title": "Before Uri",
          "required": false,
          "deprecated": false
        },
        "afterUri": {
          "kind": "attribute",
          "type": "string",
          "description": "Endpoint to call in AOP after. The difference between after and afterFinally is that afterFinally is invoked from a finally block so it will always be invoked no matter what eg also in case of an exception occur.",
          "title": "After Uri",
          "required": false,
          "deprecated": false
        },
        "afterFinallyUri": {
          "kind": "attribute",
          "type": "string",
          "description": "Endpoint to call in AOP after finally. The difference between after and afterFinally is that afterFinally is invoked from a finally block so it will always be invoked no matter what eg also in case of an exception occur.",
          "title": "After Finally Uri",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "batch-config": {
      "type": "object",
      "title": "Batch-config",
      "group": "eip,routing,resequence",
      "icon": "generic24.png",
      "description": "Configures batch-processing resequence eip.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "batchSize": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "100",
          "description": "Sets the size of the batch to be re-ordered. The default size is 100.",
          "title": "Batch Size",
          "required": false,
          "deprecated": false
        },
        "batchTimeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Sets the timeout for collecting elements to be re-ordered. The default timeout is 1000 msec.",
          "title": "Batch Timeout",
          "required": false,
          "deprecated": false
        },
        "allowDuplicates": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to allow duplicates.",
          "title": "Allow Duplicates",
          "required": false,
          "deprecated": false
        },
        "reverse": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to reverse the ordering.",
          "title": "Reverse",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidExchanges": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore invalid exchanges",
          "title": "Ignore Invalid Exchanges",
          "required": false,
          "deprecated": false
        }
      }
    },
    "bean": {
      "type": "object",
      "title": "Bean",
      "group": "eip,endpoint",
      "icon": "bean24.png",
      "description": "Calls a java bean",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a bean to use",
          "title": "Ref",
          "required": false,
          "deprecated": false
        },
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the method name on the bean to use",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "beanType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Class of the bean",
          "title": "Bean Type",
          "required": false,
          "deprecated": false
        },
        "cache": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Caches the bean lookup to avoid lookup up bean on every usage.",
          "title": "Cache",
          "required": false,
          "deprecated": false
        },
        "multiParameterArray": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the message body is an array type.",
          "title": "Multi Parameter Array",
          "required": false,
          "deprecated": true
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "beanPostProcessor": {
      "type": "object",
      "title": "Bean Post Processor",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Spring specific DefaultCamelBeanPostProcessor which uses Spring BeanPostProcessor to post process beans.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
      }
    },
    "blacklistServiceFilter": {
      "type": "object",
      "title": "Blacklist Service Filter",
      "group": "routing,cloud,service-filter",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "servers": {
          "kind": "element",
          "type": "array",
          "description": "Sets the server blacklist. Each entry can be a list of servers separated by comma in the format: servicehost:portservicehost2:portservicehost3:port",
          "title": "Servers",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "cachingServiceDiscovery": {
      "type": "object",
      "title": "Caching Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "60",
          "description": "Set the time the services will be retained.",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "units": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "SECONDS",
          "enum": [ "DAYS", "HOURS", "MICROSECONDS", "MILLISECONDS", "MINUTES", "NANOSECONDS", "SECONDS" ],
          "description": "Set the time unit for the timeout.",
          "title": "Units",
          "required": false,
          "deprecated": false
        },
        "serviceDiscoveryConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Set the service-call configuration to use",
          "title": "Service Discovery Configuration",
          "required": true,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "camelContext": {
      "type": "object",
      "title": "Camel Context",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "CamelContext using XML configuration.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "depends-on": {
          "kind": "attribute",
          "type": "string",
          "description": "List of other bean id's this CamelContext depends up. Multiple bean id's can be separated by comma.",
          "title": "Depends-on",
          "required": false,
          "deprecated": false
        },
        "trace": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether tracing is enabled or not.",
          "title": "Trace",
          "required": false,
          "deprecated": false
        },
        "messageHistory": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Sets whether message history is enabled or not.",
          "title": "Message History",
          "required": false,
          "deprecated": false
        },
        "logMask": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether security mask for Logging is enabled or not.",
          "title": "Log Mask",
          "required": false,
          "deprecated": false
        },
        "logExhaustedMessageBody": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether to log exhausted message body with message history.",
          "title": "Log Exhausted Message Body",
          "required": false,
          "deprecated": false
        },
        "streamCache": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether stream caching is enabled or not.",
          "title": "Stream Cache",
          "required": false,
          "deprecated": false
        },
        "delayer": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a delay value in millis that a message is delayed at every step it takes in the route path slowing the process down to better observe what is occurring",
          "title": "Delayer",
          "required": false,
          "deprecated": false
        },
        "handleFault": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether fault handling is enabled or not (default is disabled).",
          "title": "Handle Fault",
          "required": false,
          "deprecated": false
        },
        "errorHandlerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the name of the error handler object used to default the error handling strategy",
          "title": "Error Handler Ref",
          "required": false,
          "deprecated": false
        },
        "autoStartup": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Sets whether the object should automatically start when Camel starts. Important: Currently only routes can be disabled as CamelContexts are always started. Note: When setting auto startup false on CamelContext then that takes precedence and no routes is started. You would need to start CamelContext explicit using the link org.apache.camel.CamelContextstart() method to start the context and then you would need to start the routes manually using link CamelContextstartRoute(String).",
          "title": "Auto Startup",
          "required": false,
          "deprecated": false
        },
        "shutdownEager": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Whether to shutdown CamelContext eager when Spring is shutting down. This ensure a cleaner shutdown of Camel as dependent bean's are not shutdown at this moment. The bean's will then be shutdown after camelContext.",
          "title": "Shutdown Eager",
          "required": false,
          "deprecated": false
        },
        "registerEndpointIdsFromRoute": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether to register endpoints that has id attribute assigned in the Spring registry. This mode is by default false but can be turned on for backwards compatibility.",
          "title": "Register Endpoint Ids From Route",
          "required": false,
          "deprecated": true
        },
        "useMDCLogging": {
          "kind": "attribute",
          "type": "string",
          "description": "Set whether MDC is enabled.",
          "title": "Use M D C Logging",
          "required": false,
          "deprecated": false
        },
        "useDataType": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether to enable using data type on Camel messages. Data type are automatic turned on if: one ore more routes has been explicit configured with input and output types when using rest-dsl with binding turned on Otherwise data type is default off.",
          "title": "Use Data Type",
          "required": false,
          "deprecated": false
        },
        "useBreadcrumb": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Set whether breadcrumb is enabled.",
          "title": "Use Breadcrumb",
          "required": false,
          "deprecated": false
        },
        "allowUseOriginalMessage": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether to allow access to the original message from Camel's error handler or from link org.apache.camel.spi.UnitOfWorkgetOriginalInMessage(). Turning this off can optimize performance as defensive copy of the original message is not needed.",
          "title": "Allow Use Original Message",
          "required": false,
          "deprecated": false
        },
        "runtimeEndpointRegistryEnabled": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether org.apache.camel.spi.RuntimeEndpointRegistry is enabled.",
          "title": "Runtime Endpoint Registry Enabled",
          "required": false,
          "deprecated": false
        },
        "managementNamePattern": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "#name#",
          "description": "The naming pattern for creating the CamelContext management name.",
          "title": "Management Name Pattern",
          "required": false,
          "deprecated": false
        },
        "threadNamePattern": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "Camel (#camelId#) thread ##counter# - #name#",
          "description": "Sets the thread name pattern used for creating the full thread name. The default pattern is: Camel (camelId) thread counter - name Where camelId is the name of the org.apache.camel.CamelContext and counter is a unique incrementing counter. and name is the regular thread name. You can also use longName is the long thread name which can includes endpoint parameters etc.",
          "title": "Thread Name Pattern",
          "required": false,
          "deprecated": false
        },
        "shutdownRoute": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "Default",
          "enum": [ "Default", "Defer" ],
          "description": "Sets the ShutdownRoute option for routes.",
          "title": "Shutdown Route",
          "required": false,
          "deprecated": false
        },
        "shutdownRunningTask": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "CompleteCurrentTaskOnly",
          "enum": [ "CompleteAllTasks", "CompleteCurrentTaskOnly" ],
          "description": "Sets the ShutdownRunningTask option to use when shutting down a route.",
          "title": "Shutdown Running Task",
          "required": false,
          "deprecated": false
        },
        "lazyLoadTypeConverters": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether type converters should be loaded lazy",
          "title": "Lazy Load Type Converters",
          "required": false,
          "deprecated": true
        },
        "loadTypeConverters": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Sets whether to load custom type converters by scanning classpath. This can be turned off if you are only using Camel components that does not provide type converters which is needed at runtime. In such situations setting this option to false can speedup starting Camel.",
          "title": "Load Type Converters",
          "required": false,
          "deprecated": false
        },
        "typeConverterStatisticsEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether or not type converter statistics is enabled. By default the type converter utilization statistics is disabled. Notice: If enabled then there is a slight performance impact under very heavy load. You can enable/disable the statistics at runtime using the link org.apache.camel.spi.TypeConverterRegistrygetStatistics()setTypeConverterStatisticsEnabled(Boolean) method or from JMX on the org.apache.camel.api.management.mbean.ManagedTypeConverterRegistryMBean mbean.",
          "title": "Type Converter Statistics Enabled",
          "required": false,
          "deprecated": false
        },
        "typeConverterExists": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "Override",
          "enum": [ "Fail", "Ignore", "Override" ],
          "description": "What should happen when attempting to add a duplicate type converter. The default behavior is to override the existing.",
          "title": "Type Converter Exists",
          "required": false,
          "deprecated": false
        },
        "typeConverterExistsLoggingLevel": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "WARN",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "The logging level to use when logging that a type converter already exists when attempting to add a duplicate type converter. The default logging level is WARN",
          "title": "Type Converter Exists Logging Level",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of CamelContext properties such as limit of debug logging and other general options.",
          "title": "Properties",
          "required": false,
          "deprecated": true
        },
        "globalOptions": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of CamelContext properties such as limit of debug logging and other general options.",
          "title": "Global Options",
          "required": false,
          "deprecated": false
        },
        "propertyPlaceholder": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of property placeholder",
          "title": "Property Placeholder",
          "required": false,
          "deprecated": false
        },
        "package": {
          "kind": "element",
          "type": "array",
          "description": "Sets the package names to be recursively searched for Java classes which extend org.apache.camel.builder.RouteBuilder to be auto-wired up to the CamelContext as a route. Note that classes are excluded if they are specifically configured in the spring.xml A more advanced configuration can be done using link setPackageScan(org.apache.camel.model.PackageScanDefinition)",
          "title": "Package",
          "required": false,
          "deprecated": false
        },
        "packageScan": {
          "kind": "element",
          "type": "object",
          "description": "Sets the package scanning information. Package scanning allows for the automatic discovery of certain camel classes at runtime for inclusion e.g. org.apache.camel.builder.RouteBuilder implementations",
          "title": "Package Scan",
          "required": false,
          "deprecated": false
        },
        "contextScan": {
          "kind": "element",
          "type": "object",
          "description": "Sets the context scanning (eg Spring's ApplicationContext) information. Context scanning allows for the automatic discovery of Camel routes runtime for inclusion e.g. org.apache.camel.builder.RouteBuilder implementations",
          "title": "Context Scan",
          "required": false,
          "deprecated": false
        },
        "streamCaching": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of stream caching.",
          "title": "Stream Caching",
          "required": false,
          "deprecated": false
        },
        "jmxAgent": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of JMX.",
          "title": "Jmx Agent",
          "required": false,
          "deprecated": false
        },
        "beansFactory": {
          "kind": "null",
          "type": "array",
          "description": "Miscellaneous configurations",
          "title": "Beans Factory",
          "required": false,
          "deprecated": false
        },
        "beans": {
          "kind": "null",
          "type": "array",
          "description": "Miscellaneous configurations",
          "title": "Beans",
          "required": false,
          "deprecated": false
        },
        "defaultServiceCallConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "ServiceCall EIP default configuration",
          "title": "Default Service Call Configuration",
          "required": false,
          "deprecated": false
        },
        "serviceCallConfiguration": {
          "kind": "element",
          "type": "array",
          "description": "ServiceCall EIP configurations",
          "title": "Service Call Configuration",
          "required": false,
          "deprecated": false
        },
        "defaultHystrixConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Hystrix EIP default configuration",
          "title": "Default Hystrix Configuration",
          "required": false,
          "deprecated": false
        },
        "hystrixConfiguration": {
          "kind": "element",
          "type": "array",
          "description": "Hystrix EIP configurations",
          "title": "Hystrix Configuration",
          "required": false,
          "deprecated": false
        },
        "routeBuilder": {
          "kind": "element",
          "type": "array",
          "description": "Refers to Java RouteBuilder instances to include as routes in this CamelContext.",
          "title": "Route Builder",
          "required": false,
          "deprecated": false
        },
        "routeContextRef": {
          "kind": "element",
          "type": "array",
          "description": "Refers to XML routes to include as routes in this CamelContext.",
          "title": "Route Context Ref",
          "required": false,
          "deprecated": false
        },
        "restContextRef": {
          "kind": "element",
          "type": "array",
          "description": "Refers to XML rest-dsl to include as REST services in this CamelContext.",
          "title": "Rest Context Ref",
          "required": false,
          "deprecated": false
        },
        "threadPoolProfile": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of thread pool profiles.",
          "title": "Thread Pool Profile",
          "required": false,
          "deprecated": false
        },
        "threadPool": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of thread pool",
          "title": "Thread Pool",
          "required": false,
          "deprecated": false
        },
        "endpoint": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of endpoints",
          "title": "Endpoint",
          "required": false,
          "deprecated": false
        },
        "dataFormats": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of data formats.",
          "title": "Data Formats",
          "required": false,
          "deprecated": false
        },
        "transformers": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of transformers.",
          "title": "Transformers",
          "required": false,
          "deprecated": false
        },
        "validators": {
          "kind": "element",
          "type": "object",
          "description": "Configuration of validators.",
          "title": "Validators",
          "required": false,
          "deprecated": false
        },
        "redeliveryPolicyProfile": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of redelivery settings.",
          "title": "Redelivery Policy Profile",
          "required": false,
          "deprecated": false
        },
        "onException": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of error handlers that triggers on exceptions thrown.",
          "title": "On Exception",
          "required": false,
          "deprecated": false
        },
        "onCompletion": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of sub routes to run at the completion of routing.",
          "title": "On Completion",
          "required": false,
          "deprecated": false
        },
        "intercept": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of interceptors.",
          "title": "Intercept",
          "required": false,
          "deprecated": false
        },
        "interceptFrom": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of interceptors that triggers from the beginning of routes.",
          "title": "Intercept From",
          "required": false,
          "deprecated": false
        },
        "interceptSendToEndpoint": {
          "kind": "element",
          "type": "array",
          "description": "Configuration of interceptors that triggers sending messages to endpoints.",
          "title": "Intercept Send To Endpoint",
          "required": false,
          "deprecated": false
        },
        "restConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configuration for rest-dsl",
          "title": "Rest Configuration",
          "required": false,
          "deprecated": false
        },
        "rest": {
          "kind": "element",
          "type": "array",
          "description": "Contains the rest services defined using the rest-dsl",
          "title": "Rest",
          "required": false,
          "deprecated": false
        },
        "route": {
          "kind": "element",
          "type": "array",
          "description": "Contains the Camel routes",
          "title": "Route",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id (name) of this CamelContext",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "choice": {
      "type": "object",
      "title": "Choice",
      "group": "eip,routing",
      "icon": "choice24.png",
      "description": "Routes messages based on a series of predicates",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "whenClauses": {
          "kind": "element",
          "type": "array",
          "description": "Sets the when clauses",
          "title": "When Clauses",
          "required": false,
          "deprecated": false
        },
        "otherwise": {
          "kind": "element",
          "type": "object",
          "description": "Sets the otherwise node",
          "title": "Otherwise",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "circuitBreaker": {
      "type": "object",
      "title": "Circuit Breaker",
      "group": "eip,routing,loadbalance,circuitbreaker",
      "icon": "generic24.png",
      "description": "Circuit break load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "exception": {
          "kind": "element",
          "type": "array",
          "description": "A list of class names for specific exceptions to monitor. If no exceptions is configured then all exceptions is monitored",
          "title": "Exception",
          "required": false,
          "deprecated": false
        },
        "halfOpenAfter": {
          "kind": "attribute",
          "type": "integer",
          "description": "The timeout in millis to use as threshold to move state from closed to half-open or open state",
          "title": "Half Open After",
          "required": false,
          "deprecated": false
        },
        "threshold": {
          "kind": "attribute",
          "type": "integer",
          "description": "Number of previous failed messages to use as threshold to move state from closed to half-open or open state",
          "title": "Threshold",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "consulServiceDiscovery": {
      "type": "object",
      "title": "Consul Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "url": {
          "kind": "attribute",
          "type": "string",
          "description": "The Consul agent URL",
          "title": "Url",
          "required": false,
          "deprecated": false
        },
        "datacenter": {
          "kind": "attribute",
          "type": "string",
          "description": "The data center",
          "title": "Datacenter",
          "required": false,
          "deprecated": false
        },
        "aclToken": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the ACL token to be used with Consul",
          "title": "Acl Token",
          "required": false,
          "deprecated": false
        },
        "userName": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the username to be used for basic authentication",
          "title": "User Name",
          "required": false,
          "deprecated": false
        },
        "password": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the password to be used for basic authentication",
          "title": "Password",
          "required": false,
          "deprecated": false
        },
        "connectTimeoutMillis": {
          "kind": "attribute",
          "type": "integer",
          "description": "Connect timeout for OkHttpClient",
          "title": "Connect Timeout Millis",
          "required": false,
          "deprecated": false
        },
        "readTimeoutMillis": {
          "kind": "attribute",
          "type": "integer",
          "description": "Read timeout for OkHttpClient",
          "title": "Read Timeout Millis",
          "required": false,
          "deprecated": false
        },
        "writeTimeoutMillis": {
          "kind": "attribute",
          "type": "integer",
          "description": "Write timeout for OkHttpClient",
          "title": "Write Timeout Millis",
          "required": false,
          "deprecated": false
        },
        "blockSeconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "The seconds to wait for a watch event default 10 seconds",
          "title": "Block Seconds",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "consumerTemplate": {
      "type": "object",
      "title": "Consumer Template",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Configures a ConsumerTemplate",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "maximumCacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets a custom maximum cache size to use in the backing cache pools.",
          "title": "Maximum Cache Size",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "Id of CamelContext to use if there are multiple CamelContexts in the same JVM",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "contextScan": {
      "type": "object",
      "title": "Context Scan",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Scans for Java org.apache.camel.builder.RouteBuilder instances in the context org.apache.camel.spi.Registry.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "includeNonSingletons": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include non-singleton beans (prototypes) By default only singleton beans is included in the context scan",
          "title": "Include Non Singletons",
          "required": false,
          "deprecated": false
        },
        "excludes": {
          "kind": "element",
          "type": "array",
          "description": "Exclude finding route builder from these java package names.",
          "title": "Excludes",
          "required": false,
          "deprecated": false
        },
        "includes": {
          "kind": "element",
          "type": "array",
          "description": "Include finding route builder from these java package names.",
          "title": "Includes",
          "required": false,
          "deprecated": false
        }
      }
    },
    "convertBodyTo": {
      "type": "object",
      "title": "Convert Body To",
      "group": "eip,transformation",
      "icon": "convertBodyTo24.png",
      "description": "Converts the message body to another type",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "The java type to convert to",
          "title": "Type",
          "required": true,
          "deprecated": false
        },
        "charset": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a specific charset when converting",
          "title": "Charset",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "customLoadBalancer": {
      "type": "object",
      "title": "Custom Load Balancer",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Custom load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to the custom load balancer to lookup from the registry",
          "title": "Ref",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "customServiceFilter": {
      "type": "object",
      "title": "Custom Service Filter",
      "group": "routing,cloud,service-filter",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference of a ServiceFilter",
          "title": "Ref",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "defaultLoadBalancer": {
      "type": "object",
      "title": "Default Load Balancer",
      "group": "routing,cloud,load-balancing",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "delay": {
      "type": "object",
      "title": "Delay",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Delays processing for a specified length of time",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to define how long time to wait (in millis)",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom Thread Pool if asyncDelay has been enabled.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "asyncDelayed": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enables asynchronous delay which means the thread will noy block while delaying.",
          "title": "Async Delayed",
          "required": false,
          "deprecated": false
        },
        "callerRunsWhenRejected": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the caller should run the task when it was rejected by the thread pool. Is by default true",
          "title": "Caller Runs When Rejected",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "description": {
      "type": "object",
      "title": "Description",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "To provide comments about the node.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "lang": {
          "kind": "attribute",
          "type": "string",
          "description": "Language such as en for english.",
          "title": "Lang",
          "required": false,
          "deprecated": false
        },
        "layoutX": {
          "kind": "attribute",
          "type": "number",
          "description": "Layout position X",
          "title": "Layout X",
          "required": false,
          "deprecated": true
        },
        "layoutY": {
          "kind": "attribute",
          "type": "number",
          "description": "Layout position Y",
          "title": "Layout Y",
          "required": false,
          "deprecated": true
        },
        "layoutWidth": {
          "kind": "attribute",
          "type": "number",
          "description": "Layout width",
          "title": "Layout Width",
          "required": false,
          "deprecated": true
        },
        "layoutHeight": {
          "kind": "attribute",
          "type": "number",
          "description": "Layout height",
          "title": "Layout Height",
          "required": false,
          "deprecated": true
        },
        "text": {
          "kind": "value",
          "type": "string",
          "description": "The description as human readable text",
          "title": "Text",
          "required": true,
          "deprecated": false
        }
      }
    },
    "dnsServiceDiscovery": {
      "type": "object",
      "title": "Dns Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "proto": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "_tcp",
          "description": "The transport protocol of the desired service.",
          "title": "Proto",
          "required": false,
          "deprecated": false
        },
        "domain": {
          "kind": "attribute",
          "type": "string",
          "description": "The domain name;",
          "title": "Domain",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "doCatch": {
      "type": "object",
      "title": "Do Catch",
      "group": "error",
      "icon": "generic24.png",
      "description": "Catches exceptions as part of a try catch finally block",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "exception": {
          "kind": "element",
          "type": "array",
          "description": "The exception(s) to catch.",
          "title": "Exception",
          "required": false,
          "deprecated": false
        },
        "onWhen": {
          "kind": "element",
          "type": "object",
          "description": "Sets an additional predicate that should be true before the onCatch is triggered. To be used for fine grained controlling whether a thrown exception should be intercepted by this exception type or not.",
          "title": "On When",
          "required": false,
          "deprecated": false
        },
        "handled": {
          "kind": "expression",
          "type": "object",
          "description": "Sets whether the exchange should be marked as handled or not.",
          "title": "Handled",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "doFinally": {
      "type": "object",
      "title": "Do Finally",
      "group": "error",
      "icon": "generic24.png",
      "description": "Path traversed when a try catch finally block exits",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "doTry": {
      "type": "object",
      "title": "Do Try",
      "group": "error",
      "icon": "generic24.png",
      "description": "Marks the beginning of a try catch finally block",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "dynamicRouter": {
      "type": "object",
      "title": "Dynamic Router",
      "group": "eip,endpoint,routing",
      "icon": "dynamicRouter24.png",
      "description": "Routes messages based on dynamic rules",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to call that returns the endpoint(s) to route to in the dynamic routing. Important: The expression will be called in a while loop fashion until the expression returns null which means the dynamic router is finished.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "uriDelimiter": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": ",",
          "description": "Sets the uri delimiter to use",
          "title": "Uri Delimiter",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoints": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoints",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ProducerCache which is used to cache and reuse producers when using this recipient list when uris are reused.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "endpoint": {
      "type": "object",
      "title": "Endpoint",
      "group": "spring,configuration,endpoint",
      "icon": "generic24.png",
      "description": "Camel endpoint configuration",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "singleton": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Not in use",
          "title": "Singleton",
          "required": false,
          "deprecated": true
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the URI to use to resolve the endpoint. Notice that additional options can be configured using a series of property.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the exchange pattern of the endpoint",
          "title": "Pattern",
          "required": false,
          "deprecated": true
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "To configure additional endpoint options using a XML style which is similar as configuring Spring or Blueprint beans.",
          "title": "Properties",
          "required": true,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "Id of CamelContext to use if there are multiple CamelContexts in the same JVM",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "enrich": {
      "type": "object",
      "title": "Enrich",
      "group": "eip,transformation",
      "icon": "enrich24.png",
      "description": "Enriches a message with data from a secondary resource",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression that computes the endpoint uri to use as the resource endpoint to enrich from",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "strategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to an AggregationStrategy to be used to merge the reply from the external service into a single outgoing message. By default Camel will use the reply from the external service as outgoing message.",
          "title": "Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "strategyMethodName": {
          "kind": "attribute",
          "type": "string",
          "description": "This option can be used to explicit declare the method name to use when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Name",
          "required": false,
          "deprecated": false
        },
        "strategyMethodAllowNull": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was no data to enrich. If this option is true then null values is used as the oldExchange (when no data to enrich) when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Allow Null",
          "required": false,
          "deprecated": false
        },
        "aggregateOnException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was an exception thrown while trying to retrieve the data to enrich from the resource. Setting this option to true allows end users to control what to do if there was an exception in the aggregate method. For example to suppress the exception or set a custom message body etc.",
          "title": "Aggregate On Exception",
          "required": false,
          "deprecated": false
        },
        "shareUnitOfWork": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Shares the org.apache.camel.spi.UnitOfWork with the parent and the resource exchange. Enrich will by default not share unit of work between the parent exchange and the resource exchange. This means the resource exchange has its own individual unit of work.",
          "title": "Share Unit Of Work",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ProducerCache which is used to cache and reuse producer when uris are reused.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoint",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "errorHandler": {
      "type": "object",
      "title": "Error Handler",
      "group": "spring,configuration,error",
      "icon": "generic24.png",
      "description": "Error handler settings",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "type": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "DefaultErrorHandler",
          "enum": [ "DeadLetterChannel", "DefaultErrorHandler", "LoggingErrorHandler", "NoErrorHandler", "TransactionErrorHandler" ],
          "description": "The type of the error handler",
          "title": "Type",
          "required": true,
          "deprecated": false
        },
        "deadLetterUri": {
          "kind": "attribute",
          "type": "string",
          "description": "The dead letter endpoint uri for the Dead Letter error handler.",
          "title": "Dead Letter Uri",
          "required": false,
          "deprecated": false
        },
        "deadLetterHandleNewException": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether the dead letter channel should handle (and ignore) any new exception that may been thrown during sending the message to the dead letter endpoint. The default value is true which means any such kind of exception is handled and ignored. Set this to false to let the exception be propagated back on the org.apache.camel.Exchange. This can be used in situations where you use transactions and want to use Camel's dead letter channel to deal with exceptions during routing but if the dead letter channel itself fails because of a new exception being thrown then by setting this to false the new exceptions is propagated back and set on the org.apache.camel.Exchange which allows the transaction to detect the exception and rollback.",
          "title": "Dead Letter Handle New Exception",
          "required": false,
          "deprecated": false
        },
        "level": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "ERROR",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Logging level to use when using the logging error handler type.",
          "title": "Level",
          "required": false,
          "deprecated": false
        },
        "rollbackLoggingLevel": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "WARN",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Sets the logging level to use for logging transactional rollback. This option is default WARN.",
          "title": "Rollback Logging Level",
          "required": false,
          "deprecated": false
        },
        "logName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of the logger to use for the logging error handler",
          "title": "Log Name",
          "required": false,
          "deprecated": false
        },
        "useOriginalMessage": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will use the original input message when an org.apache.camel.Exchange is moved to the dead letter queue. Notice: this only applies when all redeliveries attempt have failed and the org.apache.camel.Exchange is doomed for failure. Instead of using the current inprogress org.apache.camel.Exchange IN body we use the original IN body instead. This allows you to store the original input in the dead letter queue instead of the inprogress snapshot of the IN body. For instance if you route transform the IN body during routing and then failed. With the original exchange store in the dead letter queue it might be easier to manually re submit the org.apache.camel.Exchange again as the IN body is the same as when Camel received it. So you should be able to send the org.apache.camel.Exchange to the same input. By default this feature is off.",
          "title": "Use Original Message",
          "required": false,
          "deprecated": false
        },
        "transactionTemplateRef": {
          "kind": "attribute",
          "type": "string",
          "description": "References to the org.springframework.transaction.support.TransactionTemplate to use with the transaction error handler.",
          "title": "Transaction Template Ref",
          "required": false,
          "deprecated": false
        },
        "transactionManagerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "References to the org.springframework.transaction.PlatformTransactionManager to use with the transaction error handler.",
          "title": "Transaction Manager Ref",
          "required": false,
          "deprecated": false
        },
        "onRedeliveryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a processor that should be processed before a redelivery attempt. Can be used to change the org.apache.camel.Exchange before its being redelivered.",
          "title": "On Redelivery Ref",
          "required": false,
          "deprecated": false
        },
        "onExceptionOccurredRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a processor that should be processed just after an exception occurred. Can be used to perform custom logging about the occurred exception at the exact time it happened. Important: Any exception thrown from this processor will be ignored.",
          "title": "On Exception Occurred Ref",
          "required": false,
          "deprecated": false
        },
        "onPrepareFailureRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a processor to prepare the org.apache.camel.Exchange before handled by the failure processor / dead letter channel. This allows for example to enrich the message before sending to a dead letter queue.",
          "title": "On Prepare Failure Ref",
          "required": false,
          "deprecated": false
        },
        "retryWhileRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to an retry while expression. Will continue retrying until expression evaluates to false.",
          "title": "Retry While Ref",
          "required": false,
          "deprecated": false
        },
        "redeliveryPolicyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a RedeliveryPolicy to be used for redelivery settings.",
          "title": "Redelivery Policy Ref",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a thread pool to be used by the error handler",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "redeliveryPolicy": {
          "kind": "element",
          "type": "object",
          "description": "Sets the redelivery settings",
          "title": "Redelivery Policy",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "etcdServiceDiscovery": {
      "type": "object",
      "title": "Etcd Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "uris": {
          "kind": "attribute",
          "type": "string",
          "description": "The URIs the client can connect to.",
          "title": "Uris",
          "required": false,
          "deprecated": false
        },
        "userName": {
          "kind": "attribute",
          "type": "string",
          "description": "The user name to use for basic authentication.",
          "title": "User Name",
          "required": false,
          "deprecated": false
        },
        "password": {
          "kind": "attribute",
          "type": "string",
          "description": "The password to use for basic authentication.",
          "title": "Password",
          "required": false,
          "deprecated": false
        },
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "description": "To set the maximum time an action could take to complete.",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "servicePath": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "/services/",
          "description": "The path to look for for service discovery",
          "title": "Service Path",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "on-demand",
          "enum": [ "on-demand", "watch" ],
          "description": "To set the discovery type valid values are on-demand and watch.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "export": {
      "type": "object",
      "title": "Export",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Used for export a service using Spring Remoting to hide the network call using an interface.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Camel endpoint uri to use a remote transport when calling the service",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "serviceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the service name to lookup in the registry.",
          "title": "Service Ref",
          "required": false,
          "deprecated": false
        },
        "serviceInterface": {
          "kind": "attribute",
          "type": "string",
          "description": "Java interfaces to use as facade for the service to be exported",
          "title": "Service Interface",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "The id of the CamelContext to use if there is multiple CamelContext in the same JVM.",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "failover": {
      "type": "object",
      "title": "Failover",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Failover load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "exception": {
          "kind": "element",
          "type": "array",
          "description": "A list of class names for specific exceptions to monitor. If no exceptions is configured then all exceptions is monitored",
          "title": "Exception",
          "required": false,
          "deprecated": false
        },
        "roundRobin": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the failover load balancer should operate in round robin mode or not. If not then it will always start from the first endpoint when a new message is to be processed. In other words it restart from the top for every message. If round robin is enabled then it keeps state and will continue with the next endpoint in a round robin fashion. You can also enable sticky mode together with round robin if so then it will pick the last known good endpoint to use when starting the load balancing (instead of using the next when starting).",
          "title": "Round Robin",
          "required": false,
          "deprecated": false
        },
        "sticky": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the failover load balancer should operate in sticky mode or not. If not then it will always start from the first endpoint when a new message is to be processed. In other words it restart from the top for every message. If sticky is enabled then it keeps state and will continue with the last known good endpoint. You can also enable sticky mode together with round robin if so then it will pick the last known good endpoint to use when starting the load balancing (instead of using the next when starting).",
          "title": "Sticky",
          "required": false,
          "deprecated": false
        },
        "maximumFailoverAttempts": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "-1",
          "description": "A value to indicate after X failover attempts we should exhaust (give up). Use -1 to indicate never give up and continuously try to failover. Use 0 to never failover. And use e.g. 3 to failover at most 3 times before giving up. his option can be used whether or not roundRobin is enabled or not.",
          "title": "Maximum Failover Attempts",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "filter": {
      "type": "object",
      "title": "Filter",
      "group": "eip,routing",
      "icon": "filter24.png",
      "description": "Filter out messages based using a predicate",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to determine if the message should be filtered or not. If the expression returns an empty value or false then the message is filtered (dropped) otherwise the message is continued being routed.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "fluentTemplate": {
      "type": "object",
      "title": "Fluent Template",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Configures a org.apache.camel.FluentProducerTemplate",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "defaultEndpoint": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the default endpoint URI used by default for sending message exchanges",
          "title": "Default Endpoint",
          "required": false,
          "deprecated": false
        },
        "maximumCacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets a custom maximum cache size to use in the backing cache pools.",
          "title": "Maximum Cache Size",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "Id of CamelContext to use if there are multiple CamelContexts in the same JVM",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "from": {
      "type": "object",
      "title": "From",
      "group": "eip,endpoint,routing",
      "icon": "endpoint24.png",
      "description": "Act as a message source as input to a route",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the URI of the endpoint to use",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the name of the endpoint within the registry (such as the Spring ApplicationContext or JNDI) to use",
          "title": "Ref",
          "required": false,
          "deprecated": true
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "globalOption": {
      "type": "object",
      "title": "Global Option",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Models a string key/value pair for configuring some global options on a Camel context such as max debug log length.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "key": {
          "kind": "attribute",
          "type": "string",
          "description": "Global option key",
          "title": "Key",
          "required": true,
          "deprecated": false
        },
        "value": {
          "kind": "attribute",
          "type": "string",
          "description": "Global option value",
          "title": "Value",
          "required": true,
          "deprecated": false
        }
      }
    },
    "globalOptions": {
      "type": "object",
      "title": "Global Options",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Models a series of string key/value pairs for configuring some global options on a Camel context such as max debug log length.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "globalOption": {
          "kind": "element",
          "type": "array",
          "description": "A series of global options as key value pairs",
          "title": "Global Option",
          "required": false,
          "deprecated": false
        }
      }
    },
    "healthyServiceFilter": {
      "type": "object",
      "title": "Healthy Service Filter",
      "group": "routing,cloud,service-filter",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "hystrix": {
      "type": "object",
      "title": "Hystrix",
      "group": "eip,routing,circuitbreaker",
      "icon": "generic24.png",
      "description": "Hystrix Circuit Breaker EIP",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "hystrixConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the Hystrix EIP Use end when configuration is complete to return back to the Hystrix EIP.",
          "title": "Hystrix Configuration",
          "required": false,
          "deprecated": false
        },
        "hystrixConfigurationRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a Hystrix configuration to use for configuring the Hystrix EIP.",
          "title": "Hystrix Configuration Ref",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "hystrixConfiguration": {
      "type": "object",
      "title": "Hystrix Configuration",
      "group": "eip,routing,circuitbreaker",
      "icon": "generic24.png",
      "description": "Hystrix Circuit Breaker EIP configuration",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "groupKey": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "CamelHystrix",
          "description": "Sets the group key to use. The default value is CamelHystrix.",
          "title": "Group Key",
          "required": false,
          "deprecated": false
        },
        "threadPoolKey": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "CamelHystrix",
          "description": "Sets the thread pool key to use. Will by default use the same value as groupKey has been configured to use.",
          "title": "Thread Pool Key",
          "required": false,
          "deprecated": false
        },
        "circuitBreakerEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to use a HystrixCircuitBreaker or not. If false no circuit-breaker logic will be used and all requests permitted. This is similar in effect to circuitBreakerForceClosed() except that continues tracking metrics and knowing whether it should be open/closed this property results in not even instantiating a circuit-breaker.",
          "title": "Circuit Breaker Enabled",
          "required": false,
          "deprecated": false
        },
        "circuitBreakerErrorThresholdPercentage": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "50",
          "description": "Error percentage threshold (as whole number such as 50) at which point the circuit breaker will trip open and reject requests. It will stay tripped for the duration defined in circuitBreakerSleepWindowInMilliseconds; The error percentage this is compared against comes from HystrixCommandMetrics.getHealthCounts().",
          "title": "Circuit Breaker Error Threshold Percentage",
          "required": false,
          "deprecated": false
        },
        "circuitBreakerForceClosed": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If true the HystrixCircuitBreakerallowRequest() will always return true to allow requests regardless of the error percentage from HystrixCommandMetrics.getHealthCounts(). The circuitBreakerForceOpen() property takes precedence so if it set to true this property does nothing.",
          "title": "Circuit Breaker Force Closed",
          "required": false,
          "deprecated": false
        },
        "circuitBreakerForceOpen": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If true the HystrixCircuitBreaker.allowRequest() will always return false causing the circuit to be open (tripped) and reject all requests. This property takes precedence over circuitBreakerForceClosed();",
          "title": "Circuit Breaker Force Open",
          "required": false,
          "deprecated": false
        },
        "circuitBreakerRequestVolumeThreshold": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "20",
          "description": "Minimum number of requests in the metricsRollingStatisticalWindowInMilliseconds() that must exist before the HystrixCircuitBreaker will trip. If below this number the circuit will not trip regardless of error percentage.",
          "title": "Circuit Breaker Request Volume Threshold",
          "required": false,
          "deprecated": false
        },
        "circuitBreakerSleepWindowInMilliseconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "5000",
          "description": "The time in milliseconds after a HystrixCircuitBreaker trips open that it should wait before trying requests again.",
          "title": "Circuit Breaker Sleep Window In Milliseconds",
          "required": false,
          "deprecated": false
        },
        "executionIsolationSemaphoreMaxConcurrentRequests": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "20",
          "description": "Number of concurrent requests permitted to HystrixCommand.run(). Requests beyond the concurrent limit will be rejected. Applicable only when executionIsolationStrategy == SEMAPHORE.",
          "title": "Execution Isolation Semaphore Max Concurrent Requests",
          "required": false,
          "deprecated": false
        },
        "executionIsolationStrategy": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "THREAD",
          "enum": [ "SEMAPHORE", "THREAD" ],
          "description": "What isolation strategy HystrixCommand.run() will be executed with. If THREAD then it will be executed on a separate thread and concurrent requests limited by the number of threads in the thread-pool. If SEMAPHORE then it will be executed on the calling thread and concurrent requests limited by the semaphore count.",
          "title": "Execution Isolation Strategy",
          "required": false,
          "deprecated": false
        },
        "executionIsolationThreadInterruptOnTimeout": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether the execution thread should attempt an interrupt (using link Futurecancel) when a thread times out. Applicable only when executionIsolationStrategy() == THREAD.",
          "title": "Execution Isolation Thread Interrupt On Timeout",
          "required": false,
          "deprecated": false
        },
        "executionTimeoutInMilliseconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Time in milliseconds at which point the command will timeout and halt execution. If link executionIsolationThreadInterruptOnTimeout == true and the command is thread-isolated the executing thread will be interrupted. If the command is semaphore-isolated and a HystrixObservableCommand that command will get unsubscribed.",
          "title": "Execution Timeout In Milliseconds",
          "required": false,
          "deprecated": false
        },
        "executionTimeoutEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether the timeout mechanism is enabled for this command",
          "title": "Execution Timeout Enabled",
          "required": false,
          "deprecated": false
        },
        "fallbackIsolationSemaphoreMaxConcurrentRequests": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "Number of concurrent requests permitted to HystrixCommand.getFallback(). Requests beyond the concurrent limit will fail-fast and not attempt retrieving a fallback.",
          "title": "Fallback Isolation Semaphore Max Concurrent Requests",
          "required": false,
          "deprecated": false
        },
        "fallbackEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether HystrixCommand.getFallback() should be attempted when failure occurs.",
          "title": "Fallback Enabled",
          "required": false,
          "deprecated": false
        },
        "metricsHealthSnapshotIntervalInMilliseconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "500",
          "description": "Time in milliseconds to wait between allowing health snapshots to be taken that calculate success and error percentages and affect HystrixCircuitBreaker.isOpen() status. On high-volume circuits the continual calculation of error percentage can become CPU intensive thus this controls how often it is calculated.",
          "title": "Metrics Health Snapshot Interval In Milliseconds",
          "required": false,
          "deprecated": false
        },
        "metricsRollingPercentileBucketSize": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "Maximum number of values stored in each bucket of the rolling percentile. This is passed into HystrixRollingPercentile inside HystrixCommandMetrics.",
          "title": "Metrics Rolling Percentile Bucket Size",
          "required": false,
          "deprecated": false
        },
        "metricsRollingPercentileEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether percentile metrics should be captured using HystrixRollingPercentile inside HystrixCommandMetrics.",
          "title": "Metrics Rolling Percentile Enabled",
          "required": false,
          "deprecated": false
        },
        "metricsRollingPercentileWindowInMilliseconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10000",
          "description": "Duration of percentile rolling window in milliseconds. This is passed into HystrixRollingPercentile inside HystrixCommandMetrics.",
          "title": "Metrics Rolling Percentile Window In Milliseconds",
          "required": false,
          "deprecated": false
        },
        "metricsRollingPercentileWindowBuckets": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "6",
          "description": "Number of buckets the rolling percentile window is broken into. This is passed into HystrixRollingPercentile inside HystrixCommandMetrics.",
          "title": "Metrics Rolling Percentile Window Buckets",
          "required": false,
          "deprecated": false
        },
        "metricsRollingStatisticalWindowInMilliseconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10000",
          "description": "This property sets the duration of the statistical rolling window in milliseconds. This is how long metrics are kept for the thread pool. The window is divided into buckets and rolls by those increments.",
          "title": "Metrics Rolling Statistical Window In Milliseconds",
          "required": false,
          "deprecated": false
        },
        "metricsRollingStatisticalWindowBuckets": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "Number of buckets the rolling statistical window is broken into. This is passed into HystrixRollingNumber inside HystrixCommandMetrics.",
          "title": "Metrics Rolling Statistical Window Buckets",
          "required": false,
          "deprecated": false
        },
        "requestLogEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether HystrixCommand execution and events should be logged to HystrixRequestLog.",
          "title": "Request Log Enabled",
          "required": false,
          "deprecated": false
        },
        "corePoolSize": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "Core thread-pool size that gets passed to link java.util.concurrent.ThreadPoolExecutorsetCorePoolSize(int)",
          "title": "Core Pool Size",
          "required": false,
          "deprecated": false
        },
        "maximumSize": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "Maximum thread-pool size that gets passed to link ThreadPoolExecutorsetMaximumPoolSize(int). This is the maximum amount of concurrency that can be supported without starting to reject HystrixCommands. Please note that this setting only takes effect if you also set allowMaximumSizeToDivergeFromCoreSize",
          "title": "Maximum Size",
          "required": false,
          "deprecated": false
        },
        "keepAliveTime": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1",
          "description": "Keep-alive time in minutes that gets passed to link ThreadPoolExecutorsetKeepAliveTime(long TimeUnit)",
          "title": "Keep Alive Time",
          "required": false,
          "deprecated": false
        },
        "maxQueueSize": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "-1",
          "description": "Max queue size that gets passed to BlockingQueue in HystrixConcurrencyStrategy.getBlockingQueue(int) This should only affect the instantiation of a threadpool - it is not eliglible to change a queue size on the fly. For that use queueSizeRejectionThreshold().",
          "title": "Max Queue Size",
          "required": false,
          "deprecated": false
        },
        "queueSizeRejectionThreshold": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "5",
          "description": "Queue size rejection threshold is an artificial max size at which rejections will occur even if link maxQueueSize has not been reached. This is done because the link maxQueueSize of a BlockingQueue can not be dynamically changed and we want to support dynamically changing the queue size that affects rejections. This is used by HystrixCommand when queuing a thread for execution.",
          "title": "Queue Size Rejection Threshold",
          "required": false,
          "deprecated": false
        },
        "threadPoolRollingNumberStatisticalWindowInMilliseconds": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10000",
          "description": "Duration of statistical rolling window in milliseconds. This is passed into HystrixRollingNumber inside each HystrixThreadPoolMetrics instance.",
          "title": "Thread Pool Rolling Number Statistical Window In Milliseconds",
          "required": false,
          "deprecated": false
        },
        "threadPoolRollingNumberStatisticalWindowBuckets": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "10",
          "description": "Number of buckets the rolling statistical window is broken into. This is passed into HystrixRollingNumber inside each HystrixThreadPoolMetrics instance.",
          "title": "Thread Pool Rolling Number Statistical Window Buckets",
          "required": false,
          "deprecated": false
        },
        "allowMaximumSizeToDivergeFromCoreSize": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Allows the configuration for maximumSize to take effect. That value can then be equal to or higher than coreSize",
          "title": "Allow Maximum Size To Diverge From Core Size",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "idempotentConsumer": {
      "type": "object",
      "title": "Idempotent Consumer",
      "group": "eip,routing",
      "icon": "idempotentConsumer24.png",
      "description": "Filters out duplicate messages",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression used to calculate the correlation key to use for duplicate check. The Exchange which has the same correlation key is regarded as a duplicate and will be rejected.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "messageIdRepositoryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the reference name of the message id repository",
          "title": "Message Id Repository Ref",
          "required": true,
          "deprecated": false
        },
        "eager": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Sets whether to eagerly add the key to the idempotent repository or wait until the exchange is complete. Eager is default enabled.",
          "title": "Eager",
          "required": false,
          "deprecated": false
        },
        "completionEager": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether to complete the idempotent consumer eager or when the exchange is done. If this option is true to complete eager then the idempotent consumer will trigger its completion when the exchange reached the end of the block of the idempotent consumer pattern. So if the exchange is continued routed after the block ends then whatever happens there does not affect the state. If this option is false (default) to not complete eager then the idempotent consumer will complete when the exchange is done being routed. So if the exchange is continued routed after the block ends then whatever happens there also affect the state. For example if the exchange failed due to an exception then the state of the idempotent consumer will be a rollback.",
          "title": "Completion Eager",
          "required": false,
          "deprecated": false
        },
        "skipDuplicate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Sets whether to skip duplicates or not. The default behavior is to skip duplicates. A duplicate message would have the Exchange property link org.apache.camel.ExchangeDUPLICATE_MESSAGE set to a link BooleanTRUE value. A none duplicate message will not have this property set.",
          "title": "Skip Duplicate",
          "required": false,
          "deprecated": false
        },
        "removeOnFailure": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Sets whether to remove or keep the key on failure. The default behavior is to remove the key on failure.",
          "title": "Remove On Failure",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "inOnly": {
      "type": "object",
      "title": "In Only",
      "group": "eip,endpoint,routing",
      "icon": "eventMessage24.png",
      "description": "Marks the exchange pattern for the route to one way",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the uri of the endpoint to send to.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the reference of the endpoint to send to.",
          "title": "Ref",
          "required": false,
          "deprecated": true
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "inOut": {
      "type": "object",
      "title": "In Out",
      "group": "eip,endpoint,routing",
      "icon": "requestReply24.png",
      "description": "Marks the exchange pattern for the route to request/reply",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the uri of the endpoint to send to.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the reference of the endpoint to send to.",
          "title": "Ref",
          "required": false,
          "deprecated": true
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "inputType": {
      "type": "object",
      "title": "Input Type",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Set the expected data type of the input message. If the actual message type is different at runtime camel look for a required Transformer and apply if exists. If validate attribute is true then camel applies Validator as well.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "urn": {
          "kind": "attribute",
          "type": "string",
          "description": "Set input type URN.",
          "title": "Urn",
          "required": true,
          "deprecated": false
        },
        "validate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Set if validation is required for this input type.",
          "title": "Validate",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "intercept": {
      "type": "object",
      "title": "Intercept",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Intercepts a message at each step in the route",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "interceptFrom": {
      "type": "object",
      "title": "Intercept From",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Intercepts incoming messages",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Intercept incoming messages from the uri or uri pattern. If this option is not configured then all incoming messages is intercepted.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "interceptSendToEndpoint": {
      "type": "object",
      "title": "Intercept Send To Endpoint",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Intercepts messages being sent to an endpoint",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Intercept sending to the uri or uri pattern.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "skipSendToOriginalEndpoint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If set to true then the message is not sent to the original endpoint. By default (false) the message is both intercepted and then sent to the original endpoint.",
          "title": "Skip Send To Original Endpoint",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "jmxAgent": {
      "type": "object",
      "title": "Jmx Agent",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "JMX configuration.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "disabled": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Disable JMI (default false)",
          "title": "Disabled",
          "required": false,
          "deprecated": false
        },
        "onlyRegisterProcessorWithCustomId": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Only register processor if a custom id was defined for it.",
          "title": "Only Register Processor With Custom Id",
          "required": false,
          "deprecated": false
        },
        "registryPort": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "1099",
          "description": "RMI connector registry port (default 1099)",
          "title": "Registry Port",
          "required": false,
          "deprecated": false
        },
        "connectorPort": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "-1",
          "description": "RMI connector server port (default -1 not used)",
          "title": "Connector Port",
          "required": false,
          "deprecated": false
        },
        "mbeanServerDefaultDomain": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "org.apache.camel",
          "description": "MBean server default domain name (default org.apache.camel)",
          "title": "Mbean Server Default Domain",
          "required": false,
          "deprecated": false
        },
        "mbeanObjectDomainName": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "org.apache.camel",
          "description": "MBean object domain name (default org.apache.camel)",
          "title": "Mbean Object Domain Name",
          "required": false,
          "deprecated": false
        },
        "serviceUrlPath": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "/jmxrmi",
          "description": "JMX Service URL path (default /jmxrmi)",
          "title": "Service Url Path",
          "required": false,
          "deprecated": false
        },
        "createConnector": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "A flag that indicates whether the agent should be created",
          "title": "Create Connector",
          "required": false,
          "deprecated": false
        },
        "usePlatformMBeanServer": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "A flag that indicates whether the platform mbean server should be used",
          "title": "Use Platform M Bean Server",
          "required": false,
          "deprecated": false
        },
        "registerAlways": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "A flag that indicates whether to register mbeans always",
          "title": "Register Always",
          "required": false,
          "deprecated": false
        },
        "registerNewRoutes": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "A flag that indicates whether to register mbeans when starting new routes",
          "title": "Register New Routes",
          "required": false,
          "deprecated": false
        },
        "statisticsLevel": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "Default",
          "description": "Level of granularity for performance statistics enabled",
          "title": "Statistics Level",
          "required": false,
          "deprecated": false
        },
        "loadStatisticsEnabled": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "A flag that indicates whether Load statistics is enabled",
          "title": "Load Statistics Enabled",
          "required": false,
          "deprecated": false
        },
        "endpointRuntimeStatisticsEnabled": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "A flag that indicates whether endpoint runtime statistics is enabled",
          "title": "Endpoint Runtime Statistics Enabled",
          "required": false,
          "deprecated": false
        },
        "includeHostName": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "A flag that indicates whether to include hostname in JMX MBean names.",
          "title": "Include Host Name",
          "required": false,
          "deprecated": false
        },
        "useHostIPAddress": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "A flag that indicates whether to use hostname or IP Address in the service url.",
          "title": "Use Host I P Address",
          "required": false,
          "deprecated": false
        },
        "mask": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "A flag that indicates whether to remove detected sensitive information (such as passwords) from MBean names and attributes.",
          "title": "Mask",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "kubernetesServiceDiscovery": {
      "type": "object",
      "title": "Kubernetes Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "lookup": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "environment",
          "enum": [ "client", "dns", "environment" ],
          "description": "How to perform service lookup. Possible values: client dns environment. When using client then the client queries the kubernetes master to obtain a list of active pods that provides the service and then random (or round robin) select a pod. When using dns the service name is resolved as name.namespace.service.dnsDomain. When using environment then environment variables are used to lookup the service. By default environment is used.",
          "title": "Lookup",
          "required": false,
          "deprecated": false
        },
        "dnsDomain": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the DNS domain to use for DNS lookup.",
          "title": "Dns Domain",
          "required": false,
          "deprecated": false
        },
        "namespace": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the namespace to use. Will by default use namespace from the ENV variable KUBERNETES_MASTER.",
          "title": "Namespace",
          "required": false,
          "deprecated": false
        },
        "apiVersion": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the API version when using client lookup",
          "title": "Api Version",
          "required": false,
          "deprecated": false
        },
        "masterUrl": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the URL to the master when using client lookup",
          "title": "Master Url",
          "required": false,
          "deprecated": false
        },
        "username": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the username for authentication when using client lookup",
          "title": "Username",
          "required": false,
          "deprecated": false
        },
        "password": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the password for authentication when using client lookup",
          "title": "Password",
          "required": false,
          "deprecated": false
        },
        "oauthToken": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the OAUTH token for authentication (instead of username/password) when using client lookup",
          "title": "Oauth Token",
          "required": false,
          "deprecated": false
        },
        "caCertData": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Certificate Authority data when using client lookup",
          "title": "Ca Cert Data",
          "required": false,
          "deprecated": false
        },
        "caCertFile": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Certificate Authority data that are loaded from the file when using client lookup",
          "title": "Ca Cert File",
          "required": false,
          "deprecated": false
        },
        "clientCertData": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Client Certificate data when using client lookup",
          "title": "Client Cert Data",
          "required": false,
          "deprecated": false
        },
        "clientCertFile": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Client Certificate data that are loaded from the file when using client lookup",
          "title": "Client Cert File",
          "required": false,
          "deprecated": false
        },
        "clientKeyAlgo": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Client Keystore algorithm such as RSA when using client lookup",
          "title": "Client Key Algo",
          "required": false,
          "deprecated": false
        },
        "clientKeyData": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Client Keystore data when using client lookup",
          "title": "Client Key Data",
          "required": false,
          "deprecated": false
        },
        "clientKeyFile": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Client Keystore data that are loaded from the file when using client lookup",
          "title": "Client Key File",
          "required": false,
          "deprecated": false
        },
        "clientKeyPassphrase": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Client Keystore passphrase when using client lookup",
          "title": "Client Key Passphrase",
          "required": false,
          "deprecated": false
        },
        "trustCerts": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether to turn on trust certificate check when using client lookup",
          "title": "Trust Certs",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "loadBalance": {
      "type": "object",
      "title": "Load Balance",
      "group": "eip,routing",
      "icon": "loadBalance24.png",
      "description": "Balances message processing among a number of nodes",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "loadBalancerType": {
          "kind": "element",
          "type": "object",
          "description": "The load balancer to be used",
          "title": "Load Balancer Type",
          "required": true,
          "deprecated": false
        },
        "inheritErrorHandler": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether or not to inherit the configured error handler. The default value is true. You can use this to disable using the inherited error handler for a given DSL such as a load balancer where you want to use a custom error handler strategy.",
          "title": "Inherit Error Handler",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "loadBalancerConfiguration": {
      "type": "object",
      "title": "Load Balancer Configuration",
      "group": "routing,cloud,load-balancing",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "log": {
      "type": "object",
      "title": "Log",
      "group": "eip,configuration",
      "icon": "log24.png",
      "description": "Logs the defined message to the logger",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "message": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the log message (uses simple language)",
          "title": "Message",
          "required": true,
          "deprecated": false
        },
        "loggingLevel": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "INFO",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Sets the logging level. The default value is INFO",
          "title": "Logging Level",
          "required": false,
          "deprecated": false
        },
        "logName": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the name of the logger",
          "title": "Log Name",
          "required": false,
          "deprecated": false
        },
        "marker": {
          "kind": "attribute",
          "type": "string",
          "description": "To use slf4j marker",
          "title": "Marker",
          "required": false,
          "deprecated": false
        },
        "loggerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "To refer to a custom logger instance to lookup from the registry.",
          "title": "Logger Ref",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "loop": {
      "type": "object",
      "title": "Loop",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Processes a message multiple times",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to define how many times we should loop. Notice the expression is only evaluated once and should return a number as how many times to loop. A value of zero or negative means no looping. The loop is like a for-loop fashion if you want a while loop then the dynamic router may be a better choice.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "copy": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the copy attribute is true a copy of the input Exchange is used for each iteration. That means each iteration will start from a copy of the same message. By default loop will loop the same exchange all over so each iteration may have different message content.",
          "title": "Copy",
          "required": false,
          "deprecated": false
        },
        "doWhile": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enables the while loop that loops until the predicate evaluates to false or null.",
          "title": "Do While",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "marshal": {
      "type": "object",
      "title": "Marshal",
      "group": "eip,transformation",
      "icon": "marshal24.png",
      "description": "Marshals data into a specified format for transmission over a transport or component",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "dataFormatType": {
          "kind": "element",
          "type": "object",
          "description": "The data format to be used",
          "title": "Data Format Type",
          "required": true,
          "deprecated": false
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "To refer to a custom data format to use as marshaller",
          "title": "Ref",
          "required": false,
          "deprecated": true
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "multiServiceDiscovery": {
      "type": "object",
      "title": "Multi Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "serviceDiscoveryConfigurations": {
          "kind": "element",
          "type": "array",
          "description": "List of ServiceDiscovery configuration to use",
          "title": "Service Discovery Configurations",
          "required": true,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "multiServiceFilter": {
      "type": "object",
      "title": "Multi Service Filter",
      "group": "routing,cloud,service-filter",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "serviceFilterConfigurations": {
          "kind": "element",
          "type": "array",
          "description": "List of ServiceFilter configuration to use",
          "title": "Service Filter Configurations",
          "required": true,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "multicast": {
      "type": "object",
      "title": "Multicast",
      "group": "eip,routing",
      "icon": "multicast24.png",
      "description": "Routes the same message to multiple paths either sequentially or in parallel.",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "parallelProcessing": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then sending messages to the multicasts occurs concurrently. Note the caller thread will still wait until all messages has been fully processed before it continues. Its only the sending and processing the replies from the multicasts which happens concurrently.",
          "title": "Parallel Processing",
          "required": false,
          "deprecated": false
        },
        "strategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to an AggregationStrategy to be used to assemble the replies from the multicasts into a single outgoing message from the Multicast. By default Camel will use the last reply as the outgoing message. You can also use a POJO as the AggregationStrategy",
          "title": "Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "strategyMethodName": {
          "kind": "attribute",
          "type": "string",
          "description": "This option can be used to explicit declare the method name to use when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Name",
          "required": false,
          "deprecated": false
        },
        "strategyMethodAllowNull": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was no data to enrich. If this option is true then null values is used as the oldExchange (when no data to enrich) when using POJOs as the AggregationStrategy",
          "title": "Strategy Method Allow Null",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom Thread Pool to be used for parallel processing. Notice if you set this option then parallel processing is automatic implied and you do not have to enable that option as well.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "streaming": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then Camel will process replies out-of-order eg in the order they come back. If disabled Camel will process replies in the same order as defined by the multicast.",
          "title": "Streaming",
          "required": false,
          "deprecated": false
        },
        "stopOnException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will now stop further processing if an exception or failure occurred during processing of an org.apache.camel.Exchange and the caused exception will be thrown. Will also stop if processing the exchange failed (has a fault message) or an exception was thrown and handled by the error handler (such as using onException). In all situations the multicast will stop further processing. This is the same behavior as in pipeline which is used by the routing engine. The default behavior is to not stop but continue processing till the end",
          "title": "Stop On Exception",
          "required": false,
          "deprecated": false
        },
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "0",
          "description": "Sets a total timeout specified in millis when using parallel processing. If the Multicast hasn't been able to send and process all replies within the given timeframe then the timeout triggers and the Multicast breaks out and continues. Notice if you provide a TimeoutAwareAggregationStrategy then the timeout method is invoked before breaking out. If the timeout is reached with running tasks still remaining certain tasks for which it is difficult for Camel to shut down in a graceful manner may continue to run. So use this option with a bit of care.",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "onPrepareRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Uses the Processor when preparing the org.apache.camel.Exchange to be send. This can be used to deep-clone messages that should be send or any custom logic needed before the exchange is send.",
          "title": "On Prepare Ref",
          "required": false,
          "deprecated": false
        },
        "shareUnitOfWork": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Shares the org.apache.camel.spi.UnitOfWork with the parent and each of the sub messages. Multicast will by default not share unit of work between the parent exchange and each multicasted exchange. This means each sub exchange has its own individual unit of work.",
          "title": "Share Unit Of Work",
          "required": false,
          "deprecated": false
        },
        "parallelAggregate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then the aggregate method on AggregationStrategy can be called concurrently. Notice that this would require the implementation of AggregationStrategy to be implemented as thread-safe. By default this is false meaning that Camel synchronizes the call to the aggregate method. Though in some use-cases this can be used to archive higher performance when the AggregationStrategy is implemented as thread-safe.",
          "title": "Parallel Aggregate",
          "required": false,
          "deprecated": false
        },
        "stopOnAggregateException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled unwind exceptions occurring at aggregation time to the error handler when parallelProcessing is used. Currently aggregation time exceptions do not stop the route processing when parallelProcessing is used. Enabling this option allows to work around this behavior. The default value is false for the sake of backward compatibility.",
          "title": "Stop On Aggregate Exception",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "onCompletion": {
      "type": "object",
      "title": "On Completion",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Route to be executed when normal route processing completes",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "mode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "AfterConsumer",
          "enum": [ "AfterConsumer", "BeforeConsumer" ],
          "description": "Sets the on completion mode. The default value is AfterConsumer",
          "title": "Mode",
          "required": false,
          "deprecated": false
        },
        "onCompleteOnly": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will only synchronize when the org.apache.camel.Exchange completed successfully (no errors).",
          "title": "On Complete Only",
          "required": false,
          "deprecated": false
        },
        "onFailureOnly": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will only synchronize when the org.apache.camel.Exchange ended with failure (exception or FAULT message).",
          "title": "On Failure Only",
          "required": false,
          "deprecated": false
        },
        "onWhen": {
          "kind": "element",
          "type": "object",
          "description": "Sets an additional predicate that should be true before the onCompletion is triggered. To be used for fine grained controlling whether a completion callback should be invoked or not",
          "title": "On When",
          "required": false,
          "deprecated": false
        },
        "parallelProcessing": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then the on completion process will run asynchronously by a separate thread from a thread pool. By default this is false meaning the on completion process will run synchronously using the same caller thread as from the route.",
          "title": "Parallel Processing",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom Thread Pool to be used for parallel processing. Notice if you set this option then parallel processing is automatic implied and you do not have to enable that option as well.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "useOriginalMessage": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will use the original input body when an org.apache.camel.Exchange for this on completion. By default this feature is off.",
          "title": "Use Original Message",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "onException": {
      "type": "object",
      "title": "On Exception",
      "group": "error",
      "icon": "generic24.png",
      "description": "Route to be executed when an exception is thrown",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "exception": {
          "kind": "element",
          "type": "array",
          "description": "A set of exceptions to react upon.",
          "title": "Exception",
          "required": true,
          "deprecated": false
        },
        "onWhen": {
          "kind": "element",
          "type": "object",
          "description": "Sets an additional predicate that should be true before the onException is triggered. To be used for fine grained controlling whether a thrown exception should be intercepted by this exception type or not.",
          "title": "On When",
          "required": false,
          "deprecated": false
        },
        "retryWhile": {
          "kind": "expression",
          "type": "object",
          "description": "Sets the retry while predicate. Will continue retrying until predicate returns false.",
          "title": "Retry While",
          "required": false,
          "deprecated": false
        },
        "redeliveryPolicy": {
          "kind": "element",
          "type": "object",
          "description": "Set the RedeliveryPolicy to be used.",
          "title": "Redelivery Policy",
          "required": false,
          "deprecated": false
        },
        "redeliveryPolicyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a RedeliveryPolicy to lookup in the org.apache.camel.spi.Registry to be used.",
          "title": "Redelivery Policy Ref",
          "required": false,
          "deprecated": false
        },
        "handled": {
          "kind": "expression",
          "type": "object",
          "description": "Sets whether the exchange should be marked as handled or not.",
          "title": "Handled",
          "required": false,
          "deprecated": false
        },
        "continued": {
          "kind": "expression",
          "type": "object",
          "description": "Sets whether the exchange should handle and continue routing from the point of failure. If this option is enabled then its considered handled as well.",
          "title": "Continued",
          "required": false,
          "deprecated": false
        },
        "onRedeliveryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a processor that should be processed before a redelivery attempt. Can be used to change the org.apache.camel.Exchange before its being redelivered.",
          "title": "On Redelivery Ref",
          "required": false,
          "deprecated": false
        },
        "onExceptionOccurredRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a processor that should be processed just after an exception occurred. Can be used to perform custom logging about the occurred exception at the exact time it happened. Important: Any exception thrown from this processor will be ignored.",
          "title": "On Exception Occurred Ref",
          "required": false,
          "deprecated": false
        },
        "useOriginalMessage": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will use the original input message when an org.apache.camel.Exchange is moved to the dead letter queue. Notice: this only applies when all redeliveries attempt have failed and the org.apache.camel.Exchange is doomed for failure. Instead of using the current in-progress org.apache.camel.Exchange IN body we use the original IN body instead. This allows you to store the original input in the dead letter queue instead of the in-progress snapshot of the IN body. For instance if you route transform the IN body during routing and then failed. With the original exchange store in the dead letter queue it might be easier to manually re submit the org.apache.camel.Exchange again as the IN body is the same as when Camel received it. So you should be able to send the org.apache.camel.Exchange to the same input. By default this feature is off.",
          "title": "Use Original Message",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "onFallback": {
      "type": "object",
      "title": "On Fallback",
      "group": "eip,routing,circuitbreaker",
      "icon": "generic24.png",
      "description": "Route to be executed when Hystrix EIP executes fallback",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "fallbackViaNetwork": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the fallback goes over the network. If the fallback will go over the network it is another possible point of failure and so it also needs to be wrapped by a HystrixCommand. It is important to execute the fallback command on a separate thread-pool otherwise if the main command were to become latent and fill the thread-pool this would prevent the fallback from running if the two commands share the same pool.",
          "title": "Fallback Via Network",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "optimisticLockRetryPolicy": {
      "type": "object",
      "title": "Optimistic Lock Retry Policy",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "To configure optimistic locking",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "maximumRetries": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum number of retries",
          "title": "Maximum Retries",
          "required": false,
          "deprecated": false
        },
        "retryDelay": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "50",
          "description": "Sets the delay in millis between retries",
          "title": "Retry Delay",
          "required": false,
          "deprecated": false
        },
        "maximumRetryDelay": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Sets the upper value of retry in millis between retries when using exponential or random backoff",
          "title": "Maximum Retry Delay",
          "required": false,
          "deprecated": false
        },
        "exponentialBackOff": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Enable exponential backoff",
          "title": "Exponential Back Off",
          "required": false,
          "deprecated": false
        },
        "randomBackOff": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enables random backoff",
          "title": "Random Back Off",
          "required": false,
          "deprecated": false
        }
      }
    },
    "otherwise": {
      "type": "object",
      "title": "Otherwise",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Route to be executed when all other choices evaluate to false",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "outputType": {
      "type": "object",
      "title": "Output Type",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Set the expected data type of the output message. If the actual message type is different at runtime camel look for a required Transformer and apply if exists. If validate attribute is true then camel applies Validator as well.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "urn": {
          "kind": "attribute",
          "type": "string",
          "description": "Set output type URN.",
          "title": "Urn",
          "required": true,
          "deprecated": false
        },
        "validate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Set if validation is required for this output type.",
          "title": "Validate",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "packageScan": {
      "type": "object",
      "title": "Package Scan",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Scans for Java org.apache.camel.builder.RouteBuilder classes in java packages",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "package": {
          "kind": "element",
          "type": "array",
          "description": "Sets the java package names to use for scanning for route builder classes",
          "title": "Package",
          "required": true,
          "deprecated": false
        },
        "excludes": {
          "kind": "element",
          "type": "array",
          "description": "Exclude finding route builder from these java package names.",
          "title": "Excludes",
          "required": false,
          "deprecated": false
        },
        "includes": {
          "kind": "element",
          "type": "array",
          "description": "Include finding route builder from these java package names.",
          "title": "Includes",
          "required": false,
          "deprecated": false
        }
      }
    },
    "passThroughServiceFilter": {
      "type": "object",
      "title": "Pass Through Service Filter",
      "group": "routing,cloud,service-filter",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "pipeline": {
      "type": "object",
      "title": "Pipeline",
      "group": "eip,routing",
      "icon": "pipeline24.png",
      "description": "Routes the message to a sequence of processors.",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "policy": {
      "type": "object",
      "title": "Policy",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Defines a policy the route will use",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to use for lookup the policy in the registry.",
          "title": "Ref",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "pollEnrich": {
      "type": "object",
      "title": "Poll Enrich",
      "group": "eip,transformation",
      "icon": "pollEnrich24.png",
      "description": "Enriches messages with data polled from a secondary resource",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression that computes the endpoint uri to use as the resource endpoint to enrich from",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "-1",
          "description": "Timeout in millis when polling from the external service. The timeout has influence about the poll enrich behavior. It basically operations in three different modes: negative value - Waits until a message is available and then returns it. Warning that this method could block indefinitely if no messages are available. 0 - Attempts to receive a message exchange immediately without waiting and returning null if a message exchange is not available yet. positive value - Attempts to receive a message exchange waiting up to the given timeout to expire if a message is not yet available. Returns null if timed out The default value is -1 and therefore the method could block indefinitely and therefore its recommended to use a timeout value",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "strategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to an AggregationStrategy to be used to merge the reply from the external service into a single outgoing message. By default Camel will use the reply from the external service as outgoing message.",
          "title": "Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "strategyMethodName": {
          "kind": "attribute",
          "type": "string",
          "description": "This option can be used to explicit declare the method name to use when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Name",
          "required": false,
          "deprecated": false
        },
        "strategyMethodAllowNull": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was no data to enrich. If this option is true then null values is used as the oldExchange (when no data to enrich) when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Allow Null",
          "required": false,
          "deprecated": false
        },
        "aggregateOnException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was an exception thrown while trying to retrieve the data to enrich from the resource. Setting this option to true allows end users to control what to do if there was an exception in the aggregate method. For example to suppress the exception or set a custom message body etc.",
          "title": "Aggregate On Exception",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ConsumerCache which is used to cache and reuse consumers when uris are reused.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoint",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "process": {
      "type": "object",
      "title": "Process",
      "group": "eip,endpoint",
      "icon": "process24.png",
      "description": "Calls a Camel processor",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the Processor to lookup in the registry to use.",
          "title": "Ref",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "properties": {
      "type": "object",
      "title": "Properties",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "A series of key value pair",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "property": {
          "kind": "element",
          "type": "array",
          "description": "A series of properties as key value pairs",
          "title": "Property",
          "required": false,
          "deprecated": false
        }
      }
    },
    "propertiesFunction": {
      "type": "object",
      "title": "Properties Function",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Function to use with properties placeholder",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the custom properties function to lookup in the registry",
          "title": "Ref",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "propertiesLocation": {
      "type": "object",
      "title": "Properties Location",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Properties to use with properties placeholder",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "resolver": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "classpath",
          "description": "The resolver to use to locate the location",
          "title": "Resolver",
          "required": false,
          "deprecated": false
        },
        "path": {
          "kind": "attribute",
          "type": "string",
          "description": "Property locations to use.",
          "title": "Path",
          "required": true,
          "deprecated": false
        },
        "optional": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the location is optional.",
          "title": "Optional",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "property": {
      "type": "object",
      "title": "Property",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "A key value pair",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "key": {
          "kind": "attribute",
          "type": "string",
          "description": "Property key",
          "title": "Key",
          "required": true,
          "deprecated": false
        },
        "value": {
          "kind": "attribute",
          "type": "string",
          "description": "Property value",
          "title": "Value",
          "required": true,
          "deprecated": false
        }
      }
    },
    "propertyPlaceholder": {
      "type": "object",
      "title": "Property Placeholder",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Properties placeholder",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "location": {
          "kind": "attribute",
          "type": "string",
          "description": "A list of locations to load properties. You can use comma to separate multiple locations. This option will override any default locations and only use the locations from this option.",
          "title": "Location",
          "required": false,
          "deprecated": false
        },
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "description": "Encoding to use when loading properties file from the file system or classpath. If no encoding has been set then the properties files is loaded using ISO-8859-1 encoding (latin-1) as documented by link java.util.Propertiesload(java.io.InputStream)",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "cache": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not to cache loaded properties. The default value is true.",
          "title": "Cache",
          "required": false,
          "deprecated": false
        },
        "ignoreMissingLocation": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to silently ignore if a location cannot be located such as a properties file not found.",
          "title": "Ignore Missing Location",
          "required": false,
          "deprecated": false
        },
        "propertiesResolverRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to a custom PropertiesResolver to be used",
          "title": "Properties Resolver Ref",
          "required": false,
          "deprecated": false
        },
        "propertiesParserRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to a custom PropertiesParser to be used",
          "title": "Properties Parser Ref",
          "required": false,
          "deprecated": false
        },
        "propertyPrefix": {
          "kind": "attribute",
          "type": "string",
          "description": "Optional prefix prepended to property names before resolution.",
          "title": "Property Prefix",
          "required": false,
          "deprecated": false
        },
        "propertySuffix": {
          "kind": "attribute",
          "type": "string",
          "description": "Optional suffix appended to property names before resolution.",
          "title": "Property Suffix",
          "required": false,
          "deprecated": false
        },
        "fallbackToUnaugmentedProperty": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "If true first attempt resolution of property name augmented with propertyPrefix and propertySuffix before falling back the plain property name specified. If false only the augmented property name is searched.",
          "title": "Fallback To Unaugmented Property",
          "required": false,
          "deprecated": false
        },
        "defaultFallbackEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "If false the component does not attempt to find a default for the key by looking after the colon separator.",
          "title": "Default Fallback Enabled",
          "required": false,
          "deprecated": false
        },
        "prefixToken": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "{{",
          "description": "Sets the value of the prefix token used to identify properties to replace. Setting a value of null restores the default token",
          "title": "Prefix Token",
          "required": false,
          "deprecated": false
        },
        "suffixToken": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "}}",
          "description": "Sets the value of the suffix token used to identify properties to replace. Setting a value of null restores the default token",
          "title": "Suffix Token",
          "required": false,
          "deprecated": false
        },
        "propertiesFunction": {
          "kind": "element",
          "type": "array",
          "description": "List of custom properties function to use.",
          "title": "Properties Function",
          "required": false,
          "deprecated": false
        },
        "propertiesLocation": {
          "kind": "element",
          "type": "array",
          "description": "List of property locations to use.",
          "title": "Properties Location",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "proxy": {
      "type": "object",
      "title": "Proxy",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "To proxy a service call using a interface",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "serviceUrl": {
          "kind": "attribute",
          "type": "string",
          "description": "The camel endpoint uri used to send the message to when calling the service from the interface.",
          "title": "Service Url",
          "required": false,
          "deprecated": false
        },
        "serviceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "The camel endpoint reference used to send the message to when calling the service from the interface.",
          "title": "Service Ref",
          "required": false,
          "deprecated": true
        },
        "serviceInterface": {
          "kind": "attribute",
          "type": "string",
          "description": "Java interfaces to use as facade for the service to be proxied",
          "title": "Service Interface",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "The id of the CamelContext to use if there is multiple CamelContext in the same JVM.",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "binding": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Camel parameter binding is enabled by default which will use binding information from the method signature parameters to bind to the Exchange/Message with the following annotations. If disabled then a org.apache.camel.component.bean.CamelInvocationHandler is used.",
          "title": "Binding",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "random": {
      "type": "object",
      "title": "Random",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Random load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "recipientList": {
      "type": "object",
      "title": "Recipient List",
      "group": "eip,endpoint,routing",
      "icon": "recipientList24.png",
      "description": "Routes messages to a number of dynamically specified recipients (dynamic to)",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression that returns which endpoints (url) to send the message to (the recipients). If the expression return an empty value then the message is not sent to any recipients.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "delimiter": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": ",",
          "description": "Delimiter used if the Expression returned multiple endpoints. Can be turned off using the value false. The default value is",
          "title": "Delimiter",
          "required": false,
          "deprecated": false
        },
        "parallelProcessing": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then sending messages to the recipients occurs concurrently. Note the caller thread will still wait until all messages has been fully processed before it continues. Its only the sending and processing the replies from the recipients which happens concurrently.",
          "title": "Parallel Processing",
          "required": false,
          "deprecated": false
        },
        "strategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to the AggregationStrategy to be used to assemble the replies from the recipients into a single outgoing message from the RecipientList. By default Camel will use the last reply as the outgoing message. You can also use a POJO as the AggregationStrategy",
          "title": "Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "strategyMethodName": {
          "kind": "attribute",
          "type": "string",
          "description": "This option can be used to explicit declare the method name to use when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Name",
          "required": false,
          "deprecated": false
        },
        "strategyMethodAllowNull": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was no data to enrich. If this option is true then null values is used as the oldExchange (when no data to enrich) when using POJOs as the AggregationStrategy",
          "title": "Strategy Method Allow Null",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom Thread Pool to be used for parallel processing. Notice if you set this option then parallel processing is automatic implied and you do not have to enable that option as well.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "stopOnException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will now stop further processing if an exception or failure occurred during processing of an org.apache.camel.Exchange and the caused exception will be thrown. Will also stop if processing the exchange failed (has a fault message) or an exception was thrown and handled by the error handler (such as using onException). In all situations the recipient list will stop further processing. This is the same behavior as in pipeline which is used by the routing engine. The default behavior is to not stop but continue processing till the end",
          "title": "Stop On Exception",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoints": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoints",
          "required": false,
          "deprecated": false
        },
        "streaming": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then Camel will process replies out-of-order eg in the order they come back. If disabled Camel will process replies in the same order as defined by the recipient list.",
          "title": "Streaming",
          "required": false,
          "deprecated": false
        },
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "0",
          "description": "Sets a total timeout specified in millis when using parallel processing. If the Recipient List hasn't been able to send and process all replies within the given timeframe then the timeout triggers and the Recipient List breaks out and continues. Notice if you provide a TimeoutAwareAggregationStrategy then the timeout method is invoked before breaking out. If the timeout is reached with running tasks still remaining certain tasks for which it is difficult for Camel to shut down in a graceful manner may continue to run. So use this option with a bit of care.",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "onPrepareRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Uses the Processor when preparing the org.apache.camel.Exchange to be send. This can be used to deep-clone messages that should be send or any custom logic needed before the exchange is send.",
          "title": "On Prepare Ref",
          "required": false,
          "deprecated": false
        },
        "shareUnitOfWork": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Shares the org.apache.camel.spi.UnitOfWork with the parent and each of the sub messages. Recipient List will by default not share unit of work between the parent exchange and each recipient exchange. This means each sub exchange has its own individual unit of work.",
          "title": "Share Unit Of Work",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ProducerCache which is used to cache and reuse producers when using this recipient list when uris are reused.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "parallelAggregate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then the aggregate method on AggregationStrategy can be called concurrently. Notice that this would require the implementation of AggregationStrategy to be implemented as thread-safe. By default this is false meaning that Camel synchronizes the call to the aggregate method. Though in some use-cases this can be used to archive higher performance when the AggregationStrategy is implemented as thread-safe.",
          "title": "Parallel Aggregate",
          "required": false,
          "deprecated": false
        },
        "stopOnAggregateException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled unwind exceptions occurring at aggregation time to the error handler when parallelProcessing is used. Currently aggregation time exceptions do not stop the route processing when parallelProcessing is used. Enabling this option allows to work around this behavior. The default value is false for the sake of backward compatibility.",
          "title": "Stop On Aggregate Exception",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "redeliveryPolicy": {
      "type": "object",
      "title": "Redelivery Policy",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "To configure re-delivery for error handling",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "maximumRedeliveries": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum redeliveries x = redeliver at most x times 0 = no redeliveries -1 = redeliver forever",
          "title": "Maximum Redeliveries",
          "required": false,
          "deprecated": false
        },
        "redeliveryDelay": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the initial redelivery delay",
          "title": "Redelivery Delay",
          "required": false,
          "deprecated": false
        },
        "asyncDelayedRedelivery": {
          "kind": "attribute",
          "type": "string",
          "description": "Allow synchronous delayed redelivery. The route in particular the consumer's component must support the Asynchronous Routing Engine (e.g. seda).",
          "title": "Async Delayed Redelivery",
          "required": false,
          "deprecated": false
        },
        "backOffMultiplier": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the back off multiplier",
          "title": "Back Off Multiplier",
          "required": false,
          "deprecated": false
        },
        "useExponentialBackOff": {
          "kind": "attribute",
          "type": "string",
          "description": "Turn on exponential backk off",
          "title": "Use Exponential Back Off",
          "required": false,
          "deprecated": false
        },
        "collisionAvoidanceFactor": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the collision avoidance factor",
          "title": "Collision Avoidance Factor",
          "required": false,
          "deprecated": false
        },
        "useCollisionAvoidance": {
          "kind": "attribute",
          "type": "string",
          "description": "Turn on collision avoidance.",
          "title": "Use Collision Avoidance",
          "required": false,
          "deprecated": false
        },
        "maximumRedeliveryDelay": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum delay between redelivery",
          "title": "Maximum Redelivery Delay",
          "required": false,
          "deprecated": false
        },
        "retriesExhaustedLogLevel": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Sets the logging level to use when retries has exhausted",
          "title": "Retries Exhausted Log Level",
          "required": false,
          "deprecated": false
        },
        "retryAttemptedLogLevel": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Sets the logging level to use for logging retry attempts",
          "title": "Retry Attempted Log Level",
          "required": false,
          "deprecated": false
        },
        "logRetryAttempted": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether retry attempts should be logged or not. Can be used to include or reduce verbose.",
          "title": "Log Retry Attempted",
          "required": false,
          "deprecated": false
        },
        "logStackTrace": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether stack traces should be logged. Can be used to include or reduce verbose.",
          "title": "Log Stack Trace",
          "required": false,
          "deprecated": false
        },
        "logRetryStackTrace": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether stack traces should be logged when an retry attempt failed. Can be used to include or reduce verbose.",
          "title": "Log Retry Stack Trace",
          "required": false,
          "deprecated": false
        },
        "logHandled": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether handled exceptions should be logged or not. Can be used to include or reduce verbose.",
          "title": "Log Handled",
          "required": false,
          "deprecated": false
        },
        "logNewException": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether new exceptions should be logged or not. Can be used to include or reduce verbose. A new exception is an exception that was thrown while handling a previous exception.",
          "title": "Log New Exception",
          "required": false,
          "deprecated": false
        },
        "logContinued": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether continued exceptions should be logged or not. Can be used to include or reduce verbose.",
          "title": "Log Continued",
          "required": false,
          "deprecated": false
        },
        "logExhausted": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether exhausted exceptions should be logged or not. Can be used to include or reduce verbose.",
          "title": "Log Exhausted",
          "required": false,
          "deprecated": false
        },
        "logExhaustedMessageHistory": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether exhausted exceptions should be logged including message history or not (supports property placeholders). Can be used to include or reduce verbose.",
          "title": "Log Exhausted Message History",
          "required": false,
          "deprecated": false
        },
        "logExhaustedMessageBody": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether exhausted message body should be logged including message history or not (supports property placeholders). Can be used to include or reduce verbose. Requires logExhaustedMessageHistory to be enabled.",
          "title": "Log Exhausted Message Body",
          "required": false,
          "deprecated": false
        },
        "disableRedelivery": {
          "kind": "attribute",
          "type": "string",
          "description": "Disables redelivery (same as setting maximum redeliveries to 0)",
          "title": "Disable Redelivery",
          "required": false,
          "deprecated": false
        },
        "delayPattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the delay pattern with delay intervals.",
          "title": "Delay Pattern",
          "required": false,
          "deprecated": false
        },
        "allowRedeliveryWhileStopping": {
          "kind": "attribute",
          "type": "string",
          "description": "Controls whether to allow redelivery while stopping/shutting down a route that uses error handling.",
          "title": "Allow Redelivery While Stopping",
          "required": false,
          "deprecated": false
        },
        "exchangeFormatterRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the reference of the instance of org.apache.camel.spi.ExchangeFormatter to generate the log message from exchange.",
          "title": "Exchange Formatter Ref",
          "required": false,
          "deprecated": false
        }
      }
    },
    "redeliveryPolicyProfile": {
      "type": "object",
      "title": "Redelivery Policy Profile",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Configuration of redelivery policy.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "maximumRedeliveries": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum number of times a message exchange will be redelivered. Setting a negative value will retry forever.",
          "title": "Maximum Redeliveries",
          "required": false,
          "deprecated": false
        },
        "redeliveryDelay": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "1000",
          "description": "Sets the maximum redelivery delay. Use -1 if you wish to have no maximum",
          "title": "Redelivery Delay",
          "required": false,
          "deprecated": false
        },
        "asyncDelayedRedelivery": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether asynchronous delayed redelivery is allowed. This is disabled by default. When enabled it allows Camel to schedule a future task for delayed redelivery which prevents current thread from blocking while waiting. Exchange which is transacted will however always use synchronous delayed redelivery because the transaction must execute in the same thread context.",
          "title": "Async Delayed Redelivery",
          "required": false,
          "deprecated": false
        },
        "backOffMultiplier": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "2",
          "description": "Sets the multiplier used to increase the delay between redeliveries if useExponentialBackOff is enabled",
          "title": "Back Off Multiplier",
          "required": false,
          "deprecated": false
        },
        "useExponentialBackOff": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Enables/disables exponential backoff using the backOffMultiplier to increase the time between retries",
          "title": "Use Exponential Back Off",
          "required": false,
          "deprecated": false
        },
        "collisionAvoidanceFactor": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "0.15",
          "description": "Sets the factor used for collision avoidance if enabled via useCollisionAvoidance.",
          "title": "Collision Avoidance Factor",
          "required": false,
          "deprecated": false
        },
        "useCollisionAvoidance": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Enables/disables collision avoidance which adds some randomization to the backoff timings to reduce contention probability",
          "title": "Use Collision Avoidance",
          "required": false,
          "deprecated": false
        },
        "maximumRedeliveryDelay": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "60000",
          "description": "Sets the maximum redelivery delay. Use -1 if you wish to have no maximum",
          "title": "Maximum Redelivery Delay",
          "required": false,
          "deprecated": false
        },
        "retriesExhaustedLogLevel": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "ERROR",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Sets the logging level to use for log messages when retries have been exhausted.",
          "title": "Retries Exhausted Log Level",
          "required": false,
          "deprecated": false
        },
        "retryAttemptedLogLevel": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "DEBUG",
          "enum": [ "DEBUG", "ERROR", "INFO", "OFF", "TRACE", "WARN" ],
          "description": "Sets the logging level to use for log messages when retries are attempted.",
          "title": "Retry Attempted Log Level",
          "required": false,
          "deprecated": false
        },
        "logRetryAttempted": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Sets whether to log retry attempts",
          "title": "Log Retry Attempted",
          "required": false,
          "deprecated": false
        },
        "logStackTrace": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Sets whether stack traces should be logged or not",
          "title": "Log Stack Trace",
          "required": false,
          "deprecated": false
        },
        "logRetryStackTrace": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether stack traces should be logged or not",
          "title": "Log Retry Stack Trace",
          "required": false,
          "deprecated": false
        },
        "logHandled": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether errors should be logged even if its handled",
          "title": "Log Handled",
          "required": false,
          "deprecated": false
        },
        "logContinued": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether errors should be logged even if its continued",
          "title": "Log Continued",
          "required": false,
          "deprecated": false
        },
        "logExhausted": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Sets whether exhausted exceptions should be logged or not",
          "title": "Log Exhausted",
          "required": false,
          "deprecated": false
        },
        "logExhaustedMessageHistory": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether to log exhausted errors including message history",
          "title": "Log Exhausted Message History",
          "required": false,
          "deprecated": false
        },
        "disableRedelivery": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Disables redelivery by setting maximum redeliveries to 0.",
          "title": "Disable Redelivery",
          "required": false,
          "deprecated": false
        },
        "delayPattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets an optional delay pattern to use instead of fixed delay.",
          "title": "Delay Pattern",
          "required": false,
          "deprecated": false
        },
        "allowRedeliveryWhileStopping": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Controls whether to allow redelivery while stopping/shutting down a route that uses error handling.",
          "title": "Allow Redelivery While Stopping",
          "required": false,
          "deprecated": false
        },
        "exchangeFormatterRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the reference of the instance of org.apache.camel.spi.ExchangeFormatter to generate the log message from exchange.",
          "title": "Exchange Formatter Ref",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "Id of CamelContext to use if there are multiple CamelContexts in the same JVM",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "removeHeader": {
      "type": "object",
      "title": "Remove Header",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Removes a named header from the message",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of header to remove",
          "title": "Header Name",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "removeHeaders": {
      "type": "object",
      "title": "Remove Headers",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Removes message headers whose name matches a specified pattern",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "pattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Name or pattern of headers to remove",
          "title": "Pattern",
          "required": true,
          "deprecated": false
        },
        "excludePattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Name or patter of headers to not remove",
          "title": "Exclude Pattern",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "removeProperties": {
      "type": "object",
      "title": "Remove Properties",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Removes message exchange properties whose name matches a specified pattern",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "pattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Name or pattern of properties to remove",
          "title": "Pattern",
          "required": true,
          "deprecated": false
        },
        "excludePattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Name or pattern of properties to not remove",
          "title": "Exclude Pattern",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "removeProperty": {
      "type": "object",
      "title": "Remove Property",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Removes a named property from the message exchange",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "propertyName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of property to remove",
          "title": "Property Name",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "resequence": {
      "type": "object",
      "title": "Resequence",
      "group": "eip,routing",
      "icon": "resequence24.png",
      "description": "Resequences (re-order) messages based on an expression",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to use for re-ordering the messages such as a header with a sequence number",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "resequencerConfig": {
          "kind": "element",
          "type": "object",
          "description": "To configure the resequencer in using either batch or stream configuration. Will by default use batch configuration.",
          "title": "Resequencer Config",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "ribbonLoadBalancer": {
      "type": "object",
      "title": "Ribbon Load Balancer",
      "group": "routing,cloud,load-balancing",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "namespace": {
          "kind": "attribute",
          "type": "string",
          "description": "The namespace",
          "title": "Namespace",
          "required": false,
          "deprecated": false
        },
        "username": {
          "kind": "attribute",
          "type": "string",
          "description": "The username",
          "title": "Username",
          "required": false,
          "deprecated": false
        },
        "password": {
          "kind": "attribute",
          "type": "string",
          "description": "The password",
          "title": "Password",
          "required": false,
          "deprecated": false
        },
        "clientName": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Ribbon client name",
          "title": "Client Name",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "rollback": {
      "type": "object",
      "title": "Rollback",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Forces a rollback by stopping routing the message",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "markRollbackOnly": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Mark the transaction for rollback only (cannot be overruled to commit)",
          "title": "Mark Rollback Only",
          "required": false,
          "deprecated": false
        },
        "markRollbackOnlyLast": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Mark only last sub transaction for rollback only. When using sub transactions (if the transaction manager support this)",
          "title": "Mark Rollback Only Last",
          "required": false,
          "deprecated": false
        },
        "message": {
          "kind": "attribute",
          "type": "string",
          "description": "Message to use in rollback exception",
          "title": "Message",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "roundRobin": {
      "type": "object",
      "title": "Round Robin",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Round robin load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "route": {
      "type": "object",
      "title": "Route",
      "group": "configuration",
      "icon": "route24.png",
      "description": "A Camel route",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "group": {
          "kind": "attribute",
          "type": "string",
          "description": "The group that this route belongs to; could be the name of the RouteBuilder class or be explicitly configured in the XML. May be null.",
          "title": "Group",
          "required": false,
          "deprecated": false
        },
        "streamCache": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether stream caching is enabled on this route.",
          "title": "Stream Cache",
          "required": false,
          "deprecated": false
        },
        "trace": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether tracing is enabled on this route.",
          "title": "Trace",
          "required": false,
          "deprecated": false
        },
        "messageHistory": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Whether message history is enabled on this route.",
          "title": "Message History",
          "required": false,
          "deprecated": false
        },
        "logMask": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Whether security mask for Logging is enabled on this route.",
          "title": "Log Mask",
          "required": false,
          "deprecated": false
        },
        "handleFault": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether handle fault is enabled on this route.",
          "title": "Handle Fault",
          "required": false,
          "deprecated": false
        },
        "delayer": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether to slow down processing messages by a given delay in msec.",
          "title": "Delayer",
          "required": false,
          "deprecated": false
        },
        "autoStartup": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Whether to auto start this route",
          "title": "Auto Startup",
          "required": false,
          "deprecated": false
        },
        "startupOrder": {
          "kind": "attribute",
          "type": "integer",
          "description": "To configure the ordering of the routes being started",
          "title": "Startup Order",
          "required": false,
          "deprecated": false
        },
        "errorHandlerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the bean ref name of the error handler builder to use on this route",
          "title": "Error Handler Ref",
          "required": false,
          "deprecated": false
        },
        "routePolicyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to custom org.apache.camel.spi.RoutePolicy to use by the route. Multiple policies can be configured by separating values using comma.",
          "title": "Route Policy Ref",
          "required": false,
          "deprecated": false
        },
        "shutdownRoute": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "Default", "Defer" ],
          "description": "To control how to shutdown the route.",
          "title": "Shutdown Route",
          "required": false,
          "deprecated": false
        },
        "shutdownRunningTask": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "CompleteCurrentTaskOnly", "CompleteAllTasks" ],
          "description": "To control how to shutdown the route.",
          "title": "Shutdown Running Task",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "routeBuilder": {
      "type": "object",
      "title": "Route Builder",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "To refer to a Java org.apache.camel.builder.RouteBuilder instance to use.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the route builder instance",
          "title": "Ref",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "routeContext": {
      "type": "object",
      "title": "Route Context",
      "group": "spring,configuration,routing",
      "icon": "generic24.png",
      "description": "Configuration of routes using XML",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "route": {
          "kind": "element",
          "type": "array",
          "description": "Contains the Camel routes",
          "title": "Route",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "routeContextRef": {
      "type": "object",
      "title": "Route Context Ref",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "To refer to an XML file with routes defined using the xml-dsl",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the routes in the xml dsl",
          "title": "Ref",
          "required": true,
          "deprecated": false
        }
      }
    },
    "routes": {
      "type": "object",
      "title": "Routes",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "A series of Camel routes",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "routes": {
          "kind": "element",
          "type": "array",
          "description": "Contains the Camel routes",
          "title": "Routes",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "routingSlip": {
      "type": "object",
      "title": "Routing Slip",
      "group": "eip,endpoint,routing",
      "icon": "routingSlip24.png",
      "description": "Routes a message through a series of steps that are pre-determined (the slip)",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to define the routing slip which defines which endpoints to route the message in a pipeline style. Notice the expression is evaluated once if you want a more dynamic style then the dynamic router eip is a better choice.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "uriDelimiter": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": ",",
          "description": "Sets the uri delimiter to use",
          "title": "Uri Delimiter",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoints": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoints",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ProducerCache which is used to cache and reuse producers when using this recipient list when uris are reused.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "sample": {
      "type": "object",
      "title": "Sample",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Extract a sample of the messages passing through a route",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "samplePeriod": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1",
          "description": "Sets the sample period during which only a single Exchange will pass through.",
          "title": "Sample Period",
          "required": false,
          "deprecated": false
        },
        "messageFrequency": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the sample message count which only a single Exchange will pass through after this many received.",
          "title": "Message Frequency",
          "required": false,
          "deprecated": false
        },
        "units": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "SECONDS",
          "enum": [ "DAYS", "HOURS", "MICROSECONDS", "MILLISECONDS", "MINUTES", "NANOSECONDS", "SECONDS" ],
          "description": "Sets the time units for the sample period defaulting to seconds.",
          "title": "Units",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "script": {
      "type": "object",
      "title": "Script",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Executes a script from a language which does not change the message body.",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to return the transformed message body (the new message body to use)",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serviceCall": {
      "type": "object",
      "title": "Service Call",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "To call remote services",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "name": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the name of the service to use",
          "title": "Name",
          "required": true,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "The uri of the endpoint to send to. The uri can be dynamic computed using the org.apache.camel.language.simple.SimpleLanguage expression.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "component": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "http4",
          "description": "The component to use.",
          "title": "Component",
          "required": false,
          "deprecated": false
        },
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the optional ExchangePattern used to invoke this endpoint",
          "title": "Pattern",
          "required": false,
          "deprecated": false
        },
        "configurationRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a ServiceCall configuration to use",
          "title": "Configuration Ref",
          "required": false,
          "deprecated": false
        },
        "serviceDiscoveryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceDiscovery to use.",
          "title": "Service Discovery Ref",
          "required": false,
          "deprecated": false
        },
        "serviceFilterRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceFilter to use.",
          "title": "Service Filter Ref",
          "required": false,
          "deprecated": false
        },
        "serviceChooserRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceChooser to use.",
          "title": "Service Chooser Ref",
          "required": false,
          "deprecated": false
        },
        "loadBalancerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceLoadBalancer to use.",
          "title": "Load Balancer Ref",
          "required": false,
          "deprecated": false
        },
        "expressionRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Set a reference to a custom Expression to use.",
          "title": "Expression Ref",
          "required": false,
          "deprecated": false
        },
        "serviceDiscoveryConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the ServiceDiscovery using the given configuration.",
          "title": "Service Discovery Configuration",
          "required": true,
          "deprecated": false
        },
        "serviceFilterConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the ServiceFilter using the given configuration.",
          "title": "Service Filter Configuration",
          "required": true,
          "deprecated": false
        },
        "loadBalancerConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the LoadBalancer using the given configuration.",
          "title": "Load Balancer Configuration",
          "required": true,
          "deprecated": false
        },
        "expressionConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the Expression using the given configuration.",
          "title": "Expression Configuration",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serviceCallConfiguration": {
      "type": "object",
      "title": "Service Call Configuration",
      "group": "routing,cloud",
      "icon": "generic24.png",
      "description": "Remote service call configuration",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "The uri of the endpoint to send to. The uri can be dynamic computed using the org.apache.camel.language.simple.SimpleLanguage expression.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "component": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "http4",
          "description": "The component to use.",
          "title": "Component",
          "required": false,
          "deprecated": false
        },
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the optional ExchangePattern used to invoke this endpoint",
          "title": "Pattern",
          "required": false,
          "deprecated": false
        },
        "serviceDiscoveryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceDiscovery to use.",
          "title": "Service Discovery Ref",
          "required": false,
          "deprecated": false
        },
        "serviceFilterRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceFilter to use.",
          "title": "Service Filter Ref",
          "required": false,
          "deprecated": false
        },
        "serviceChooserRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceChooser to use.",
          "title": "Service Chooser Ref",
          "required": false,
          "deprecated": false
        },
        "loadBalancerRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to a custom ServiceLoadBalancer to use.",
          "title": "Load Balancer Ref",
          "required": false,
          "deprecated": false
        },
        "expressionRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Set a reference to a custom Expression to use.",
          "title": "Expression Ref",
          "required": false,
          "deprecated": false
        },
        "serviceDiscoveryConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the ServiceDiscovery using the given configuration.",
          "title": "Service Discovery Configuration",
          "required": true,
          "deprecated": false
        },
        "serviceFilterConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the ServiceFilter using the given configuration.",
          "title": "Service Filter Configuration",
          "required": true,
          "deprecated": false
        },
        "loadBalancerConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures theL oadBalancer using the given configuration.",
          "title": "Load Balancer Configuration",
          "required": true,
          "deprecated": false
        },
        "expressionConfiguration": {
          "kind": "element",
          "type": "object",
          "description": "Configures the Expression using the given configuration.",
          "title": "Expression Configuration",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serviceChooserConfiguration": {
      "type": "object",
      "title": "Service Chooser Configuration",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serviceDiscoveryConfiguration": {
      "type": "object",
      "title": "Service Discovery Configuration",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serviceExpression": {
      "type": "object",
      "title": "Service Expression",
      "group": "routing,cloud",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "hostHeader": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "CamelServiceCallServiceHost",
          "description": "The header that holds the service host information default ServiceCallConstants.SERVICE_HOST",
          "title": "Host Header",
          "required": false,
          "deprecated": false
        },
        "portHeader": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "CamelServiceCallServicePort",
          "description": "The header that holds the service port information default ServiceCallConstants.SERVICE_PORT",
          "title": "Port Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serviceFilterConfiguration": {
      "type": "object",
      "title": "Service Filter Configuration",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "setBody": {
      "type": "object",
      "title": "Set Body",
      "group": "eip,transformation",
      "icon": "setBody24.png",
      "description": "Sets the contents of the message body",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression that returns the new body to use",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "setExchangePattern": {
      "type": "object",
      "title": "Set Exchange Pattern",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Sets the exchange pattern on the message exchange",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the new exchange pattern of the Exchange to be used from this point forward",
          "title": "Pattern",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "setFaultBody": {
      "type": "object",
      "title": "Set Fault Body",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Sets the contents of a fault message's body",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression that returns the new fault body to use",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "setHeader": {
      "type": "object",
      "title": "Set Header",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Sets the value of a message header",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to return the value of the header",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of message header to set a new value The simple language can be used to define a dynamic evaluated header name to be used. Otherwise a constant name will be used.",
          "title": "Header Name",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "setOutHeader": {
      "type": "object",
      "title": "Set Out Header",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Sets the value of a header on the outbound message",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to return the value of the header",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of message header to set a new value",
          "title": "Header Name",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "setProperty": {
      "type": "object",
      "title": "Set Property",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Sets a named property on the message exchange",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to return the value of the message exchange property",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "propertyName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of exchange property to set a new value. The simple language can be used to define a dynamic evaluated exchange property name to be used. Otherwise a constant name will be used.",
          "title": "Property Name",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "sort": {
      "type": "object",
      "title": "Sort",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Sorts the contents of the message",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Optional expression to sort by something else than the message body",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "comparatorRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to lookup for the comparator to use for sorting",
          "title": "Comparator Ref",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "split": {
      "type": "object",
      "title": "Split",
      "group": "eip,routing",
      "icon": "split24.png",
      "description": "Splits a single message into many sub-messages.",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression of how to split the message body such as as-is using a tokenizer or using an xpath.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "parallelProcessing": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then processing each splitted messages occurs concurrently. Note the caller thread will still wait until all messages has been fully processed before it continues. Its only processing the sub messages from the splitter which happens concurrently.",
          "title": "Parallel Processing",
          "required": false,
          "deprecated": false
        },
        "strategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to the AggregationStrategy to be used to assemble the replies from the splitted messages into a single outgoing message from the Splitter. By default Camel will use the original incoming message to the splitter (leave it unchanged). You can also use a POJO as the AggregationStrategy",
          "title": "Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "strategyMethodName": {
          "kind": "attribute",
          "type": "string",
          "description": "This option can be used to explicit declare the method name to use when using POJOs as the AggregationStrategy.",
          "title": "Strategy Method Name",
          "required": false,
          "deprecated": false
        },
        "strategyMethodAllowNull": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If this option is false then the aggregate method is not used if there was no data to enrich. If this option is true then null values is used as the oldExchange (when no data to enrich) when using POJOs as the AggregationStrategy",
          "title": "Strategy Method Allow Null",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom Thread Pool to be used for parallel processing. Notice if you set this option then parallel processing is automatic implied and you do not have to enable that option as well.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "streaming": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "When in streaming mode then the splitter splits the original message on-demand and each splitted message is processed one by one. This reduces memory usage as the splitter do not split all the messages first but then we do not know the total size and therefore the link org.apache.camel.ExchangeSPLIT_SIZE is empty. In non-streaming mode (default) the splitter will split each message first to know the total size and then process each message one by one. This requires to keep all the splitted messages in memory and therefore requires more memory. The total size is provided in the link org.apache.camel.ExchangeSPLIT_SIZE header. The streaming mode also affects the aggregation behavior. If enabled then Camel will process replies out-of-order eg in the order they come back. If disabled Camel will process replies in the same order as the messages was splitted.",
          "title": "Streaming",
          "required": false,
          "deprecated": false
        },
        "stopOnException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Will now stop further processing if an exception or failure occurred during processing of an org.apache.camel.Exchange and the caused exception will be thrown. Will also stop if processing the exchange failed (has a fault message) or an exception was thrown and handled by the error handler (such as using onException). In all situations the splitter will stop further processing. This is the same behavior as in pipeline which is used by the routing engine. The default behavior is to not stop but continue processing till the end",
          "title": "Stop On Exception",
          "required": false,
          "deprecated": false
        },
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "0",
          "description": "Sets a total timeout specified in millis when using parallel processing. If the Splitter hasn't been able to split and process all the sub messages within the given timeframe then the timeout triggers and the Splitter breaks out and continues. Notice if you provide a TimeoutAwareAggregationStrategy then the timeout method is invoked before breaking out. If the timeout is reached with running tasks still remaining certain tasks for which it is difficult for Camel to shut down in a graceful manner may continue to run. So use this option with a bit of care.",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "onPrepareRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Uses the Processor when preparing the org.apache.camel.Exchange to be send. This can be used to deep-clone messages that should be send or any custom logic needed before the exchange is send.",
          "title": "On Prepare Ref",
          "required": false,
          "deprecated": false
        },
        "shareUnitOfWork": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Shares the org.apache.camel.spi.UnitOfWork with the parent and each of the sub messages. Splitter will by default not share unit of work between the parent exchange and each splitted exchange. This means each splitted exchange has its own individual unit of work.",
          "title": "Share Unit Of Work",
          "required": false,
          "deprecated": false
        },
        "parallelAggregate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then the aggregate method on AggregationStrategy can be called concurrently. Notice that this would require the implementation of AggregationStrategy to be implemented as thread-safe. By default this is false meaning that Camel synchronizes the call to the aggregate method. Though in some use-cases this can be used to archive higher performance when the AggregationStrategy is implemented as thread-safe.",
          "title": "Parallel Aggregate",
          "required": false,
          "deprecated": false
        },
        "stopOnAggregateException": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled unwind exceptions occurring at aggregation time to the error handler when parallelProcessing is used. Currently aggregation time exceptions do not stop the route processing when parallelProcessing is used. Enabling this option allows to work around this behavior. The default value is false for the sake of backward compatibility.",
          "title": "Stop On Aggregate Exception",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "staticServiceDiscovery": {
      "type": "object",
      "title": "Static Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "servers": {
          "kind": "element",
          "type": "array",
          "description": "Sets the server list. Each entry can be a list of servers separated by comma in the format: servicehost:portservicehost2:portservicehost3:port",
          "title": "Servers",
          "required": false,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "sticky": {
      "type": "object",
      "title": "Sticky",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Sticky load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "correlationExpression": {
          "kind": "expression",
          "type": "object",
          "description": "The correlation expression to use to calculate the correlation key",
          "title": "Correlation Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "stop": {
      "type": "object",
      "title": "Stop",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Stops the processing of the current message",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "stream-config": {
      "type": "object",
      "title": "Stream-config",
      "group": "eip,routing,resequence",
      "icon": "generic24.png",
      "description": "Configures stream-processing resequence eip.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "capacity": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "100",
          "description": "Sets the capacity of the resequencer's inbound queue.",
          "title": "Capacity",
          "required": false,
          "deprecated": false
        },
        "timeout": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Sets minimum time to wait for missing elements (messages).",
          "title": "Timeout",
          "required": false,
          "deprecated": false
        },
        "deliveryAttemptInterval": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Sets the interval in milli seconds the stream resequencer will at most wait while waiting for condition of being able to deliver.",
          "title": "Delivery Attempt Interval",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidExchanges": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore invalid exchanges",
          "title": "Ignore Invalid Exchanges",
          "required": false,
          "deprecated": false
        },
        "comparatorRef": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom comparator",
          "title": "Comparator Ref",
          "required": false,
          "deprecated": false
        },
        "rejectOld": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If true throws an exception when messages older than the last delivered message are processed",
          "title": "Reject Old",
          "required": false,
          "deprecated": false
        }
      }
    },
    "streamCaching": {
      "type": "object",
      "title": "Stream Caching",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Stream caching configuration.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "enabled": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether the stream caching is enabled. Notice: This cannot be changed at runtime.",
          "title": "Enabled",
          "required": false,
          "deprecated": false
        },
        "spoolDirectory": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the spool (temporary) directory to use for overflow and spooling to disk. If no spool directory has been explicit configured then a temporary directory is created in the java.io.tmpdir directory.",
          "title": "Spool Directory",
          "required": false,
          "deprecated": false
        },
        "spoolChiper": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a chiper name to use when spooling to disk to write with encryption. By default the data is not encrypted.",
          "title": "Spool Chiper",
          "required": false,
          "deprecated": false
        },
        "spoolThreshold": {
          "kind": "attribute",
          "type": "string",
          "description": "Threshold in bytes when overflow to disk is activated. The default threshold is link org.apache.camel.StreamCacheDEFAULT_SPOOL_THRESHOLD bytes (eg 128kb). Use -1 to disable overflow to disk.",
          "title": "Spool Threshold",
          "required": false,
          "deprecated": false
        },
        "spoolUsedHeapMemoryThreshold": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a percentage (1-99) of used heap memory threshold to activate spooling to disk.",
          "title": "Spool Used Heap Memory Threshold",
          "required": false,
          "deprecated": false
        },
        "spoolUsedHeapMemoryLimit": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets what the upper bounds should be when spoolUsedHeapMemoryThreshold is in use.",
          "title": "Spool Used Heap Memory Limit",
          "required": false,
          "deprecated": false
        },
        "spoolRules": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to one or more custom org.apache.camel.spi.StreamCachingStrategy.SpoolRule to use. Multiple rules can be separated by comma.",
          "title": "Spool Rules",
          "required": false,
          "deprecated": false
        },
        "bufferSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the buffer size to use when allocating in-memory buffers used for in-memory stream caches. The default size is link org.apache.camel.util.IOHelperDEFAULT_BUFFER_SIZE",
          "title": "Buffer Size",
          "required": false,
          "deprecated": false
        },
        "removeSpoolDirectoryWhenStopping": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "true",
          "description": "Whether to remove the temporary directory when stopping. This option is default true",
          "title": "Remove Spool Directory When Stopping",
          "required": false,
          "deprecated": false
        },
        "statisticsEnabled": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether statistics is enabled.",
          "title": "Statistics Enabled",
          "required": false,
          "deprecated": false
        },
        "anySpoolRules": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "false",
          "description": "Sets whether if just any of the org.apache.camel.spi.StreamCachingStrategy.SpoolRule rules returns true then shouldSpoolCache(long) returns true. If this option is false then all the org.apache.camel.spi.StreamCachingStrategy.SpoolRule must return true. The default value is false which means that all the rules must return true.",
          "title": "Any Spool Rules",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "template": {
      "type": "object",
      "title": "Template",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Configures a ProducerTemplate",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "defaultEndpoint": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the default endpoint URI used by default for sending message exchanges",
          "title": "Default Endpoint",
          "required": false,
          "deprecated": false
        },
        "maximumCacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets a custom maximum cache size to use in the backing cache pools.",
          "title": "Maximum Cache Size",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "Id of CamelContext to use if there are multiple CamelContexts in the same JVM",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "threadPool": {
      "type": "object",
      "title": "Thread Pool",
      "group": "spring,configuration",
      "icon": "generic24.png",
      "description": "Configuration of thread pools",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "poolSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the core pool size (threads to keep minimum in pool)",
          "title": "Pool Size",
          "required": true,
          "deprecated": false
        },
        "maxPoolSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum pool size",
          "title": "Max Pool Size",
          "required": false,
          "deprecated": false
        },
        "keepAliveTime": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the keep alive time for inactive threads",
          "title": "Keep Alive Time",
          "required": false,
          "deprecated": false
        },
        "timeUnit": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "SECONDS",
          "enum": [ "DAYS", "HOURS", "MICROSECONDS", "MILLISECONDS", "MINUTES", "NANOSECONDS", "SECONDS" ],
          "description": "Sets the time unit used for keep alive time",
          "title": "Time Unit",
          "required": false,
          "deprecated": false
        },
        "maxQueueSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum number of tasks in the work queue. Use -1 for an unbounded queue",
          "title": "Max Queue Size",
          "required": false,
          "deprecated": false
        },
        "allowCoreThreadTimeOut": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets whether to allow core threads to timeout",
          "title": "Allow Core Thread Time Out",
          "required": false,
          "deprecated": false
        },
        "rejectedPolicy": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "CallerRuns",
          "enum": [ "Abort", "CallerRuns", "Discard", "DiscardOldest" ],
          "description": "Sets the handler for tasks which cannot be executed by the thread pool.",
          "title": "Rejected Policy",
          "required": false,
          "deprecated": false
        },
        "threadName": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom thread name / pattern",
          "title": "Thread Name",
          "required": true,
          "deprecated": false
        },
        "scheduled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to use a scheduled thread pool",
          "title": "Scheduled",
          "required": false,
          "deprecated": false
        },
        "camelContextId": {
          "kind": "attribute",
          "type": "string",
          "description": "Id of CamelContext to use if there are multiple CamelContexts in the same JVM",
          "title": "Camel Context Id",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "threadPoolProfile": {
      "type": "object",
      "title": "Thread Pool Profile",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "To configure thread pools",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "defaultProfile": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether this profile is the default thread pool profile",
          "title": "Default Profile",
          "required": false,
          "deprecated": false
        },
        "poolSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the core pool size",
          "title": "Pool Size",
          "required": false,
          "deprecated": false
        },
        "maxPoolSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum pool size",
          "title": "Max Pool Size",
          "required": false,
          "deprecated": false
        },
        "keepAliveTime": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the keep alive time for idle threads in the pool",
          "title": "Keep Alive Time",
          "required": false,
          "deprecated": false
        },
        "timeUnit": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "DAYS", "HOURS", "MICROSECONDS", "MILLISECONDS", "MINUTES", "NANOSECONDS", "SECONDS" ],
          "description": "Sets the time unit to use for keep alive time By default SECONDS is used.",
          "title": "Time Unit",
          "required": false,
          "deprecated": false
        },
        "maxQueueSize": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the maximum number of tasks in the work queue. Use -1 or Integer.MAX_VALUE for an unbounded queue",
          "title": "Max Queue Size",
          "required": false,
          "deprecated": false
        },
        "allowCoreThreadTimeOut": {
          "kind": "attribute",
          "type": "string",
          "description": "Whether idle core threads is allowed to timeout and therefore can shrink the pool size below the core pool size Is by default false",
          "title": "Allow Core Thread Time Out",
          "required": false,
          "deprecated": false
        },
        "rejectedPolicy": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "Abort", "CallerRuns", "Discard", "DiscardOldest" ],
          "description": "Sets the handler for tasks which cannot be executed by the thread pool.",
          "title": "Rejected Policy",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "threads": {
      "type": "object",
      "title": "Threads",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Specifies that all steps after this node are processed asynchronously",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "To refer to a custom thread pool or use a thread pool profile (as overlay)",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "poolSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the core pool size",
          "title": "Pool Size",
          "required": false,
          "deprecated": false
        },
        "maxPoolSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum pool size",
          "title": "Max Pool Size",
          "required": false,
          "deprecated": false
        },
        "keepAliveTime": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the keep alive time for idle threads",
          "title": "Keep Alive Time",
          "required": false,
          "deprecated": false
        },
        "timeUnit": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "DAYS", "HOURS", "MICROSECONDS", "MILLISECONDS", "MINUTES", "NANOSECONDS", "SECONDS" ],
          "description": "Sets the keep alive time unit. By default SECONDS is used.",
          "title": "Time Unit",
          "required": false,
          "deprecated": false
        },
        "maxQueueSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum number of tasks in the work queue. Use -1 or Integer.MAX_VALUE for an unbounded queue",
          "title": "Max Queue Size",
          "required": false,
          "deprecated": false
        },
        "allowCoreThreadTimeOut": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether idle core threads is allowed to timeout and therefore can shrink the pool size below the core pool size Is by default false",
          "title": "Allow Core Thread Time Out",
          "required": false,
          "deprecated": false
        },
        "threadName": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "Threads",
          "description": "Sets the thread name to use.",
          "title": "Thread Name",
          "required": false,
          "deprecated": false
        },
        "rejectedPolicy": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "Abort", "CallerRuns", "Discard", "DiscardOldest" ],
          "description": "Sets the handler for tasks which cannot be executed by the thread pool.",
          "title": "Rejected Policy",
          "required": false,
          "deprecated": false
        },
        "callerRunsWhenRejected": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not to use as caller runs as fallback when a task is rejected being added to the thread pool (when its full). This is only used as fallback if no rejectedPolicy has been configured or the thread pool has no configured rejection handler. Is by default true",
          "title": "Caller Runs When Rejected",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "throttle": {
      "type": "object",
      "title": "Throttle",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Controls the rate at which messages are passed to the next node in the route",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to configure the maximum number of messages to throttle per request",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom thread pool (ScheduledExecutorService) by the throttler.",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "timePeriodMillis": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "1000",
          "description": "Sets the time period during which the maximum request count is valid for",
          "title": "Time Period Millis",
          "required": false,
          "deprecated": false
        },
        "asyncDelayed": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enables asynchronous delay which means the thread will not block while delaying.",
          "title": "Async Delayed",
          "required": false,
          "deprecated": false
        },
        "callerRunsWhenRejected": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the caller should run the task when it was rejected by the thread pool. Is by default true",
          "title": "Caller Runs When Rejected",
          "required": false,
          "deprecated": false
        },
        "rejectExecution": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not throttler throws the ThrottlerRejectedExecutionException when the exchange exceeds the request limit Is by default false",
          "title": "Reject Execution",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "throwException": {
      "type": "object",
      "title": "Throw Exception",
      "group": "error",
      "icon": "generic24.png",
      "description": "Throws an exception",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the exception instance to lookup from the registry to throw",
          "title": "Ref",
          "required": false,
          "deprecated": false
        },
        "message": {
          "kind": "attribute",
          "type": "string",
          "description": "To create a new exception instance and use the given message as caused message (supports simple language)",
          "title": "Message",
          "required": false,
          "deprecated": false
        },
        "exceptionType": {
          "kind": "attribute",
          "type": "string",
          "description": "The class of the exception to create using the message.",
          "title": "Exception Type",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "to": {
      "type": "object",
      "title": "To",
      "group": "eip,endpoint,routing",
      "icon": "endpoint24.png",
      "description": "Sends the message to a static endpoint",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the uri of the endpoint to send to.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the reference of the endpoint to send to.",
          "title": "Ref",
          "required": false,
          "deprecated": true
        },
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the optional ExchangePattern used to invoke this endpoint",
          "title": "Pattern",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "toD": {
      "type": "object",
      "title": "To D",
      "group": "eip,endpoint,routing",
      "icon": "endpoint24.png",
      "description": "Sends the message to a dynamic endpoint",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "The uri of the endpoint to send to. The uri can be dynamic computed using the org.apache.camel.language.simple.SimpleLanguage expression.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the optional ExchangePattern used to invoke this endpoint",
          "title": "Pattern",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ConsumerCache which is used to cache and reuse producers.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoint",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "topic": {
      "type": "object",
      "title": "Topic",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Topic load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "transacted": {
      "type": "object",
      "title": "Transacted",
      "group": "configuration",
      "icon": "transactionalClient24.png",
      "description": "Enables transaction on the route",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a reference to use for lookup the policy in the registry.",
          "title": "Ref",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "transform": {
      "type": "object",
      "title": "Transform",
      "group": "eip,transformation",
      "icon": "transform24.png",
      "description": "Transforms the message body based on an expression",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to return the transformed message body (the new message body to use)",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "transformers": {
      "type": "object",
      "title": "Transformations",
      "group": "transformation",
      "icon": "generic24.png",
      "description": "To configure transformers.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "transformers": {
          "kind": "element",
          "type": "array",
          "description": "The configured transformers",
          "title": "Transformers",
          "required": true,
          "deprecated": false
        }
      }
    },
    "unmarshal": {
      "type": "object",
      "title": "Unmarshal",
      "group": "eip,transformation",
      "icon": "unmarshal24.png",
      "description": "Converts the message data received from the wire into a format that Apache Camel processors can consume",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "dataFormatType": {
          "kind": "element",
          "type": "object",
          "description": "The data format to be used",
          "title": "Data Format Type",
          "required": true,
          "deprecated": false
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "To refer to a custom data format to use as unmarshaller",
          "title": "Ref",
          "required": false,
          "deprecated": true
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "validate": {
      "type": "object",
      "title": "Validate",
      "group": "eip,transformation",
      "icon": "generic24.png",
      "description": "Validates a message based on an expression",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression to use for validation as a predicate. The expression should return either true or false. If returning false the message is invalid and an exception is thrown.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "validators": {
      "type": "object",
      "title": "Validations",
      "group": "validation",
      "icon": "generic24.png",
      "description": "To configure validators.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "validators": {
          "kind": "element",
          "type": "array",
          "description": "The configured transformers",
          "title": "Validators",
          "required": true,
          "deprecated": false
        }
      }
    },
    "weighted": {
      "type": "object",
      "title": "Weighted",
      "group": "eip,routing,loadbalance",
      "icon": "generic24.png",
      "description": "Weighted load balancer",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "roundRobin": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To enable round robin mode. By default the weighted distribution mode is used. The default value is false.",
          "title": "Round Robin",
          "required": false,
          "deprecated": false
        },
        "distributionRatio": {
          "kind": "attribute",
          "type": "string",
          "description": "The distribution ratio is a delimited String consisting on integer weights separated by delimiters for example 235. The distributionRatio must match the number of endpoints and/or processors specified in the load balancer list.",
          "title": "Distribution Ratio",
          "required": true,
          "deprecated": false
        },
        "distributionRatioDelimiter": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": ",",
          "description": "Delimiter used to specify the distribution ratio. The default value is",
          "title": "Distribution Ratio Delimiter",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "when": {
      "type": "object",
      "title": "When",
      "group": "eip,routing",
      "icon": "generic24.png",
      "description": "Triggers a route when an expression evaluates to true",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression used as the predicate to evaluate whether this when should trigger and route the message or not.",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "whenSkipSendToEndpoint": {
      "type": "object",
      "title": "When Skip Send To Endpoint",
      "group": "configuration",
      "icon": "generic24.png",
      "description": "Predicate to determine if the message should be sent or not to the endpoint when using interceptSentToEndpoint.",
      "acceptInput": "true",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "expression": {
          "kind": "expression",
          "type": "object",
          "description": "Expression used as the predicate to evaluate whether the message should be sent or not to the endpoint",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "wireTap": {
      "type": "object",
      "title": "Wire Tap",
      "group": "eip,endpoint,routing",
      "icon": "wireTap24.png",
      "description": "Routes a copy of a message (or creates a new message) to a secondary destination while continue routing the original message.",
      "acceptInput": "true",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "true",
      "properties": {
        "processorRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to a Processor to use for creating a new body as the message to use for wire tapping",
          "title": "Processor Ref",
          "required": false,
          "deprecated": false
        },
        "body": {
          "kind": "expression",
          "type": "object",
          "description": "Uses the expression for creating a new body as the message to use for wire tapping",
          "title": "Body",
          "required": false,
          "deprecated": false
        },
        "executorServiceRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Uses a custom thread pool",
          "title": "Executor Service Ref",
          "required": false,
          "deprecated": false
        },
        "copy": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Uses a copy of the original exchange",
          "title": "Copy",
          "required": false,
          "deprecated": false
        },
        "dynamicUri": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether the uri is dynamic or static. If the uri is dynamic then the simple language is used to evaluate a dynamic uri to use as the wire-tap destination for each incoming message. This works similar to how the toD EIP pattern works. If static then the uri is used as-is as the wire-tap destination.",
          "title": "Dynamic Uri",
          "required": false,
          "deprecated": false
        },
        "onPrepareRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Uses the Processor when preparing the org.apache.camel.Exchange to be send. This can be used to deep-clone messages that should be send or any custom logic needed before the exchange is send.",
          "title": "On Prepare Ref",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "The uri of the endpoint to send to. The uri can be dynamic computed using the org.apache.camel.language.simple.SimpleLanguage expression.",
          "title": "Uri",
          "required": true,
          "deprecated": false
        },
        "pattern": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "InOnly", "InOptionalOut", "InOut", "OutIn", "OutOnly", "OutOptionalIn", "RobustInOnly", "RobustOutOnly" ],
          "description": "Sets the optional ExchangePattern used to invoke this endpoint",
          "title": "Pattern",
          "required": false,
          "deprecated": false
        },
        "cacheSize": {
          "kind": "attribute",
          "type": "integer",
          "description": "Sets the maximum size used by the org.apache.camel.impl.ConsumerCache which is used to cache and reuse producers.",
          "title": "Cache Size",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidEndpoint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Ignore the invalidate endpoint exception when try to create a producer with that endpoint",
          "title": "Ignore Invalid Endpoint",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "zookeeperServiceDiscovery": {
      "type": "object",
      "title": "Zookeeper Service Discovery",
      "group": "routing,cloud,service-discovery",
      "icon": "generic24.png",
      "description": "",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "nodes": {
          "kind": "attribute",
          "type": "string",
          "description": "A comma separate list of servers to connect to in the form host:port",
          "title": "Nodes",
          "required": true,
          "deprecated": false
        },
        "namespace": {
          "kind": "attribute",
          "type": "string",
          "description": "As ZooKeeper is a shared space users of a given cluster should stay within a pre-defined namespace. If a namespace is set here all paths will get pre-pended with the namespace",
          "title": "Namespace",
          "required": false,
          "deprecated": false
        },
        "reconnectBaseSleepTime": {
          "kind": "attribute",
          "type": "string",
          "description": "Initial amount of time to wait between retries.",
          "title": "Reconnect Base Sleep Time",
          "required": false,
          "deprecated": false
        },
        "reconnectMaxSleepTime": {
          "kind": "attribute",
          "type": "string",
          "description": "Max time in ms to sleep on each retry",
          "title": "Reconnect Max Sleep Time",
          "required": false,
          "deprecated": false
        },
        "reconnectMaxRetries": {
          "kind": "attribute",
          "type": "integer",
          "description": "Max number of times to retry",
          "title": "Reconnect Max Retries",
          "required": false,
          "deprecated": false
        },
        "sessionTimeout": {
          "kind": "attribute",
          "type": "string",
          "description": "Session timeout.",
          "title": "Session Timeout",
          "required": false,
          "deprecated": false
        },
        "connectionTimeout": {
          "kind": "attribute",
          "type": "string",
          "description": "Connection timeout.",
          "title": "Connection Timeout",
          "required": false,
          "deprecated": false
        },
        "basePath": {
          "kind": "attribute",
          "type": "string",
          "description": "Set the base path to store in ZK",
          "title": "Base Path",
          "required": true,
          "deprecated": false
        },
        "properties": {
          "kind": "element",
          "type": "array",
          "description": "Set client properties to use. These properties are specific to what service call implementation are in use. For example if using ribbon then the client properties are define in com.netflix.client.config.CommonClientConfigKey.",
          "title": "Properties",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    }
  },
  "rests": {
    "delete": {
      "type": "object",
      "title": "Delete",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest DELETE command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "get": {
      "type": "object",
      "title": "Get",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest GET command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "head": {
      "type": "object",
      "title": "Head",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest HEAD command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "options": {
      "type": "object",
      "title": "Options",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest OPTIONS command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "param": {
      "type": "object",
      "title": "Param",
      "group": "rest",
      "icon": "generic24.png",
      "description": "To specify the rest operation parameters using Swagger.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "name": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Swagger Parameter name.",
          "title": "Name",
          "required": true,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "path",
          "enum": [ "body", "formData", "header", "path", "query" ],
          "description": "Sets the Swagger Parameter type.",
          "title": "Type",
          "required": true,
          "deprecated": false
        },
        "defaultValue": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Swagger Parameter default value.",
          "title": "Default Value",
          "required": false,
          "deprecated": false
        },
        "required": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Sets the Swagger Parameter required flag.",
          "title": "Required",
          "required": false,
          "deprecated": false
        },
        "collectionFormat": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "csv",
          "enum": [ "csv", "multi", "pipes", "ssv", "tsv" ],
          "description": "Sets the Swagger Parameter collection format.",
          "title": "Collection Format",
          "required": false,
          "deprecated": false
        },
        "arrayType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "string",
          "description": "Sets the Swagger Parameter array type. Required if data type is array. Describes the type of items in the array.",
          "title": "Array Type",
          "required": false,
          "deprecated": false
        },
        "dataType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "string",
          "description": "Sets the Swagger Parameter data type.",
          "title": "Data Type",
          "required": false,
          "deprecated": false
        },
        "value": {
          "kind": "element",
          "type": "array",
          "description": "Sets the Swagger Parameter list of allowable values (enum).",
          "title": "Value",
          "required": false,
          "deprecated": false
        },
        "access": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Swagger Parameter paramAccess flag.",
          "title": "Access",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the Swagger Parameter description.",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "patch": {
      "type": "object",
      "title": "Patch",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest PATCH command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "post": {
      "type": "object",
      "title": "Post",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest POST command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "put": {
      "type": "object",
      "title": "Put",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest PUT command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "responseHeader": {
      "type": "object",
      "title": "Response Header",
      "group": "rest",
      "icon": "generic24.png",
      "description": "To specify the rest operation response headers using Swagger.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "name": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of the parameter. This option is mandatory.",
          "title": "Name",
          "required": true,
          "deprecated": false
        },
        "collectionFormat": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "csv",
          "enum": [ "csv", "multi", "pipes", "ssv", "tsv" ],
          "description": "Sets the Swagger Parameter collection format.",
          "title": "Collection Format",
          "required": false,
          "deprecated": false
        },
        "arrayType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "string",
          "description": "Sets the Swagger Parameter array type. Required if data type is array. Describes the type of items in the array.",
          "title": "Array Type",
          "required": false,
          "deprecated": false
        },
        "dataType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "string",
          "description": "Sets the Swagger header data type.",
          "title": "Data Type",
          "required": false,
          "deprecated": false
        },
        "value": {
          "kind": "element",
          "type": "array",
          "description": "Sets the Swagger Parameter list of allowable values.",
          "title": "Value",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "attribute",
          "type": "string",
          "description": "Description of the parameter.",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "responseMessage": {
      "type": "object",
      "title": "Response Message",
      "group": "rest",
      "icon": "generic24.png",
      "description": "To specify the rest operation response messages using Swagger.",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "code": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "200",
          "description": "The response code such as a HTTP status code.",
          "title": "Code",
          "required": false,
          "deprecated": false
        },
        "message": {
          "kind": "attribute",
          "type": "string",
          "description": "The response message (description)",
          "title": "Message",
          "required": true,
          "deprecated": false
        },
        "responseModel": {
          "kind": "attribute",
          "type": "string",
          "description": "The response model",
          "title": "Response Model",
          "required": false,
          "deprecated": false
        },
        "header": {
          "kind": "element",
          "type": "array",
          "description": "Adds a response header",
          "title": "Header",
          "required": false,
          "deprecated": false
        }
      }
    },
    "rest": {
      "type": "object",
      "title": "Rest",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Defines a rest service using the rest-dsl",
      "acceptInput": "false",
      "acceptOutput": "true",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "path": {
          "kind": "attribute",
          "type": "string",
          "description": "Path of the rest service such as /foo",
          "title": "Path",
          "required": false,
          "deprecated": false
        },
        "tag": {
          "kind": "attribute",
          "type": "string",
          "description": "To configure a special tag for the operations within this rest definition.",
          "title": "Tag",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. This option will override what may be configured on a parent level The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "verbs": {
          "kind": "element",
          "type": "array",
          "description": "The HTTP verbs this REST service accepts and uses",
          "title": "Verbs",
          "required": true,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "restBinding": {
      "type": "object",
      "title": "Rest Binding",
      "group": "rest",
      "icon": "generic24.png",
      "description": "To configure rest binding",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "off",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. The default value is off",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do.",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "component": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the component name that this definition will apply to",
          "title": "Component",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "restConfiguration": {
      "type": "object",
      "title": "Rest Configuration",
      "group": "rest",
      "icon": "generic24.png",
      "description": "To configure rest",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "component": {
          "kind": "attribute",
          "type": "string",
          "description": "The Camel Rest component to use for the REST transport (consumer) such as restlet spark-rest. If no component has been explicit configured then Camel will lookup if there is a Camel component that integrates with the Rest DSL or if a org.apache.camel.spi.RestConsumerFactory is registered in the registry. If either one is found then that is being used.",
          "title": "Component",
          "required": false,
          "deprecated": false
        },
        "apiComponent": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "swagger",
          "description": "The name of the Camel component to use as the REST API (such as swagger)",
          "title": "Api Component",
          "required": false,
          "deprecated": false
        },
        "producerComponent": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the name of the Camel component to use as the REST producer",
          "title": "Producer Component",
          "required": false,
          "deprecated": false
        },
        "scheme": {
          "kind": "attribute",
          "type": "string",
          "description": "The scheme to use for exposing the REST service. Usually http or https is supported. The default value is http",
          "title": "Scheme",
          "required": false,
          "deprecated": false
        },
        "host": {
          "kind": "attribute",
          "type": "string",
          "description": "The hostname to use for exposing the REST service.",
          "title": "Host",
          "required": false,
          "deprecated": false
        },
        "apiHost": {
          "kind": "attribute",
          "type": "string",
          "description": "To use an specific hostname for the API documentation (eg swagger) This can be used to override the generated host with this configured hostname",
          "title": "Api Host",
          "required": false,
          "deprecated": false
        },
        "port": {
          "kind": "attribute",
          "type": "string",
          "description": "The port number to use for exposing the REST service. Notice if you use servlet component then the port number configured here does not apply as the port number in use is the actual port number the servlet component is using. eg if using Apache Tomcat its the tomcat http port if using Apache Karaf its the HTTP service in Karaf that uses port 8181 by default etc. Though in those situations setting the port number here allows tooling and JMX to know the port number so its recommended to set the port number to the number that the servlet engine uses.",
          "title": "Port",
          "required": false,
          "deprecated": false
        },
        "producerApiDoc": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the location of the api document (swagger api) the REST producer will use to validate the REST uri and query parameters are valid accordingly to the api document. This requires adding camel-swagger-java to the classpath and any miss configuration will let Camel fail on startup and report the error(s). The location of the api document is loaded from classpath by default but you can use file: or http: to refer to resources to load from file or http url.",
          "title": "Producer Api Doc",
          "required": false,
          "deprecated": false
        },
        "contextPath": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a leading context-path the REST services will be using. This can be used when using components such as camel-servlet where the deployed web application is deployed using a context-path. Or for components such as camel-jetty or camel-netty4-http that includes a HTTP server.",
          "title": "Context Path",
          "required": false,
          "deprecated": false
        },
        "apiContextPath": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets a leading API context-path the REST API services will be using. This can be used when using components such as camel-servlet where the deployed web application is deployed using a context-path.",
          "title": "Api Context Path",
          "required": false,
          "deprecated": false
        },
        "apiContextRouteId": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the route id to use for the route that services the REST API. The route will by default use an auto assigned route id.",
          "title": "Api Context Route Id",
          "required": false,
          "deprecated": false
        },
        "apiContextIdPattern": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets an CamelContext id pattern to only allow Rest APIs from rest services within CamelContext's which name matches the pattern. The pattern name refers to the CamelContext name to match on the current CamelContext only. For any other value the pattern uses the rules from link org.apache.camel.util.EndpointHelpermatchPattern(String String)",
          "title": "Api Context Id Pattern",
          "required": false,
          "deprecated": false
        },
        "apiContextListing": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether listing of all available CamelContext's with REST services in the JVM is enabled. If enabled it allows to discover these contexts if false then only the current CamelContext is in use.",
          "title": "Api Context Listing",
          "required": false,
          "deprecated": false
        },
        "hostNameResolver": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "allLocalIp", "localHostName", "localIp" ],
          "description": "If no hostname has been explicit configured then this resolver is used to compute the hostname the REST service will be using.",
          "title": "Host Name Resolver",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "off",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. The default value is off",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do.",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "jsonDataFormat": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of specific json data format to use. By default json-jackson will be used. Important: This option is only for setting a custom name of the data format not to refer to an existing data format instance.",
          "title": "Json Data Format",
          "required": false,
          "deprecated": false
        },
        "xmlDataFormat": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of specific XML data format to use. By default jaxb will be used. Important: This option is only for setting a custom name of the data format not to refer to an existing data format instance.",
          "title": "Xml Data Format",
          "required": false,
          "deprecated": false
        },
        "componentProperty": {
          "kind": "element",
          "type": "array",
          "description": "Allows to configure as many additional properties for the rest component in use.",
          "title": "Component Property",
          "required": false,
          "deprecated": false
        },
        "endpointProperty": {
          "kind": "element",
          "type": "array",
          "description": "Allows to configure as many additional properties for the rest endpoint in use.",
          "title": "Endpoint Property",
          "required": false,
          "deprecated": false
        },
        "consumerProperty": {
          "kind": "element",
          "type": "array",
          "description": "Allows to configure as many additional properties for the rest consumer in use.",
          "title": "Consumer Property",
          "required": false,
          "deprecated": false
        },
        "dataFormatProperty": {
          "kind": "element",
          "type": "array",
          "description": "Allows to configure as many additional properties for the data formats in use. For example set property prettyPrint to true to have json outputted in pretty mode. The properties can be prefixed to denote the option is only for either JSON or XML and for either the IN or the OUT. The prefixes are: json.in. json.out. xml.in. xml.out. For example a key with value xml.out.mustBeJAXBElement is only for the XML data format for the outgoing. A key without a prefix is a common key for all situations.",
          "title": "Data Format Property",
          "required": false,
          "deprecated": false
        },
        "apiProperty": {
          "kind": "element",
          "type": "array",
          "description": "Allows to configure as many additional properties for the api documentation (swagger). For example set property api.title to my cool stuff",
          "title": "Api Property",
          "required": false,
          "deprecated": false
        },
        "corsHeaders": {
          "kind": "element",
          "type": "array",
          "description": "Allows to configure custom CORS headers.",
          "title": "Cors Headers",
          "required": false,
          "deprecated": false
        }
      }
    },
    "restContext": {
      "type": "object",
      "title": "Rest Context",
      "group": "spring,configuration,rest",
      "icon": "generic24.png",
      "description": "Configuration of REST services using rest-dsl using XML",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "rest": {
          "kind": "element",
          "type": "array",
          "description": "Contains the rest services defined using the rest-dsl",
          "title": "Rest",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "restContextRef": {
      "type": "object",
      "title": "Rest Context Ref",
      "group": "configuration,rest",
      "icon": "generic24.png",
      "description": "To refer to an XML file with rest services defined using the rest-dsl",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the rest-dsl",
          "title": "Ref",
          "required": true,
          "deprecated": false
        }
      }
    },
    "restProperty": {
      "type": "object",
      "title": "Rest Property",
      "group": "rest",
      "icon": "generic24.png",
      "description": "A key value pair",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "key": {
          "kind": "attribute",
          "type": "string",
          "description": "Property key",
          "title": "Key",
          "required": true,
          "deprecated": false
        },
        "value": {
          "kind": "attribute",
          "type": "string",
          "description": "Property value",
          "title": "Value",
          "required": true,
          "deprecated": false
        }
      }
    },
    "rests": {
      "type": "object",
      "title": "Rests",
      "group": "rest",
      "icon": "generic24.png",
      "description": "A series of rest services defined using the rest-dsl",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "rests": {
          "kind": "element",
          "type": "array",
          "description": "Contains the rest services defined using the rest-dsl",
          "title": "Rests",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    },
    "verb": {
      "type": "object",
      "title": "Verb",
      "group": "rest",
      "icon": "generic24.png",
      "description": "Rest command",
      "acceptInput": "false",
      "acceptOutput": "false",
      "nextSiblingAddedAsChild": "false",
      "properties": {
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "The HTTP verb such as GET POST DELETE etc.",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "uri": {
          "kind": "attribute",
          "type": "string",
          "description": "Uri template of this REST service such as /id.",
          "title": "Uri",
          "required": false,
          "deprecated": false
        },
        "consumes": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service consumes (accept as input) such as application/xml or application/json. This option will override what may be configured on a parent level",
          "title": "Consumes",
          "required": false,
          "deprecated": false
        },
        "produces": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the content type what the REST service produces (uses for output) such as application/xml or application/json This option will override what may be configured on a parent level",
          "title": "Produces",
          "required": false,
          "deprecated": false
        },
        "bindingMode": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "auto",
          "enum": [ "auto", "json", "json_xml", "off", "xml" ],
          "description": "Sets the binding mode to use. This option will override what may be configured on a parent level The default value is auto",
          "title": "Binding Mode",
          "required": false,
          "deprecated": false
        },
        "skipBindingOnErrorCode": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip binding on output if there is a custom HTTP error code header. This allows to build custom error messages that do not bind to json / xml etc as success messages otherwise will do. This option will override what may be configured on a parent level",
          "title": "Skip Binding On Error Code",
          "required": false,
          "deprecated": false
        },
        "enableCORS": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable CORS headers in the HTTP response. This option will override what may be configured on a parent level The default value is false.",
          "title": "Enable C O R S",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from input to POJO for the incoming data This option will override what may be configured on a parent level. The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "outType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name to use for binding from POJO to output for the outgoing data This option will override what may be configured on a parent level The canonical name of the class of the input data. Append a to the end of the canonical name if you want the input to be an array type.",
          "title": "Out Type",
          "required": false,
          "deprecated": false
        },
        "toOrRoute": {
          "kind": "element",
          "type": "object",
          "description": "To route from this REST service to a Camel endpoint or an inlined route",
          "title": "To Or Route",
          "required": true,
          "deprecated": false
        },
        "routeId": {
          "kind": "attribute",
          "type": "string",
          "description": "The route id this rest-dsl is using (read-only)",
          "title": "Route Id",
          "required": false,
          "deprecated": false
        },
        "apiDocs": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include or exclude the VerbDefinition in API documentation. The default value is true.",
          "title": "Api Docs",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        },
        "description": {
          "kind": "element",
          "type": "object",
          "description": "Sets the description of this node",
          "title": "Description",
          "required": false,
          "deprecated": false
        }
      }
    }
  },
  "dataformats": {
    "asn1": {
      "type": "object",
      "title": "ASN.1 File",
      "group": "dataformat,transformation,file",
      "icon": "generic24.png",
      "description": "The ASN.1 data format is used for file transfer with telecommunications protocols.",
      "properties": {
        "usingIterator": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the asn1 file has more then one entry the setting this option to true allows to work with the splitter EIP to split the data using an iterator in a streaming mode.",
          "title": "Using Iterator",
          "required": false,
          "deprecated": false
        },
        "clazzName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of class to use when unmarshalling",
          "title": "Clazz Name",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "avro": {
      "type": "object",
      "title": "Avro",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The Avro data format is used for serialization and deserialization of messages using Apache Avro binary dataformat.",
      "properties": {
        "instanceClassName": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name to use for marshal and unmarshalling",
          "title": "Instance Class Name",
          "required": true,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "barcode": {
      "type": "object",
      "title": "Barcode",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The Barcode data format is used for creating barccode images (such as QR-Code)",
      "properties": {
        "width": {
          "kind": "attribute",
          "type": "integer",
          "description": "Width of the barcode",
          "title": "Width",
          "required": false,
          "deprecated": false
        },
        "height": {
          "kind": "attribute",
          "type": "integer",
          "description": "Height of the barcode",
          "title": "Height",
          "required": false,
          "deprecated": false
        },
        "imageType": {
          "kind": "attribute",
          "type": "string",
          "description": "Image type of the barcode such as png",
          "title": "Image Type",
          "required": false,
          "deprecated": false
        },
        "barcodeFormat": {
          "kind": "attribute",
          "type": "string",
          "description": "Barcode format such as QR-Code",
          "title": "Barcode Format",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "base64": {
      "type": "object",
      "title": "Base64",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The Base64 data format is used for base64 encoding and decoding.",
      "properties": {
        "lineLength": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "76",
          "description": "To specific a maximum line length for the encoded data. By default 76 is used.",
          "title": "Line Length",
          "required": false,
          "deprecated": false
        },
        "lineSeparator": {
          "kind": "attribute",
          "type": "string",
          "description": "The line separators to use. Uses new line characters (CRLF) by default.",
          "title": "Line Separator",
          "required": false,
          "deprecated": false
        },
        "urlSafe": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Instead of emitting '' and '/' we emit '-' and '_' respectively. urlSafe is only applied to encode operations. Decoding seamlessly handles both modes. Is by default false.",
          "title": "Url Safe",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "beanio": {
      "type": "object",
      "title": "BeanIO",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The BeanIO data format is used for working with flat payloads (such as CSV delimited or fixed length formats).",
      "properties": {
        "mapping": {
          "kind": "attribute",
          "type": "string",
          "description": "The BeanIO mapping file. Is by default loaded from the classpath. You can prefix with file: http: or classpath: to denote from where to load the mapping file.",
          "title": "Mapping",
          "required": true,
          "deprecated": false
        },
        "streamName": {
          "kind": "attribute",
          "type": "string",
          "description": "The name of the stream to use.",
          "title": "Stream Name",
          "required": true,
          "deprecated": false
        },
        "ignoreUnidentifiedRecords": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore unidentified records.",
          "title": "Ignore Unidentified Records",
          "required": false,
          "deprecated": false
        },
        "ignoreUnexpectedRecords": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore unexpected records.",
          "title": "Ignore Unexpected Records",
          "required": false,
          "deprecated": false
        },
        "ignoreInvalidRecords": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore invalid records.",
          "title": "Ignore Invalid Records",
          "required": false,
          "deprecated": false
        },
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "description": "The charset to use. Is by default the JVM platform default charset.",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "beanReaderErrorHandlerType": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom org.apache.camel.dataformat.beanio.BeanIOErrorHandler as error handler while parsing. Configure the fully qualified class name of the error handler. Notice the options ignoreUnidentifiedRecords ignoreUnexpectedRecords and ignoreInvalidRecords may not be in use when you use a custom error handler.",
          "title": "Bean Reader Error Handler Type",
          "required": false,
          "deprecated": false
        },
        "unmarshalSingleObject": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "This options controls whether to unmarshal as a list of objects or as a single object only. The former is the default mode and the latter is only intended in special use-cases where beanio maps the Camel message to a single POJO bean.",
          "title": "Unmarshal Single Object",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "bindy": {
      "type": "object",
      "title": "Bindy",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The Bindy data format is used for working with flat payloads (such as CSV delimited fixed length formats or FIX messages).",
      "properties": {
        "type": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "Csv", "Fixed", "KeyValue" ],
          "description": "Whether to use csv fixed or key value pairs mode.",
          "title": "Type",
          "required": true,
          "deprecated": false
        },
        "classType": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of model class to use.",
          "title": "Class Type",
          "required": false,
          "deprecated": false
        },
        "locale": {
          "kind": "attribute",
          "type": "string",
          "description": "To configure a default locale to use such as us for united states. To use the JVM platform default locale then use the name default",
          "title": "Locale",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "boon": {
      "type": "object",
      "title": "Boon",
      "group": "dataformat,transformation,json",
      "icon": "generic24.png",
      "description": "Boon data format is used for unmarshal a JSon payload to POJO or to marshal POJO back to JSon payload.",
      "properties": {
        "unmarshalTypeName": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name of the java type to use when unarmshalling",
          "title": "Unmarshal Type Name",
          "required": true,
          "deprecated": false
        },
        "useList": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To unarmshal to a List of Map or a List of Pojo.",
          "title": "Use List",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "castor": {
      "type": "object",
      "title": "Castor",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "Castor data format is used for unmarshal a XML payload to POJO or to marshal POJO back to XML payload.",
      "properties": {
        "mappingFile": {
          "kind": "attribute",
          "type": "string",
          "description": "Path to a Castor mapping file to load from the classpath.",
          "title": "Mapping File",
          "required": false,
          "deprecated": false
        },
        "validation": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether validation is turned on or off. Is by default true.",
          "title": "Validation",
          "required": false,
          "deprecated": false
        },
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "UTF-8",
          "description": "Encoding to use when marshalling an Object to XML. Is by default UTF-8",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "packages": {
          "kind": "attribute",
          "type": "array",
          "description": "Add additional packages to Castor XmlContext",
          "title": "Packages",
          "required": false,
          "deprecated": false
        },
        "classes": {
          "kind": "attribute",
          "type": "array",
          "description": "Add additional class names to Castor XmlContext",
          "title": "Classes",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "crypto": {
      "type": "object",
      "title": "Crypto (Java Cryptographic Extension)",
      "group": "dataformat,transformation,security",
      "icon": "generic24.png",
      "description": "Crypto data format is used for encrypting and decrypting of messages using Java Cryptographic Extension.",
      "properties": {
        "algorithm": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "DES/CBC/PKCS5Padding",
          "description": "The JCE algorithm name indicating the cryptographic algorithm that will be used. Is by default DES/CBC/PKCS5Padding.",
          "title": "Algorithm",
          "required": false,
          "deprecated": false
        },
        "cryptoProvider": {
          "kind": "attribute",
          "type": "string",
          "description": "The name of the JCE Security Provider that should be used.",
          "title": "Crypto Provider",
          "required": false,
          "deprecated": false
        },
        "keyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to the secret key to lookup from the register to use.",
          "title": "Key Ref",
          "required": false,
          "deprecated": false
        },
        "initVectorRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a byte array containing the Initialization Vector that will be used to initialize the Cipher.",
          "title": "Init Vector Ref",
          "required": false,
          "deprecated": false
        },
        "algorithmParameterRef": {
          "kind": "attribute",
          "type": "string",
          "description": "A JCE AlgorithmParameterSpec used to initialize the Cipher. Will lookup the type using the given name as a java.security.spec.AlgorithmParameterSpec type.",
          "title": "Algorithm Parameter Ref",
          "required": false,
          "deprecated": false
        },
        "buffersize": {
          "kind": "attribute",
          "type": "integer",
          "description": "The size of the buffer used in the signature process.",
          "title": "Buffersize",
          "required": false,
          "deprecated": false
        },
        "macAlgorithm": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "HmacSHA1",
          "description": "The JCE algorithm name indicating the Message Authentication algorithm.",
          "title": "Mac Algorithm",
          "required": false,
          "deprecated": false
        },
        "shouldAppendHMAC": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Flag indicating that a Message Authentication Code should be calculated and appended to the encrypted data.",
          "title": "Should Append H M A C",
          "required": false,
          "deprecated": false
        },
        "inline": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Flag indicating that the configured IV should be inlined into the encrypted data stream. Is by default false.",
          "title": "Inline",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "csv": {
      "type": "object",
      "title": "CSV",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The CSV data format is used for handling CSV payloads.",
      "properties": {
        "formatRef": {
          "kind": "attribute",
          "type": "string",
          "description": "The reference format to use it will be updated with the other format options the default value is CSVFormat.DEFAULT",
          "title": "Format Ref",
          "required": false,
          "deprecated": false
        },
        "formatName": {
          "kind": "attribute",
          "type": "string",
          "enum": [ "DEFAULT", "EXCEL", "INFORMIX_UNLOAD", "INFORMIX_UNLOAD_CSV", "MYSQL", "RFC4180" ],
          "description": "The name of the format to use the default value is CSVFormat.DEFAULT",
          "title": "Format Name",
          "required": false,
          "deprecated": false
        },
        "commentMarkerDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Disables the comment marker of the reference format.",
          "title": "Comment Marker Disabled",
          "required": false,
          "deprecated": false
        },
        "commentMarker": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the comment marker of the reference format.",
          "title": "Comment Marker",
          "required": false,
          "deprecated": false
        },
        "delimiter": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the delimiter to use. The default value is (comma)",
          "title": "Delimiter",
          "required": false,
          "deprecated": false
        },
        "escapeDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Use for disabling using escape character",
          "title": "Escape Disabled",
          "required": false,
          "deprecated": false
        },
        "escape": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the escape character to use",
          "title": "Escape",
          "required": false,
          "deprecated": false
        },
        "headerDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Use for disabling headers",
          "title": "Header Disabled",
          "required": false,
          "deprecated": false
        },
        "header": {
          "kind": "element",
          "type": "array",
          "description": "To configure the CSV headers",
          "title": "Header",
          "required": false,
          "deprecated": false
        },
        "allowMissingColumnNames": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to allow missing column names.",
          "title": "Allow Missing Column Names",
          "required": false,
          "deprecated": false
        },
        "ignoreEmptyLines": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore empty lines.",
          "title": "Ignore Empty Lines",
          "required": false,
          "deprecated": false
        },
        "ignoreSurroundingSpaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore surrounding spaces",
          "title": "Ignore Surrounding Spaces",
          "required": false,
          "deprecated": false
        },
        "nullStringDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Used to disable null strings",
          "title": "Null String Disabled",
          "required": false,
          "deprecated": false
        },
        "nullString": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the null string",
          "title": "Null String",
          "required": false,
          "deprecated": false
        },
        "quoteDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Used to disable quotes",
          "title": "Quote Disabled",
          "required": false,
          "deprecated": false
        },
        "quote": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the quote which by default is",
          "title": "Quote",
          "required": false,
          "deprecated": false
        },
        "recordSeparatorDisabled": {
          "kind": "attribute",
          "type": "string",
          "description": "Used for disabling record separator",
          "title": "Record Separator Disabled",
          "required": false,
          "deprecated": false
        },
        "recordSeparator": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the record separator (aka new line) which by default is new line characters (CRLF)",
          "title": "Record Separator",
          "required": false,
          "deprecated": false
        },
        "skipHeaderRecord": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to skip the header record in the output",
          "title": "Skip Header Record",
          "required": false,
          "deprecated": false
        },
        "quoteMode": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the quote mode",
          "title": "Quote Mode",
          "required": false,
          "deprecated": false
        },
        "ignoreHeaderCase": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether or not to ignore case when accessing header names.",
          "title": "Ignore Header Case",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether or not to trim leading and trailing blanks.",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "trailingDelimiter": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Sets whether or not to add a trailing delimiter.",
          "title": "Trailing Delimiter",
          "required": false,
          "deprecated": false
        },
        "lazyLoad": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce an iterator that reads the lines on the fly or if all the lines must be read at one.",
          "title": "Lazy Load",
          "required": false,
          "deprecated": false
        },
        "useMaps": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce maps for the lines values instead of lists. It requires to have header (either defined or collected).",
          "title": "Use Maps",
          "required": false,
          "deprecated": false
        },
        "recordConverterRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom CsvRecordConverter to lookup from the registry to use.",
          "title": "Record Converter Ref",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "customDataFormat": {
      "type": "object",
      "title": "Custom",
      "group": "dataformat,transformation",
      "icon": "customDataFormat24.png",
      "description": "To use a custom data format implementation that does not come out of the box from Apache Camel.",
      "properties": {
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to the custom org.apache.camel.spi.DataFormat to lookup from the Camel registry.",
          "title": "Ref",
          "required": true,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "dataFormats": {
      "type": "object",
      "title": "Data formats",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "To configure data formats",
      "properties": {
        "dataFormats": {
          "kind": "element",
          "type": "array",
          "description": "A list holding the configured data formats",
          "title": "Data Formats",
          "required": true,
          "deprecated": false
        }
      }
    },
    "flatpack": {
      "type": "object",
      "title": "Flatpack",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The Flatpack data format is used for working with flat payloads (such as CSV delimited or fixed length formats).",
      "properties": {
        "definition": {
          "kind": "attribute",
          "type": "string",
          "description": "The flatpack pzmap configuration file. Can be omitted in simpler situations but its preferred to use the pzmap.",
          "title": "Definition",
          "required": false,
          "deprecated": false
        },
        "fixed": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Delimited or fixed. Is by default false = delimited",
          "title": "Fixed",
          "required": false,
          "deprecated": false
        },
        "ignoreFirstRecord": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether the first line is ignored for delimited files (for the column headers). Is by default true.",
          "title": "Ignore First Record",
          "required": false,
          "deprecated": false
        },
        "textQualifier": {
          "kind": "attribute",
          "type": "string",
          "description": "If the text is qualified with a character. Uses quote character by default.",
          "title": "Text Qualifier",
          "required": false,
          "deprecated": false
        },
        "delimiter": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": ",",
          "description": "The delimiter char (could be ; or similar)",
          "title": "Delimiter",
          "required": false,
          "deprecated": false
        },
        "allowShortLines": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Allows for lines to be shorter than expected and ignores the extra characters",
          "title": "Allow Short Lines",
          "required": false,
          "deprecated": false
        },
        "ignoreExtraColumns": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Allows for lines to be longer than expected and ignores the extra characters.",
          "title": "Ignore Extra Columns",
          "required": false,
          "deprecated": false
        },
        "parserFactoryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "References to a custom parser factory to lookup in the registry",
          "title": "Parser Factory Ref",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "gzip": {
      "type": "object",
      "title": "GZip",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The GZip data format is a message compression and de-compression format (which works with the popular gzip/gunzip tools).",
      "properties": {
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "hessian": {
      "type": "object",
      "title": "Hessian",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "Hessian data format is used for marshalling and unmarshalling messages using Cauchos Hessian format.",
      "properties": {
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "hl7": {
      "type": "object",
      "title": "HL7",
      "group": "dataformat,transformation,hl7",
      "icon": "generic24.png",
      "description": "The HL7 data format can be used to marshal or unmarshal HL7 (Health Care) model objects.",
      "properties": {
        "validate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to validate the HL7 message Is by default true.",
          "title": "Validate",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "ical": {
      "type": "object",
      "title": "iCal",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The iCal dataformat is used for working with iCalendar messages.",
      "properties": {
        "validating": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to validate.",
          "title": "Validating",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "jacksonxml": {
      "type": "object",
      "title": "JacksonXML",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "JacksonXML data format is used for unmarshal a XML payload to POJO or to marshal POJO back to XML payload.",
      "properties": {
        "xmlMapper": {
          "kind": "attribute",
          "type": "string",
          "description": "Lookup and use the existing XmlMapper with the given id.",
          "title": "Xml Mapper",
          "required": false,
          "deprecated": false
        },
        "prettyPrint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To enable pretty printing output nicely formatted. Is by default false.",
          "title": "Pretty Print",
          "required": false,
          "deprecated": false
        },
        "unmarshalTypeName": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name of the java type to use when unarmshalling",
          "title": "Unmarshal Type Name",
          "required": false,
          "deprecated": false
        },
        "jsonView": {
          "kind": "attribute",
          "type": "string",
          "description": "When marshalling a POJO to JSON you might want to exclude certain fields from the JSON output. With Jackson you can use JSON views to accomplish this. This option is to refer to the class which has JsonView annotations",
          "title": "Json View",
          "required": false,
          "deprecated": false
        },
        "include": {
          "kind": "attribute",
          "type": "string",
          "description": "If you want to marshal a pojo to JSON and the pojo has some fields with null values. And you want to skip these null values you can set this option to NOT_NULL",
          "title": "Include",
          "required": false,
          "deprecated": false
        },
        "allowJmsType": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Used for JMS users to allow the JMSType header from the JMS spec to specify a FQN classname to use to unmarshal to.",
          "title": "Allow Jms Type",
          "required": false,
          "deprecated": false
        },
        "collectionTypeName": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom collection type to lookup in the registry to use. This option should rarely be used but allows to use different collection types than java.util.Collection based as default.",
          "title": "Collection Type Name",
          "required": false,
          "deprecated": false
        },
        "useList": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To unarmshal to a List of Map or a List of Pojo.",
          "title": "Use List",
          "required": false,
          "deprecated": false
        },
        "enableJaxbAnnotationModule": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable the JAXB annotations module when using jackson. When enabled then JAXB annotations can be used by Jackson.",
          "title": "Enable Jaxb Annotation Module",
          "required": false,
          "deprecated": false
        },
        "moduleClassNames": {
          "kind": "attribute",
          "type": "string",
          "description": "To use custom Jackson modules com.fasterxml.jackson.databind.Module specified as a String with FQN class names. Multiple classes can be separated by comma.",
          "title": "Module Class Names",
          "required": false,
          "deprecated": false
        },
        "moduleRefs": {
          "kind": "attribute",
          "type": "string",
          "description": "To use custom Jackson modules referred from the Camel registry. Multiple modules can be separated by comma.",
          "title": "Module Refs",
          "required": false,
          "deprecated": false
        },
        "enableFeatures": {
          "kind": "attribute",
          "type": "string",
          "description": "Set of features to enable on the Jackson com.fasterxml.jackson.databind.ObjectMapper. The features should be a name that matches a enum from com.fasterxml.jackson.databind.SerializationFeature com.fasterxml.jackson.databind.DeserializationFeature or com.fasterxml.jackson.databind.MapperFeature Multiple features can be separated by comma",
          "title": "Enable Features",
          "required": false,
          "deprecated": false
        },
        "disableFeatures": {
          "kind": "attribute",
          "type": "string",
          "description": "Set of features to disable on the Jackson com.fasterxml.jackson.databind.ObjectMapper. The features should be a name that matches a enum from com.fasterxml.jackson.databind.SerializationFeature com.fasterxml.jackson.databind.DeserializationFeature or com.fasterxml.jackson.databind.MapperFeature Multiple features can be separated by comma",
          "title": "Disable Features",
          "required": false,
          "deprecated": false
        },
        "allowUnmarshallType": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then Jackson is allowed to attempt to use the CamelJacksonUnmarshalType header during the unmarshalling. This should only be enabled when desired to be used.",
          "title": "Allow Unmarshall Type",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "jaxb": {
      "type": "object",
      "title": "JAXB",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "JAXB data format uses the JAXB2 XML marshalling standard to unmarshal an XML payload into Java objects or to marshal Java objects into an XML payload.",
      "properties": {
        "contextPath": {
          "kind": "attribute",
          "type": "string",
          "description": "Package name where your JAXB classes are located.",
          "title": "Context Path",
          "required": true,
          "deprecated": false
        },
        "schema": {
          "kind": "attribute",
          "type": "string",
          "description": "To validate against an existing schema. Your can use the prefix classpath: file: or http: to specify how the resource should by resolved. You can separate multiple schema files by using the '' character.",
          "title": "Schema",
          "required": false,
          "deprecated": false
        },
        "prettyPrint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To enable pretty printing output nicely formatted. Is by default false.",
          "title": "Pretty Print",
          "required": false,
          "deprecated": false
        },
        "objectFactory": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to allow using ObjectFactory classes to create the POJO classes during marshalling. This only applies to POJO classes that has not been annotated with JAXB and providing jaxb.index descriptor files.",
          "title": "Object Factory",
          "required": false,
          "deprecated": false
        },
        "ignoreJAXBElement": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to ignore JAXBElement elements - only needed to be set to false in very special use-cases.",
          "title": "Ignore J A X B Element",
          "required": false,
          "deprecated": false
        },
        "mustBeJAXBElement": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether marhsalling must be java objects with JAXB annotations. And if not then it fails. This option can be set to false to relax that such as when the data is already in XML format.",
          "title": "Must Be J A X B Element",
          "required": false,
          "deprecated": false
        },
        "filterNonXmlChars": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To ignore non xml characheters and replace them with an empty space.",
          "title": "Filter Non Xml Chars",
          "required": false,
          "deprecated": false
        },
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "description": "To overrule and use a specific encoding",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "fragment": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To turn on marshalling XML fragment trees. By default JAXB looks for XmlRootElement annotation on given class to operate on whole XML tree. This is useful but not always - sometimes generated code does not have XmlRootElement annotation sometimes you need unmarshall only part of tree. In that case you can use partial unmarshalling. To enable this behaviours you need set property partClass. Camel will pass this class to JAXB's unmarshaler.",
          "title": "Fragment",
          "required": false,
          "deprecated": false
        },
        "partClass": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of class used for fragment parsing. See more details at the fragment option.",
          "title": "Part Class",
          "required": false,
          "deprecated": false
        },
        "partNamespace": {
          "kind": "attribute",
          "type": "string",
          "description": "XML namespace to use for fragment parsing. See more details at the fragment option.",
          "title": "Part Namespace",
          "required": false,
          "deprecated": false
        },
        "namespacePrefixRef": {
          "kind": "attribute",
          "type": "string",
          "description": "When marshalling using JAXB or SOAP then the JAXB implementation will automatic assign namespace prefixes such as ns2 ns3 ns4 etc. To control this mapping Camel allows you to refer to a map which contains the desired mapping.",
          "title": "Namespace Prefix Ref",
          "required": false,
          "deprecated": false
        },
        "xmlStreamWriterWrapper": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom xml stream writer.",
          "title": "Xml Stream Writer Wrapper",
          "required": false,
          "deprecated": false
        },
        "schemaLocation": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the location of the schema",
          "title": "Schema Location",
          "required": false,
          "deprecated": false
        },
        "noNamespaceSchemaLocation": {
          "kind": "attribute",
          "type": "string",
          "description": "To define the location of the namespaceless schema",
          "title": "No Namespace Schema Location",
          "required": false,
          "deprecated": false
        },
        "jaxbProviderProperties": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom java.util.Map to lookup in the registry containing custom JAXB provider properties to be used with the JAXB marshaller.",
          "title": "Jaxb Provider Properties",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "jibx": {
      "type": "object",
      "title": "JiBX",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "JiBX data format is used for unmarshal a XML payload to POJO or to marshal POJO back to XML payload.",
      "properties": {
        "unmarshallClass": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name to use when unmarshalling from XML to Java.",
          "title": "Unmarshall Class",
          "required": false,
          "deprecated": false
        },
        "bindingName": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom binding factory",
          "title": "Binding Name",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "json": {
      "type": "object",
      "title": "JSon",
      "group": "dataformat,transformation,json",
      "icon": "generic24.png",
      "description": "JSon data format is used for unmarshal a JSon payload to POJO or to marshal POJO back to JSon payload.",
      "properties": {
        "objectMapper": {
          "kind": "attribute",
          "type": "string",
          "description": "Lookup and use the existing ObjectMapper with the given id when using Jackson.",
          "title": "Object Mapper",
          "required": false,
          "deprecated": false
        },
        "prettyPrint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To enable pretty printing output nicely formatted. Is by default false.",
          "title": "Pretty Print",
          "required": false,
          "deprecated": false
        },
        "library": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "XStream",
          "enum": [ "Fastjson", "Gson", "Jackson", "Johnzon", "XStream" ],
          "description": "Which json library to use.",
          "title": "Library",
          "required": false,
          "deprecated": false
        },
        "unmarshalTypeName": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name of the java type to use when unarmshalling",
          "title": "Unmarshal Type Name",
          "required": false,
          "deprecated": false
        },
        "jsonView": {
          "kind": "attribute",
          "type": "string",
          "description": "When marshalling a POJO to JSON you might want to exclude certain fields from the JSON output. With Jackson you can use JSON views to accomplish this. This option is to refer to the class which has JsonView annotations",
          "title": "Json View",
          "required": false,
          "deprecated": false
        },
        "include": {
          "kind": "attribute",
          "type": "string",
          "description": "If you want to marshal a pojo to JSON and the pojo has some fields with null values. And you want to skip these null values you can set this option to NOT_NULL",
          "title": "Include",
          "required": false,
          "deprecated": false
        },
        "allowJmsType": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Used for JMS users to allow the JMSType header from the JMS spec to specify a FQN classname to use to unmarshal to.",
          "title": "Allow Jms Type",
          "required": false,
          "deprecated": false
        },
        "collectionTypeName": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a custom collection type to lookup in the registry to use. This option should rarely be used but allows to use different collection types than java.util.Collection based as default.",
          "title": "Collection Type Name",
          "required": false,
          "deprecated": false
        },
        "useList": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To unarmshal to a List of Map or a List of Pojo.",
          "title": "Use List",
          "required": false,
          "deprecated": false
        },
        "enableJaxbAnnotationModule": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable the JAXB annotations module when using jackson. When enabled then JAXB annotations can be used by Jackson.",
          "title": "Enable Jaxb Annotation Module",
          "required": false,
          "deprecated": false
        },
        "moduleClassNames": {
          "kind": "attribute",
          "type": "string",
          "description": "To use custom Jackson modules com.fasterxml.jackson.databind.Module specified as a String with FQN class names. Multiple classes can be separated by comma.",
          "title": "Module Class Names",
          "required": false,
          "deprecated": false
        },
        "moduleRefs": {
          "kind": "attribute",
          "type": "string",
          "description": "To use custom Jackson modules referred from the Camel registry. Multiple modules can be separated by comma.",
          "title": "Module Refs",
          "required": false,
          "deprecated": false
        },
        "enableFeatures": {
          "kind": "attribute",
          "type": "string",
          "description": "Set of features to enable on the Jackson com.fasterxml.jackson.databind.ObjectMapper. The features should be a name that matches a enum from com.fasterxml.jackson.databind.SerializationFeature com.fasterxml.jackson.databind.DeserializationFeature or com.fasterxml.jackson.databind.MapperFeature Multiple features can be separated by comma",
          "title": "Enable Features",
          "required": false,
          "deprecated": false
        },
        "disableFeatures": {
          "kind": "attribute",
          "type": "string",
          "description": "Set of features to disable on the Jackson com.fasterxml.jackson.databind.ObjectMapper. The features should be a name that matches a enum from com.fasterxml.jackson.databind.SerializationFeature com.fasterxml.jackson.databind.DeserializationFeature or com.fasterxml.jackson.databind.MapperFeature Multiple features can be separated by comma",
          "title": "Disable Features",
          "required": false,
          "deprecated": false
        },
        "permissions": {
          "kind": "attribute",
          "type": "string",
          "description": "Adds permissions that controls which Java packages and classes XStream is allowed to use during unmarshal from xml/json to Java beans. A permission must be configured either here or globally using a JVM system property. The permission can be specified in a syntax where a plus sign is allow and minus sign is deny. Wildcards is supported by using . as prefix. For example to allow com.foo and all subpackages then specfy com.foo.. Multiple permissions can be configured separated by comma such as com.foo.-com.foo.bar.MySecretBean. The following default permission is always included: -java.lang.java.util. unless its overridden by specifying a JVM system property with they key org.apache.camel.xstream.permissions.",
          "title": "Permissions",
          "required": false,
          "deprecated": false
        },
        "allowUnmarshallType": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If enabled then Jackson is allowed to attempt to use the CamelJacksonUnmarshalType header during the unmarshalling. This should only be enabled when desired to be used.",
          "title": "Allow Unmarshall Type",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "lzf": {
      "type": "object",
      "title": "LZF Deflate Compression",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The LZF data format is a message compression and de-compression format (uses the LZF deflate algorithm).",
      "properties": {
        "usingParallelCompression": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Enable encoding (compress) using multiple processing cores.",
          "title": "Using Parallel Compression",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "mime-multipart": {
      "type": "object",
      "title": "MIME Multipart",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The MIME Multipart data format can marshal a Camel message with attachments into a Camel message having a MIME-Multipart message as message body (and no attachments) and vise-versa when unmarshalling.",
      "properties": {
        "multipartSubType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "mixed",
          "description": "Specify the subtype of the MIME Multipart. Default is mixed.",
          "title": "Multipart Sub Type",
          "required": false,
          "deprecated": false
        },
        "multipartWithoutAttachment": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Defines whether a message without attachment is also marshaled into a MIME Multipart (with only one body part). Default is false.",
          "title": "Multipart Without Attachment",
          "required": false,
          "deprecated": false
        },
        "headersInline": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Defines whether the MIME-Multipart headers are part of the message body (true) or are set as Camel headers (false). Default is false.",
          "title": "Headers Inline",
          "required": false,
          "deprecated": false
        },
        "includeHeaders": {
          "kind": "attribute",
          "type": "string",
          "description": "A regex that defines which Camel headers are also included as MIME headers into the MIME multipart. This will only work if headersInline is set to true. Default is to include no headers",
          "title": "Include Headers",
          "required": false,
          "deprecated": false
        },
        "binaryContent": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Defines whether the content of binary parts in the MIME multipart is binary (true) or Base-64 encoded (false) Default is false.",
          "title": "Binary Content",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "pgp": {
      "type": "object",
      "title": "PGP",
      "group": "dataformat,transformation,security",
      "icon": "generic24.png",
      "description": "PGP data format is used for encrypting and decrypting of messages using Java Cryptographic Extension and PGP.",
      "properties": {
        "keyUserid": {
          "kind": "attribute",
          "type": "string",
          "description": "The user ID of the key in the PGP keyring used during encryption. Can also be only a part of a user ID. For example if the user ID is Test User then you can use the part Test User or to address the user ID.",
          "title": "Key Userid",
          "required": false,
          "deprecated": false
        },
        "signatureKeyUserid": {
          "kind": "attribute",
          "type": "string",
          "description": "User ID of the key in the PGP keyring used for signing (during encryption) or signature verification (during decryption). During the signature verification process the specified User ID restricts the public keys from the public keyring which can be used for the verification. If no User ID is specified for the signature verficiation then any public key in the public keyring can be used for the verification. Can also be only a part of a user ID. For example if the user ID is Test User then you can use the part Test User or to address the User ID.",
          "title": "Signature Key Userid",
          "required": false,
          "deprecated": false
        },
        "password": {
          "kind": "attribute",
          "type": "string",
          "description": "Password used when opening the private key (not used for encryption).",
          "title": "Password",
          "required": false,
          "deprecated": false
        },
        "signaturePassword": {
          "kind": "attribute",
          "type": "string",
          "description": "Password used when opening the private key used for signing (during encryption).",
          "title": "Signature Password",
          "required": false,
          "deprecated": false
        },
        "keyFileName": {
          "kind": "attribute",
          "type": "string",
          "description": "Filename of the keyring; must be accessible as a classpath resource (but you can specify a location in the file system by using the file: prefix).",
          "title": "Key File Name",
          "required": false,
          "deprecated": false
        },
        "signatureKeyFileName": {
          "kind": "attribute",
          "type": "string",
          "description": "Filename of the keyring to use for signing (during encryption) or for signature verification (during decryption); must be accessible as a classpath resource (but you can specify a location in the file system by using the file: prefix).",
          "title": "Signature Key File Name",
          "required": false,
          "deprecated": false
        },
        "signatureKeyRing": {
          "kind": "attribute",
          "type": "string",
          "description": "Keyring used for signing/verifying as byte array. You can not set the signatureKeyFileName and signatureKeyRing at the same time.",
          "title": "Signature Key Ring",
          "required": false,
          "deprecated": false
        },
        "armored": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "This option will cause PGP to base64 encode the encrypted text making it available for copy/paste etc.",
          "title": "Armored",
          "required": false,
          "deprecated": false
        },
        "integrity": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Adds an integrity check/sign into the encryption file. The default value is true.",
          "title": "Integrity",
          "required": false,
          "deprecated": false
        },
        "provider": {
          "kind": "attribute",
          "type": "string",
          "description": "Java Cryptography Extension (JCE) provider default is Bouncy Castle (BC). Alternatively you can use for example the IAIK JCE provider; in this case the provider must be registered beforehand and the Bouncy Castle provider must not be registered beforehand. The Sun JCE provider does not work.",
          "title": "Provider",
          "required": false,
          "deprecated": false
        },
        "algorithm": {
          "kind": "attribute",
          "type": "integer",
          "description": "Symmetric key encryption algorithm; possible values are defined in org.bouncycastle.bcpg.SymmetricKeyAlgorithmTags; for example 2 (= TRIPLE DES) 3 (= CAST5) 4 (= BLOWFISH) 6 (= DES) 7 (= AES_128). Only relevant for encrypting.",
          "title": "Algorithm",
          "required": false,
          "deprecated": false
        },
        "compressionAlgorithm": {
          "kind": "attribute",
          "type": "integer",
          "description": "Compression algorithm; possible values are defined in org.bouncycastle.bcpg.CompressionAlgorithmTags; for example 0 (= UNCOMPRESSED) 1 (= ZIP) 2 (= ZLIB) 3 (= BZIP2). Only relevant for encrypting.",
          "title": "Compression Algorithm",
          "required": false,
          "deprecated": false
        },
        "hashAlgorithm": {
          "kind": "attribute",
          "type": "integer",
          "description": "Signature hash algorithm; possible values are defined in org.bouncycastle.bcpg.HashAlgorithmTags; for example 2 (= SHA1) 8 (= SHA256) 9 (= SHA384) 10 (= SHA512) 11 (=SHA224). Only relevant for signing.",
          "title": "Hash Algorithm",
          "required": false,
          "deprecated": false
        },
        "signatureVerificationOption": {
          "kind": "attribute",
          "type": "string",
          "description": "Controls the behavior for verifying the signature during unmarshaling. There are 4 values possible: optional: The PGP message may or may not contain signatures; if it does contain signatures then a signature verification is executed. required: The PGP message must contain at least one signature; if this is not the case an exception (PGPException) is thrown. A signature verification is executed. ignore: Contained signatures in the PGP message are ignored; no signature verification is executed. no_signature_allowed: The PGP message must not contain a signature; otherwise an exception (PGPException) is thrown.",
          "title": "Signature Verification Option",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "protobuf": {
      "type": "object",
      "title": "Protobuf",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The Protobuf data format is used for serializing between Java objects and the Google Protobuf protocol.",
      "properties": {
        "instanceClass": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of class to use when unarmshalling",
          "title": "Instance Class",
          "required": false,
          "deprecated": false
        },
        "contentTypeFormat": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "native",
          "enum": [ "json", "native" ],
          "description": "Defines a content type format in which protobuf message will be serialized/deserialized from(to) the Java been. The format can either be native or json for either native protobuf or json fields representation. The default value is native.",
          "title": "Content Type Format",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "rss": {
      "type": "object",
      "title": "RSS",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "RSS data format is used for working with RSS sync feed Java Objects and transforming to XML and vice-versa.",
      "properties": {
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "secureXML": {
      "type": "object",
      "title": "XML Security",
      "group": "dataformat,transformation,xml,security",
      "icon": "generic24.png",
      "description": "The XML Security data format facilitates encryption and decryption of XML payloads.",
      "properties": {
        "xmlCipherAlgorithm": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "TRIPLEDES",
          "description": "The cipher algorithm to be used for encryption/decryption of the XML message content. The available choices are: XMLCipher.TRIPLEDES XMLCipher.AES_128 XMLCipher.AES_128_GCM XMLCipher.AES_192 XMLCipher.AES_192_GCM XMLCipher.AES_256 XMLCipher.AES_256_GCM XMLCipher.SEED_128 XMLCipher.CAMELLIA_128 XMLCipher.CAMELLIA_192 XMLCipher.CAMELLIA_256 The default value is MLCipher.TRIPLEDES",
          "title": "Xml Cipher Algorithm",
          "required": false,
          "deprecated": false
        },
        "passPhrase": {
          "kind": "attribute",
          "type": "string",
          "description": "A String used as passPhrase to encrypt/decrypt content. The passPhrase has to be provided. If no passPhrase is specified a default passPhrase is used. The passPhrase needs to be put together in conjunction with the appropriate encryption algorithm. For example using TRIPLEDES the passPhase can be a Only another 24 Byte key",
          "title": "Pass Phrase",
          "required": false,
          "deprecated": false
        },
        "secureTag": {
          "kind": "attribute",
          "type": "string",
          "description": "The XPath reference to the XML Element selected for encryption/decryption. If no tag is specified the entire payload is encrypted/decrypted.",
          "title": "Secure Tag",
          "required": false,
          "deprecated": false
        },
        "secureTagContents": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "A boolean value to specify whether the XML Element is to be encrypted or the contents of the XML Element false = Element Level true = Element Content Level",
          "title": "Secure Tag Contents",
          "required": false,
          "deprecated": false
        },
        "keyCipherAlgorithm": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "RSA_OAEP",
          "description": "The cipher algorithm to be used for encryption/decryption of the asymmetric key. The available choices are: XMLCipher.RSA_v1dot5 XMLCipher.RSA_OAEP XMLCipher.RSA_OAEP_11 The default value is XMLCipher.RSA_OAEP",
          "title": "Key Cipher Algorithm",
          "required": false,
          "deprecated": false
        },
        "recipientKeyAlias": {
          "kind": "attribute",
          "type": "string",
          "description": "The key alias to be used when retrieving the recipient's public or private key from a KeyStore when performing asymmetric key encryption or decryption.",
          "title": "Recipient Key Alias",
          "required": false,
          "deprecated": false
        },
        "keyOrTrustStoreParametersId": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to a KeyStore instance to lookup in the registry which is used for configuration options for creating and loading a KeyStore instance that represents the sender's trustStore or recipient's keyStore.",
          "title": "Key Or Trust Store Parameters Id",
          "required": false,
          "deprecated": false
        },
        "keyPassword": {
          "kind": "attribute",
          "type": "string",
          "description": "The password to be used for retrieving the private key from the KeyStore. This key is used for asymmetric decryption.",
          "title": "Key Password",
          "required": false,
          "deprecated": false
        },
        "digestAlgorithm": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "SHA1",
          "description": "The digest algorithm to use with the RSA OAEP algorithm. The available choices are: XMLCipher.SHA1 XMLCipher.SHA256 XMLCipher.SHA512 The default value is XMLCipher.SHA1",
          "title": "Digest Algorithm",
          "required": false,
          "deprecated": false
        },
        "mgfAlgorithm": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "MGF1_SHA1",
          "description": "The MGF Algorithm to use with the RSA OAEP algorithm. The available choices are: EncryptionConstants.MGF1_SHA1 EncryptionConstants.MGF1_SHA256 EncryptionConstants.MGF1_SHA512 The default value is EncryptionConstants.MGF1_SHA1",
          "title": "Mgf Algorithm",
          "required": false,
          "deprecated": false
        },
        "addKeyValueForEncryptedKey": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to add the public key used to encrypt the session key as a KeyValue in the EncryptedKey structure or not.",
          "title": "Add Key Value For Encrypted Key",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "serialization": {
      "type": "object",
      "title": "Java Object Serialization",
      "group": "dataformat,transformation,core",
      "icon": "generic24.png",
      "description": "Serialization is a data format which uses the standard Java Serialization mechanism to unmarshal a binary payload into Java objects or to marshal Java objects into a binary blob.",
      "properties": {
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "soapjaxb": {
      "type": "object",
      "title": "SOAP",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "SOAP is a data format which uses JAXB2 and JAX-WS annotations to marshal and unmarshal SOAP payloads.",
      "properties": {
        "contextPath": {
          "kind": "attribute",
          "type": "string",
          "description": "Package name where your JAXB classes are located.",
          "title": "Context Path",
          "required": true,
          "deprecated": false
        },
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "description": "To overrule and use a specific encoding",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "elementNameStrategyRef": {
          "kind": "attribute",
          "type": "string",
          "description": "Refers to an element strategy to lookup from the registry. An element name strategy is used for two purposes. The first is to find a xml element name for a given object and soap action when marshaling the object into a SOAP message. The second is to find an Exception class for a given soap fault name. The following three element strategy class name is provided out of the box. QNameStrategy - Uses a fixed qName that is configured on instantiation. Exception lookup is not supported TypeNameStrategy - Uses the name and namespace from the XMLType annotation of the given type. If no namespace is set then package-info is used. Exception lookup is not supported ServiceInterfaceStrategy - Uses information from a webservice interface to determine the type name and to find the exception class for a SOAP fault All three classes is located in the package name org.apache.camel.dataformat.soap.name If you have generated the web service stub code with cxf-codegen or a similar tool then you probably will want to use the ServiceInterfaceStrategy. In the case you have no annotated service interface you should use QNameStrategy or TypeNameStrategy.",
          "title": "Element Name Strategy Ref",
          "required": false,
          "deprecated": false
        },
        "version": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "1.1",
          "description": "SOAP version should either be 1.1 or 1.2. Is by default 1.1",
          "title": "Version",
          "required": false,
          "deprecated": false
        },
        "namespacePrefixRef": {
          "kind": "attribute",
          "type": "string",
          "description": "When marshalling using JAXB or SOAP then the JAXB implementation will automatic assign namespace prefixes such as ns2 ns3 ns4 etc. To control this mapping Camel allows you to refer to a map which contains the desired mapping.",
          "title": "Namespace Prefix Ref",
          "required": false,
          "deprecated": false
        },
        "schema": {
          "kind": "attribute",
          "type": "string",
          "description": "To validate against an existing schema. Your can use the prefix classpath: file: or http: to specify how the resource should by resolved. You can separate multiple schema files by using the '' character.",
          "title": "Schema",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "string": {
      "type": "object",
      "title": "String Encoding",
      "group": "dataformat,transformation,core",
      "icon": "generic24.png",
      "description": "String data format is a textual based format that supports character encoding.",
      "properties": {
        "charset": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets an encoding to use. Will by default use the JVM platform default charset.",
          "title": "Charset",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "syslog": {
      "type": "object",
      "title": "Syslog",
      "group": "dataformat,transformation,monitoring",
      "icon": "generic24.png",
      "description": "The Syslog dataformat is used for working with RFC3164 and RFC5424 messages (logging and monitoring).",
      "properties": {
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "tarfile": {
      "type": "object",
      "title": "Tar File",
      "group": "dataformat,transformation,file",
      "icon": "generic24.png",
      "description": "The Tar File data format is a message compression and de-compression format of tar files.",
      "properties": {
        "usingIterator": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the tar file has more then one entry the setting this option to true allows to work with the splitter EIP to split the data using an iterator in a streaming mode.",
          "title": "Using Iterator",
          "required": false,
          "deprecated": false
        },
        "allowEmptyDirectory": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the tar file has more then one entry setting this option to true allows to get the iterator even if the directory is empty",
          "title": "Allow Empty Directory",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "thrift": {
      "type": "object",
      "title": "Thrift",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "The Thrift data format is used for serialization and deserialization of messages using Apache Thrift binary dataformat.",
      "properties": {
        "instanceClass": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of class to use when unarmshalling",
          "title": "Instance Class",
          "required": false,
          "deprecated": false
        },
        "contentTypeFormat": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "binary",
          "enum": [ "binary", "json", "sjson" ],
          "description": "Defines a content type format in which thrift message will be serialized/deserialized from(to) the Java been. The format can either be native or json for either native binary thrift json or simple json fields representation. The default value is binary.",
          "title": "Content Type Format",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "tidyMarkup": {
      "type": "object",
      "title": "TidyMarkup",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "TidyMarkup data format is used for parsing HTML and return it as pretty well-formed HTML.",
      "properties": {
        "dataObjectType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "org.w3c.dom.Node",
          "description": "What data type to unmarshal as can either be org.w3c.dom.Node or java.lang.String. Is by default org.w3c.dom.Node",
          "title": "Data Object Type",
          "required": false,
          "deprecated": false
        },
        "omitXmlDeclaration": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "When returning a String do we omit the XML declaration in the top.",
          "title": "Omit Xml Declaration",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "typeFilter": {
      "type": "object",
      "title": "YAML Type Filter",
      "group": "dataformat,transformation,yaml",
      "icon": "generic24.png",
      "description": "",
      "properties": {
        "value": {
          "kind": "attribute",
          "type": "string",
          "description": "Value of type such as class name or regular expression",
          "title": "Value",
          "required": false,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "object",
          "enum": [ "regexp", "type" ],
          "description": "Whether to filter by class type or regular expression",
          "title": "Type",
          "required": false,
          "deprecated": false
        }
      }
    },
    "univocity-csv": {
      "type": "object",
      "title": "uniVocity CSV",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The uniVocity CSV data format is used for working with CSV (Comma Separated Values) flat payloads.",
      "properties": {
        "quoteAllFields": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not all values must be quoted when writing them.",
          "title": "Quote All Fields",
          "required": false,
          "deprecated": false
        },
        "quote": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "\"",
          "description": "The quote symbol.",
          "title": "Quote",
          "required": false,
          "deprecated": false
        },
        "quoteEscape": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "\"",
          "description": "The quote escape symbol",
          "title": "Quote Escape",
          "required": false,
          "deprecated": false
        },
        "delimiter": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": ",",
          "description": "The delimiter of values",
          "title": "Delimiter",
          "required": false,
          "deprecated": false
        },
        "nullValue": {
          "kind": "attribute",
          "type": "string",
          "description": "The string representation of a null value. The default value is null",
          "title": "Null Value",
          "required": false,
          "deprecated": false
        },
        "skipEmptyLines": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the empty lines must be ignored. The default value is true",
          "title": "Skip Empty Lines",
          "required": false,
          "deprecated": false
        },
        "ignoreTrailingWhitespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the trailing white spaces must ignored. The default value is true",
          "title": "Ignore Trailing Whitespaces",
          "required": false,
          "deprecated": false
        },
        "ignoreLeadingWhitespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the leading white spaces must be ignored. The default value is true",
          "title": "Ignore Leading Whitespaces",
          "required": false,
          "deprecated": false
        },
        "headersDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the headers are disabled. When defined this option explicitly sets the headers as null which indicates that there is no header. The default value is false",
          "title": "Headers Disabled",
          "required": false,
          "deprecated": false
        },
        "headerExtractionEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the header must be read in the first line of the test document The default value is false",
          "title": "Header Extraction Enabled",
          "required": false,
          "deprecated": false
        },
        "numberOfRecordsToRead": {
          "kind": "attribute",
          "type": "integer",
          "description": "The maximum number of record to read.",
          "title": "Number Of Records To Read",
          "required": false,
          "deprecated": false
        },
        "emptyValue": {
          "kind": "attribute",
          "type": "string",
          "description": "The String representation of an empty value",
          "title": "Empty Value",
          "required": false,
          "deprecated": false
        },
        "lineSeparator": {
          "kind": "attribute",
          "type": "string",
          "description": "The line separator of the files The default value is to use the JVM platform line separator",
          "title": "Line Separator",
          "required": false,
          "deprecated": false
        },
        "normalizedLineSeparator": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "\n",
          "description": "The normalized line separator of the files The default value is a new line character.",
          "title": "Normalized Line Separator",
          "required": false,
          "deprecated": false
        },
        "comment": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "#",
          "description": "The comment symbol. The default value is",
          "title": "Comment",
          "required": false,
          "deprecated": false
        },
        "lazyLoad": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce an iterator that reads the lines on the fly or if all the lines must be read at one. The default value is false",
          "title": "Lazy Load",
          "required": false,
          "deprecated": false
        },
        "asMap": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce maps for the lines values instead of lists. It requires to have header (either defined or collected). The default value is false",
          "title": "As Map",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "univocity-fixed": {
      "type": "object",
      "title": "uniVocity Fixed Length",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The uniVocity Fixed Length data format is used for working with fixed length flat payloads.",
      "properties": {
        "skipTrailingCharsUntilNewline": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the trailing characters until new line must be ignored. The default value is false",
          "title": "Skip Trailing Chars Until Newline",
          "required": false,
          "deprecated": false
        },
        "recordEndsOnNewline": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the record ends on new line. The default value is false",
          "title": "Record Ends On Newline",
          "required": false,
          "deprecated": false
        },
        "padding": {
          "kind": "attribute",
          "type": "string",
          "description": "The padding character. The default value is a space",
          "title": "Padding",
          "required": false,
          "deprecated": false
        },
        "nullValue": {
          "kind": "attribute",
          "type": "string",
          "description": "The string representation of a null value. The default value is null",
          "title": "Null Value",
          "required": false,
          "deprecated": false
        },
        "skipEmptyLines": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the empty lines must be ignored. The default value is true",
          "title": "Skip Empty Lines",
          "required": false,
          "deprecated": false
        },
        "ignoreTrailingWhitespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the trailing white spaces must ignored. The default value is true",
          "title": "Ignore Trailing Whitespaces",
          "required": false,
          "deprecated": false
        },
        "ignoreLeadingWhitespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the leading white spaces must be ignored. The default value is true",
          "title": "Ignore Leading Whitespaces",
          "required": false,
          "deprecated": false
        },
        "headersDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the headers are disabled. When defined this option explicitly sets the headers as null which indicates that there is no header. The default value is false",
          "title": "Headers Disabled",
          "required": false,
          "deprecated": false
        },
        "headerExtractionEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the header must be read in the first line of the test document The default value is false",
          "title": "Header Extraction Enabled",
          "required": false,
          "deprecated": false
        },
        "numberOfRecordsToRead": {
          "kind": "attribute",
          "type": "integer",
          "description": "The maximum number of record to read.",
          "title": "Number Of Records To Read",
          "required": false,
          "deprecated": false
        },
        "emptyValue": {
          "kind": "attribute",
          "type": "string",
          "description": "The String representation of an empty value",
          "title": "Empty Value",
          "required": false,
          "deprecated": false
        },
        "lineSeparator": {
          "kind": "attribute",
          "type": "string",
          "description": "The line separator of the files The default value is to use the JVM platform line separator",
          "title": "Line Separator",
          "required": false,
          "deprecated": false
        },
        "normalizedLineSeparator": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "\n",
          "description": "The normalized line separator of the files The default value is a new line character.",
          "title": "Normalized Line Separator",
          "required": false,
          "deprecated": false
        },
        "comment": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "#",
          "description": "The comment symbol. The default value is",
          "title": "Comment",
          "required": false,
          "deprecated": false
        },
        "lazyLoad": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce an iterator that reads the lines on the fly or if all the lines must be read at one. The default value is false",
          "title": "Lazy Load",
          "required": false,
          "deprecated": false
        },
        "asMap": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce maps for the lines values instead of lists. It requires to have header (either defined or collected). The default value is false",
          "title": "As Map",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "univocity-header": {
      "type": "object",
      "title": "uniVocity Header",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "To configure headers for UniVocity data formats.",
      "properties": {
        "name": {
          "kind": "value",
          "type": "string",
          "description": "Header name",
          "title": "Name",
          "required": true,
          "deprecated": false
        },
        "length": {
          "kind": "attribute",
          "type": "integer",
          "description": "Header length",
          "title": "Length",
          "required": false,
          "deprecated": false
        }
      }
    },
    "univocity-tsv": {
      "type": "object",
      "title": "uniVocity TSV",
      "group": "dataformat,transformation,csv",
      "icon": "generic24.png",
      "description": "The uniVocity TSV data format is used for working with TSV (Tabular Separated Values) flat payloads.",
      "properties": {
        "escapeChar": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "\\",
          "description": "The escape character.",
          "title": "Escape Char",
          "required": false,
          "deprecated": false
        },
        "nullValue": {
          "kind": "attribute",
          "type": "string",
          "description": "The string representation of a null value. The default value is null",
          "title": "Null Value",
          "required": false,
          "deprecated": false
        },
        "skipEmptyLines": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the empty lines must be ignored. The default value is true",
          "title": "Skip Empty Lines",
          "required": false,
          "deprecated": false
        },
        "ignoreTrailingWhitespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the trailing white spaces must ignored. The default value is true",
          "title": "Ignore Trailing Whitespaces",
          "required": false,
          "deprecated": false
        },
        "ignoreLeadingWhitespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether or not the leading white spaces must be ignored. The default value is true",
          "title": "Ignore Leading Whitespaces",
          "required": false,
          "deprecated": false
        },
        "headersDisabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the headers are disabled. When defined this option explicitly sets the headers as null which indicates that there is no header. The default value is false",
          "title": "Headers Disabled",
          "required": false,
          "deprecated": false
        },
        "headerExtractionEnabled": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether or not the header must be read in the first line of the test document The default value is false",
          "title": "Header Extraction Enabled",
          "required": false,
          "deprecated": false
        },
        "numberOfRecordsToRead": {
          "kind": "attribute",
          "type": "integer",
          "description": "The maximum number of record to read.",
          "title": "Number Of Records To Read",
          "required": false,
          "deprecated": false
        },
        "emptyValue": {
          "kind": "attribute",
          "type": "string",
          "description": "The String representation of an empty value",
          "title": "Empty Value",
          "required": false,
          "deprecated": false
        },
        "lineSeparator": {
          "kind": "attribute",
          "type": "string",
          "description": "The line separator of the files The default value is to use the JVM platform line separator",
          "title": "Line Separator",
          "required": false,
          "deprecated": false
        },
        "normalizedLineSeparator": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "\n",
          "description": "The normalized line separator of the files The default value is a new line character.",
          "title": "Normalized Line Separator",
          "required": false,
          "deprecated": false
        },
        "comment": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "#",
          "description": "The comment symbol. The default value is",
          "title": "Comment",
          "required": false,
          "deprecated": false
        },
        "lazyLoad": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce an iterator that reads the lines on the fly or if all the lines must be read at one. The default value is false",
          "title": "Lazy Load",
          "required": false,
          "deprecated": false
        },
        "asMap": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the unmarshalling should produce maps for the lines values instead of lists. It requires to have header (either defined or collected). The default value is false",
          "title": "As Map",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xmlBeans": {
      "type": "object",
      "title": "XML Beans",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "XML Beans data format is used for unmarshal a XML payload to POJO or to marshal POJO back to XML payload.",
      "properties": {
        "prettyPrint": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To enable pretty printing output nicely formatted. Is by default false.",
          "title": "Pretty Print",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xmljson": {
      "type": "object",
      "title": "XML JSon",
      "group": "dataformat,transformation,xml,json",
      "icon": "generic24.png",
      "description": "XML JSon data format can convert from XML to JSON and vice-versa directly without stepping through intermediate POJOs.",
      "properties": {
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the encoding. Used for unmarshalling (JSON to XML conversion).",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "elementName": {
          "kind": "attribute",
          "type": "string",
          "description": "Specifies the name of the XML elements representing each array element. Used for unmarshalling (JSON to XML conversion).",
          "title": "Element Name",
          "required": false,
          "deprecated": false
        },
        "arrayName": {
          "kind": "attribute",
          "type": "string",
          "description": "Specifies the name of the top-level XML element. Used for unmarshalling (JSON to XML conversion). For example when converting 1 2 3 it will be output by default as 123. By setting this option or rootName you can alter the name of element 'a'.",
          "title": "Array Name",
          "required": false,
          "deprecated": false
        },
        "forceTopLevelObject": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Determines whether the resulting JSON will start off with a top-most element whose name matches the XML root element. Used for marshalling (XML to JSon conversion). If disabled XML string 12 turns into 'x: '1' 'y': '2' . Otherwise it turns into 'a': 'x: '1' 'y': '2' .",
          "title": "Force Top Level Object",
          "required": false,
          "deprecated": false
        },
        "namespaceLenient": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Flag to be tolerant to incomplete namespace prefixes. Used for unmarshalling (JSON to XML conversion). In most cases json-lib automatically changes this flag at runtime to match the processing.",
          "title": "Namespace Lenient",
          "required": false,
          "deprecated": false
        },
        "rootName": {
          "kind": "attribute",
          "type": "string",
          "description": "Specifies the name of the top-level element. Used for unmarshalling (JSON to XML conversion). If not set json-lib will use arrayName or objectName (default value: 'o' at the current time it is not configurable in this data format). If set to 'root' the JSON string 'x': 'value1' 'y' : 'value2' would turn into value1value2 otherwise the 'root' element would be named 'o'.",
          "title": "Root Name",
          "required": false,
          "deprecated": false
        },
        "skipWhitespace": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Determines whether white spaces between XML elements will be regarded as text values or disregarded. Used for marshalling (XML to JSon conversion).",
          "title": "Skip Whitespace",
          "required": false,
          "deprecated": false
        },
        "trimSpaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Determines whether leading and trailing white spaces will be omitted from String values. Used for marshalling (XML to JSon conversion).",
          "title": "Trim Spaces",
          "required": false,
          "deprecated": false
        },
        "skipNamespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Signals whether namespaces should be ignored. By default they will be added to the JSON output using xmlns elements. Used for marshalling (XML to JSon conversion).",
          "title": "Skip Namespaces",
          "required": false,
          "deprecated": false
        },
        "removeNamespacePrefixes": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Removes the namespace prefixes from XML qualified elements so that the resulting JSON string does not contain them. Used for marshalling (XML to JSon conversion).",
          "title": "Remove Namespace Prefixes",
          "required": false,
          "deprecated": false
        },
        "expandableProperties": {
          "kind": "attribute",
          "type": "array",
          "description": "With expandable properties JSON array elements are converted to XML as a sequence of repetitive XML elements with the local name equal to the JSON key for example: number: 123 normally converted to: 123 (where e can be modified by setting elementName) would instead translate to 123 if number is set as an expandable property Used for unmarshalling (JSON to XML conversion).",
          "title": "Expandable Properties",
          "required": false,
          "deprecated": false
        },
        "typeHints": {
          "kind": "attribute",
          "type": "string",
          "description": "Adds type hints to the resulting XML to aid conversion back to JSON. Used for unmarshalling (JSON to XML conversion).",
          "title": "Type Hints",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xmlrpc": {
      "type": "object",
      "title": "XML RPC",
      "group": "dataformat,transformation,xml",
      "icon": "generic24.png",
      "description": "The XML RPC data format is used for working with the XML RPC protocol.",
      "properties": {
        "request": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to marshal/unmarshal request or response Is by default false",
          "title": "Request",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xstream": {
      "type": "object",
      "title": "XStream",
      "group": "dataformat,transformation,xml,json",
      "icon": "generic24.png",
      "description": "XSTream data format is used for unmarshal a XML payload to POJO or to marshal POJO back to XML payload.",
      "properties": {
        "permissions": {
          "kind": "attribute",
          "type": "string",
          "description": "Adds permissions that controls which Java packages and classes XStream is allowed to use during unmarshal from xml/json to Java beans. A permission must be configured either here or globally using a JVM system property. The permission can be specified in a syntax where a plus sign is allow and minus sign is deny. Wildcards is supported by using . as prefix. For example to allow com.foo and all subpackages then specfy com.foo.. Multiple permissions can be configured separated by comma such as com.foo.-com.foo.bar.MySecretBean. The following default permission is always included: -java.lang.java.util. unless its overridden by specifying a JVM system property with they key org.apache.camel.xstream.permissions.",
          "title": "Permissions",
          "required": false,
          "deprecated": false
        },
        "encoding": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the encoding to use",
          "title": "Encoding",
          "required": false,
          "deprecated": false
        },
        "driver": {
          "kind": "attribute",
          "type": "string",
          "description": "To use a custom XStream driver. The instance must be of type com.thoughtworks.xstream.io.HierarchicalStreamDriver",
          "title": "Driver",
          "required": false,
          "deprecated": false
        },
        "driverRef": {
          "kind": "attribute",
          "type": "string",
          "description": "To refer to a custom XStream driver to lookup in the registry. The instance must be of type com.thoughtworks.xstream.io.HierarchicalStreamDriver",
          "title": "Driver Ref",
          "required": false,
          "deprecated": false
        },
        "mode": {
          "kind": "attribute",
          "type": "string",
          "description": "Mode for dealing with duplicate references The possible values are: NO_REFERENCES ID_REFERENCES XPATH_RELATIVE_REFERENCES XPATH_ABSOLUTE_REFERENCES SINGLE_NODE_XPATH_RELATIVE_REFERENCES SINGLE_NODE_XPATH_ABSOLUTE_REFERENCES",
          "title": "Mode",
          "required": false,
          "deprecated": false
        },
        "converters": {
          "kind": "element",
          "type": "array",
          "description": "List of class names for using custom XStream converters. The classes must be of type com.thoughtworks.xstream.converters.Converter",
          "title": "Converters",
          "required": false,
          "deprecated": false
        },
        "aliases": {
          "kind": "element",
          "type": "object",
          "description": "Alias a Class to a shorter name to be used in XML elements.",
          "title": "Aliases",
          "required": false,
          "deprecated": false
        },
        "omitFields": {
          "kind": "element",
          "type": "object",
          "description": "Prevents a field from being serialized. To omit a field you must always provide the declaring type and not necessarily the type that is converted.",
          "title": "Omit Fields",
          "required": false,
          "deprecated": false
        },
        "implicitCollections": {
          "kind": "element",
          "type": "object",
          "description": "Adds a default implicit collection which is used for any unmapped XML tag.",
          "title": "Implicit Collections",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "yaml": {
      "type": "object",
      "title": "YAML",
      "group": "dataformat,transformation,yaml",
      "icon": "generic24.png",
      "description": "YAML is a data format to marshal and unmarshal Java objects to and from YAML.",
      "properties": {
        "library": {
          "kind": "attribute",
          "type": "object",
          "defaultValue": "SnakeYAML",
          "enum": [ "SnakeYAML" ],
          "description": "Which yaml library to use. By default it is SnakeYAML",
          "title": "Library",
          "required": false,
          "deprecated": false
        },
        "unmarshalTypeName": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name of the java type to use when unarmshalling",
          "title": "Unmarshal Type Name",
          "required": false,
          "deprecated": false
        },
        "constructor": {
          "kind": "attribute",
          "type": "string",
          "description": "BaseConstructor to construct incoming documents.",
          "title": "Constructor",
          "required": false,
          "deprecated": false
        },
        "representer": {
          "kind": "attribute",
          "type": "string",
          "description": "Representer to emit outgoing objects.",
          "title": "Representer",
          "required": false,
          "deprecated": false
        },
        "dumperOptions": {
          "kind": "attribute",
          "type": "string",
          "description": "DumperOptions to configure outgoing objects.",
          "title": "Dumper Options",
          "required": false,
          "deprecated": false
        },
        "resolver": {
          "kind": "attribute",
          "type": "string",
          "description": "Resolver to detect implicit type",
          "title": "Resolver",
          "required": false,
          "deprecated": false
        },
        "useApplicationContextClassLoader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Use ApplicationContextClassLoader as custom ClassLoader",
          "title": "Use Application Context Class Loader",
          "required": false,
          "deprecated": false
        },
        "prettyFlow": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Force the emitter to produce a pretty YAML document when using the flow style.",
          "title": "Pretty Flow",
          "required": false,
          "deprecated": false
        },
        "allowAnyType": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Allow any class to be un-marshaled",
          "title": "Allow Any Type",
          "required": false,
          "deprecated": false
        },
        "typeFilter": {
          "kind": "element",
          "type": "array",
          "description": "Set the types SnakeYAML is allowed to un-marshall",
          "title": "Type Filter",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "zip": {
      "type": "object",
      "title": "Zip Deflate Compression",
      "group": "dataformat,transformation",
      "icon": "generic24.png",
      "description": "Zip Deflate Compression data format is a message compression and de-compression format (not zip files).",
      "properties": {
        "compressionLevel": {
          "kind": "attribute",
          "type": "integer",
          "defaultValue": "-1",
          "description": "To specify a specific compression between 0-9. -1 is default compression 0 is no compression and 9 is best compression.",
          "title": "Compression Level",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "zipFile": {
      "type": "object",
      "title": "Zip File",
      "group": "dataformat,transformation,file",
      "icon": "generic24.png",
      "description": "The Zip File data format is a message compression and de-compression format of zip files.",
      "properties": {
        "usingIterator": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the zip file has more then one entry the setting this option to true allows to work with the splitter EIP to split the data using an iterator in a streaming mode.",
          "title": "Using Iterator",
          "required": false,
          "deprecated": false
        },
        "allowEmptyDirectory": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the zip file has more then one entry setting this option to true allows to get the iterator even if the directory is empty",
          "title": "Allow Empty Directory",
          "required": false,
          "deprecated": false
        },
        "contentTypeHeader": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the data format should set the Content-Type header with the type from the data format if the data format is capable of doing so. For example application/xml for data formats marshalling to XML or application/json for data formats marshalling to JSon etc.",
          "title": "Content Type Header",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the value of the id property.",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    }
  },
  "languages": {
    "constant": {
      "type": "object",
      "title": "Constant",
      "group": "language,core",
      "icon": "generic24.png",
      "description": "To use a constant value in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "el": {
      "type": "object",
      "title": "EL",
      "group": "language,script",
      "icon": "generic24.png",
      "description": "To use EL scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "exchangeProperty": {
      "type": "object",
      "title": "ExchangeProperty",
      "group": "language,core",
      "icon": "generic24.png",
      "description": "To use a Camel Exchange property in expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "expression": {
      "type": "object",
      "title": "Expression",
      "group": "language",
      "icon": "generic24.png",
      "description": "A useful base class for an expression",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "groovy": {
      "type": "object",
      "title": "Groovy",
      "group": "language,script",
      "icon": "generic24.png",
      "description": "To use Groovy scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "header": {
      "type": "object",
      "title": "Header",
      "group": "language,core",
      "icon": "generic24.png",
      "description": "To use a Camel Message header in expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "javaScript": {
      "type": "object",
      "title": "JavaScript",
      "group": "language,script",
      "icon": "generic24.png",
      "description": "To use JavaScript in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "jsonpath": {
      "type": "object",
      "title": "JSonPath",
      "group": "language,json",
      "icon": "generic24.png",
      "description": "To use JSonPath in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "resultType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name of the result type (type from output)",
          "title": "Result Type",
          "required": false,
          "deprecated": false
        },
        "suppressExceptions": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to suppress exceptions such as PathNotFoundException.",
          "title": "Suppress Exceptions",
          "required": false,
          "deprecated": false
        },
        "allowSimple": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to allow in inlined simple exceptions in the json path expression",
          "title": "Allow Simple",
          "required": false,
          "deprecated": false
        },
        "allowEasyPredicate": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to allow using the easy predicate parser to pre-parse predicates.",
          "title": "Allow Easy Predicate",
          "required": false,
          "deprecated": false
        },
        "writeAsString": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to write the output of each row/element as a JSon String value instead of a Map/POJO value.",
          "title": "Write As String",
          "required": false,
          "deprecated": false
        },
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of header to use as input instead of the message body",
          "title": "Header Name",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "jxpath": {
      "type": "object",
      "title": "JXPath",
      "group": "language,java",
      "icon": "generic24.png",
      "description": "To use JXPath in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "lenient": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Allows to turn lenient on the JXPathContext. When turned on this allows the JXPath expression to evaluate against expressions and message bodies which may be invalid / missing data. This option is by default false",
          "title": "Lenient",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "language": {
      "type": "object",
      "title": "Language",
      "group": "language,core",
      "icon": "generic24.png",
      "description": "To use the specified language in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "language": {
          "kind": "attribute",
          "type": "string",
          "description": "The name of the language to use",
          "title": "Language",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "method": {
      "type": "object",
      "title": "Bean method",
      "group": "language,core,java",
      "icon": "generic24.png",
      "description": "To use a Java bean (aka method call) in Camel expressions or predicates.",
      "properties": {
        "bean": {
          "kind": "attribute",
          "type": "string",
          "description": "Either a reference or a class name of the bean to use",
          "title": "Bean",
          "required": false,
          "deprecated": true
        },
        "ref": {
          "kind": "attribute",
          "type": "string",
          "description": "Reference to bean to lookup in the registry",
          "title": "Ref",
          "required": false,
          "deprecated": false
        },
        "method": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of method to call",
          "title": "Method",
          "required": false,
          "deprecated": false
        },
        "beanType": {
          "kind": "attribute",
          "type": "string",
          "description": "Class name of the bean to use",
          "title": "Bean Type",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "mvel": {
      "type": "object",
      "title": "MVEL",
      "group": "language,java",
      "icon": "generic24.png",
      "description": "To use MVEL scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "ognl": {
      "type": "object",
      "title": "OGNL",
      "group": "language,java",
      "icon": "generic24.png",
      "description": "To use OGNL scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "php": {
      "type": "object",
      "title": "PHP",
      "group": "language,script",
      "icon": "generic24.png",
      "description": "To use PHP scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "python": {
      "type": "object",
      "title": "Python",
      "group": "language,script",
      "icon": "generic24.png",
      "description": "To use Python scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "ref": {
      "type": "object",
      "title": "Ref",
      "group": "language,core",
      "icon": "generic24.png",
      "description": "Reference to an existing Camel expression or predicate which is looked up from the Camel registry.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "ruby": {
      "type": "object",
      "title": "Ruby",
      "group": "language,script",
      "icon": "generic24.png",
      "description": "To use Ruby scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "simple": {
      "type": "object",
      "title": "Simple",
      "group": "language,core,java",
      "icon": "generic24.png",
      "description": "To use Camels built-in Simple language in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "resultType": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name of the result type (type from output)",
          "title": "Result Type",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "spel": {
      "type": "object",
      "title": "SpEL",
      "group": "language,spring",
      "icon": "generic24.png",
      "description": "To use Spring Expression Language (SpEL) in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "sql": {
      "type": "object",
      "title": "SQL",
      "group": "language",
      "icon": "generic24.png",
      "description": "To use SQL (on Java beans) in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "terser": {
      "type": "object",
      "title": "HL7 Terser",
      "group": "language,hl7",
      "icon": "generic24.png",
      "description": "To use HL7 terser scripts in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "tokenize": {
      "type": "object",
      "title": "Tokenize",
      "group": "language,core",
      "icon": "generic24.png",
      "description": "To use Camel message body or header with a tokenizer in Camel expressions or predicates.",
      "properties": {
        "token": {
          "kind": "attribute",
          "type": "string",
          "description": "The (start) token to use as tokenizer for example you can use the new line token. You can use simple language as the token to support dynamic tokens.",
          "title": "Token",
          "required": true,
          "deprecated": false
        },
        "endToken": {
          "kind": "attribute",
          "type": "string",
          "description": "The end token to use as tokenizer if using start/end token pairs. You can use simple language as the token to support dynamic tokens.",
          "title": "End Token",
          "required": false,
          "deprecated": false
        },
        "inheritNamespaceTagName": {
          "kind": "attribute",
          "type": "string",
          "description": "To inherit namespaces from a root/parent tag name when using XML You can use simple language as the tag name to support dynamic names.",
          "title": "Inherit Namespace Tag Name",
          "required": false,
          "deprecated": false
        },
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of header to tokenize instead of using the message body.",
          "title": "Header Name",
          "required": false,
          "deprecated": false
        },
        "regex": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "If the token is a regular expression pattern. The default value is false",
          "title": "Regex",
          "required": false,
          "deprecated": false
        },
        "xml": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether the input is XML messages. This option must be set to true if working with XML payloads.",
          "title": "Xml",
          "required": false,
          "deprecated": false
        },
        "includeTokens": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to include the tokens in the parts when using pairs The default value is false",
          "title": "Include Tokens",
          "required": false,
          "deprecated": false
        },
        "group": {
          "kind": "attribute",
          "type": "string",
          "description": "To group N parts together for example to split big files into chunks of 1000 lines. You can use simple language as the group to support dynamic group sizes.",
          "title": "Group",
          "required": false,
          "deprecated": false
        },
        "skipFirst": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "To skip the very first element",
          "title": "Skip First",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xpath": {
      "type": "object",
      "title": "XPath",
      "group": "language,core,xml",
      "icon": "generic24.png",
      "description": "To use XPath (XML) in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "documentType": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of class for document type The default value is org.w3c.dom.Document",
          "title": "Document Type",
          "required": false,
          "deprecated": false
        },
        "resultType": {
          "kind": "attribute",
          "type": "string",
          "defaultValue": "NODESET",
          "enum": [ "BOOLEAN", "NODE", "NODESET", "NUMBER", "STRING" ],
          "description": "Sets the class name of the result type (type from output) The default result type is NodeSet",
          "title": "Result Type",
          "required": false,
          "deprecated": false
        },
        "saxon": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to use Saxon.",
          "title": "Saxon",
          "required": false,
          "deprecated": false
        },
        "factoryRef": {
          "kind": "attribute",
          "type": "string",
          "description": "References to a custom XPathFactory to lookup in the registry",
          "title": "Factory Ref",
          "required": false,
          "deprecated": false
        },
        "objectModel": {
          "kind": "attribute",
          "type": "string",
          "description": "The XPath object model to use",
          "title": "Object Model",
          "required": false,
          "deprecated": false
        },
        "logNamespaces": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to log namespaces which can assist during trouble shooting",
          "title": "Log Namespaces",
          "required": false,
          "deprecated": false
        },
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of header to use as input instead of the message body",
          "title": "Header Name",
          "required": false,
          "deprecated": false
        },
        "threadSafety": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "false",
          "description": "Whether to enable thread-safety for the returned result of the xpath expression. This applies to when using NODESET as the result type and the returned set has multiple elements. In this situation there can be thread-safety issues if you process the NODESET concurrently such as from a Camel Splitter EIP in parallel processing mode. This option prevents concurrency issues by doing defensive copies of the nodes. It is recommended to turn this option on if you are using camel-saxon or Saxon in your application. Saxon has thread-safety issues which can be prevented by turning this option on.",
          "title": "Thread Safety",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xquery": {
      "type": "object",
      "title": "XQuery",
      "group": "language,xml",
      "icon": "generic24.png",
      "description": "To use XQuery (XML) in Camel expressions or predicates.",
      "properties": {
        "expression": {
          "kind": "value",
          "type": "string",
          "description": "The expression value in your chosen language syntax",
          "title": "Expression",
          "required": true,
          "deprecated": false
        },
        "type": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the class name of the result type (type from output) The default result type is NodeSet",
          "title": "Type",
          "required": false,
          "deprecated": false
        },
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of header to use as input instead of the message body",
          "title": "Header Name",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    },
    "xtokenize": {
      "type": "object",
      "title": "XML Tokenize",
      "group": "language,core,xml",
      "icon": "generic24.png",
      "description": "To use Camel message body or header with a XML tokenizer in Camel expressions or predicates.",
      "properties": {
        "headerName": {
          "kind": "attribute",
          "type": "string",
          "description": "Name of header to tokenize instead of using the message body.",
          "title": "Header Name",
          "required": false,
          "deprecated": false
        },
        "mode": {
          "kind": "attribute",
          "type": "string",
          "description": "The extraction mode. The available extraction modes are: i - injecting the contextual namespace bindings into the extracted token (default) w - wrapping the extracted token in its ancestor context u - unwrapping the extracted token to its child content t - extracting the text content of the specified element",
          "title": "Mode",
          "required": false,
          "deprecated": false
        },
        "group": {
          "kind": "attribute",
          "type": "integer",
          "description": "To group N parts together",
          "title": "Group",
          "required": false,
          "deprecated": false
        },
        "trim": {
          "kind": "attribute",
          "type": "boolean",
          "defaultValue": "true",
          "description": "Whether to trim the value to remove leading and trailing whitespaces and line breaks",
          "title": "Trim",
          "required": false,
          "deprecated": false
        },
        "id": {
          "kind": "attribute",
          "type": "string",
          "description": "Sets the id of this node",
          "title": "Id",
          "required": false,
          "deprecated": false
        }
      }
    }
  }
}
