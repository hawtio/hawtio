var _apacheCamelModel = {
  "nodes": {
     "from": {
        "title":    "From",
        "group":   "Endpoints",
        "description":  "Consumes from an endpoint",
        "tootip":  "Consumes from an endpoint",
        "icon":     "endpoint24.png",
      },
     "to": {
        "title":    "To",
        "group":   "Endpoints",
        "description":  "Sends messages to an endpoint",
        "tootip":  "Sends messages to an endpoint",
        "icon":     "endpoint24.png",
      },
     "route": {
        "title":    "Route",
        "group":   "",
        "description":  "A collection of EIP steps",
        "tootip":  "A collection of EIP steps",
        "icon":     "route24.png",
      },

     "aggregate": {
      "title":    "Aggregate",
      "group":   "Routing",
      "description":  "Aggregate",
      "tootip":  "Aggregate",
      "icon":     "aggregate24.png",

    },
     "AOP": {
      "title":    "AOP",
      "group":   "Miscellaneous",
      "description":  "AOP",
      "tootip":  "AOP",
      "icon":     "generic24.png",

    },
     "bean": {
      "title":    "Bean",
      "group":   "Endpoints",
      "description":  "Bean",
      "tootip":  "Bean",
      "icon":     "bean24.png",

    },
     "catch": {
      "title":    "Catch",
      "group":   "Control Flow",
      "description":  "Catch",
      "tootip":  "Catch",
      "icon":     "generic24.png",

    },
     "choice": {
      "title":    "Choice",
      "group":   "Routing",
      "description":  "Choice",
      "tootip":  "Choice",
      "icon":     "choice24.png",

    },
     "convertBody": {
      "title":    "Convert Body",
      "group":   "Transformation",
      "description":  "Convert Body",
      "tootip":  "Convert Body",
      "icon":     "convertBody24.png",

    },
     "delay": {
      "title":    "Delay",
      "group":   "Control Flow",
      "description":  "Delay",
      "tootip":  "Delay",
      "icon":     "generic24.png",

    },
     "dynamicRouter": {
      "title":    "Dynamic Router",
      "group":   "Routing",
      "description":  "Dynamic Router",
      "tootip":  "Dynamic Router",
      "icon":     "dynamicRouter24.png",

    },
     "enrich": {
      "title":    "Enrich",
      "group":   "Transformation",
      "description":  "Enrich",
      "tootip":  "Enrich",
      "icon":     "enrich24.png",

    },
     "filter": {
      "title":    "Filter",
      "group":   "Routing",
      "description":  "Filter",
      "tootip":  "Filter",
      "icon":     "filter24.png",

    },
     "finally": {
      "title":    "Finally",
      "group":   "Control Flow",
      "description":  "Finally",
      "tootip":  "Finally",
      "icon":     "generic24.png",

    },
     "idempotentConsumer": {
      "title":    "Idempotent Consumer",
      "group":   "Routing",
      "description":  "Idempotent Consumer",
      "tootip":  "Idempotent Consumer",
      "icon":     "idempotentConsumer24.png",

    },
     "inOnly": {
      "title":    "In Only",
      "group":   "Transformation",
      "description":  "In Only",
      "tootip":  "In Only",
      "icon":     "transform24.png",

    },
     "inOut": {
      "title":    "In Out",
      "group":   "Transformation",
      "description":  "In Out",
      "tootip":  "In Out",
      "icon":     "transform24.png",

    },
     "intercept": {
      "title":    "Intercept",
      "group":   "Control Flow",
      "description":  "Intercept",
      "tootip":  "Intercept",
      "icon":     "generic24.png",

    },
     "interceptFrom": {
      "title":    "Intercept From",
      "group":   "Control Flow",
      "description":  "Intercept From",
      "tootip":  "Intercept From",
      "icon":     "generic24.png",

    },
     "interceptSendToEndpoint": {
      "title":    "Intercept Send To Endpoint",
      "group":   "Control Flow",
      "description":  "Intercept Send To Endpoint",
      "tootip":  "Intercept Send To Endpoint",
      "icon":     "generic24.png",

    },
     "loadBalance": {
      "title":    "Load Balance",
      "group":   "Routing",
      "description":  "Load Balance",
      "tootip":  "Load Balance",
      "icon":     "loadBalance24.png",

    },
     "log": {
      "title":    "Log",
      "group":   "Endpoints",
      "description":  "Log",
      "tootip":  "Log",
      "icon":     "log24.png",

    },
     "loop": {
      "title":    "Loop",
      "group":   "Control Flow",
      "description":  "Loop",
      "tootip":  "Loop",
      "icon":     "generic24.png",

    },
     "marshal": {
      "title":    "Marshal",
      "group":   "Transformation",
      "description":  "Marshal",
      "tootip":  "Marshal",
      "icon":     "marshal24.png",

    },
     "multicast": {
      "title":    "Multicast",
      "group":   "Routing",
      "description":  "Multicast",
      "tootip":  "Multicast",
      "icon":     "multicast24.png",

    },
     "onCompletion": {
      "title":    "On Completion",
      "group":   "Control Flow",
      "description":  "On Completion",
      "tootip":  "On Completion",
      "icon":     "generic24.png",

    },
     "onException": {
      "title":    "On Exception",
      "group":   "Control Flow",
      "description":  "On Exception",
      "tootip":  "On Exception",
      "icon":     "generic24.png",

    },
     "otherwise": {
      "title":    "Otherwise",
      "group":   "Routing",
      "description":  "Otherwise",
      "tootip":  "Otherwise",
      "icon":     "generic24.png",

    },
     "pipeline": {
      "title":    "Pipeline",
      "group":   "Routing",
      "description":  "Pipeline",
      "tootip":  "Pipeline",
      "icon":     "pipeline24.png",

    },
     "policy": {
      "title":    "Policy",
      "group":   "Miscellaneous",
      "description":  "Policy",
      "tootip":  "Policy",
      "icon":     "generic24.png",

    },
     "pollEnrich": {
      "title":    "Poll Enrich",
      "group":   "Transformation",
      "description":  "Poll Enrich",
      "tootip":  "Poll Enrich",
      "icon":     "pollEnrich24.png",

    },
     "process": {
      "title":    "Process",
      "group":   "Endpoints",
      "description":  "Process",
      "tootip":  "Process",
      "icon":     "process24.png",

    },
     "recipientList": {
      "title":    "Recipient List",
      "group":   "Routing",
      "description":  "Recipient List",
      "tootip":  "Recipient List",
      "icon":     "recipientList24.png",

    },
     "removeHeader": {
      "title":    "Remove Header",
      "group":   "Transformation",
      "description":  "Remove Header",
      "tootip":  "Remove Header",
      "icon":     "transform24.png",

    },
     "removeHeaders": {
      "title":    "Remove Headers",
      "group":   "Transformation",
      "description":  "Remove Headers",
      "tootip":  "Remove Headers",
      "icon":     "transform24.png",

    },
     "removeProperty": {
      "title":    "Remove Property",
      "group":   "Transformation",
      "description":  "Remove Property",
      "tootip":  "Remove Property",
      "icon":     "transform24.png",

    },
     "resequence": {
      "title":    "Resequence",
      "group":   "Routing",
      "description":  "Resequence",
      "tootip":  "Resequence",
      "icon":     "resequence24.png",

    },
     "rollback": {
      "title":    "Rollback",
      "group":   "Control Flow",
      "description":  "Rollback",
      "tootip":  "Rollback",
      "icon":     "generic24.png",

    },
     "route": {
      "title":    "Route",
      "group":   "Miscellaneous",
      "description":  "Route",
      "tootip":  "Route",
      "icon":     "route24.png",

    },
     "routingSlip": {
      "title":    "Routing Slip",
      "group":   "Routing",
      "description":  "Routing Slip",
      "tootip":  "Routing Slip",
      "icon":     "routingSlip24.png",

    },
     "sampling": {
      "title":    "Sampling",
      "group":   "Miscellaneous",
      "description":  "Sampling",
      "tootip":  "Sampling",
      "icon":     "generic24.png",

    },
     "setBody": {
      "title":    "Set Body",
      "group":   "Transformation",
      "description":  "Set Body",
      "tootip":  "Set Body",
      "icon":     "setBody24.png",

    },
     "setExchangePattern": {
      "title":    "Set Exchange Pattern",
      "group":   "Transformation",
      "description":  "Set Exchange Pattern",
      "tootip":  "Set Exchange Pattern",
      "icon":     "transform24.png",

    },
     "setFaultBody": {
      "title":    "Set Fault Body",
      "group":   "Transformation",
      "description":  "Set Fault Body",
      "tootip":  "Set Fault Body",
      "icon":     "transform24.png",

    },
     "setHeader": {
      "title":    "Set Header",
      "group":   "Transformation",
      "description":  "Set Header",
      "tootip":  "Set Header",
      "icon":     "transform24.png",

    },
     "setOutHeader": {
      "title":    "Set Out Header",
      "group":   "Transformation",
      "description":  "Set Out Header",
      "tootip":  "Set Out Header",
      "icon":     "transform24.png",

    },
     "setProperty": {
      "title":    "Set Property",
      "group":   "Transformation",
      "description":  "Set Property",
      "tootip":  "Set Property",
      "icon":     "transform24.png",

    },
     "sort": {
      "title":    "Sort",
      "group":   "Routing",
      "description":  "Sort",
      "tootip":  "Sort",
      "icon":     "generic24.png",

    },
     "split": {
      "title":    "Split",
      "group":   "Routing",
      "description":  "Split",
      "tootip":  "Split",
      "icon":     "split24.png",

    },
     "stop": {
      "title":    "Stop",
      "group":   "Miscellaneous",
      "description":  "Stop",
      "tootip":  "Stop",
      "icon":     "generic24.png",

    },
     "threads": {
      "title":    "Threads",
      "group":   "Miscellaneous",
      "description":  "Threads",
      "tootip":  "Threads",
      "icon":     "generic24.png",

    },
     "throttle": {
      "title":    "Throttle",
      "group":   "Control Flow",
      "description":  "Throttle",
      "tootip":  "Throttle",
      "icon":     "generic24.png",

    },
     "throwException": {
      "title":    "Throw Exception",
      "group":   "Control Flow",
      "description":  "Throw Exception",
      "tootip":  "Throw Exception",
      "icon":     "generic24.png",

    },
     "transacted": {
      "title":    "Transacted",
      "group":   "Control Flow",
      "description":  "Transacted",
      "tootip":  "Transacted",
      "icon":     "generic24.png",

    },
     "transform": {
      "title":    "Transform",
      "group":   "Transformation",
      "description":  "Transform",
      "tootip":  "Transform",
      "icon":     "transform24.png",

    },
     "try": {
      "title":    "Try",
      "group":   "Control Flow",
      "description":  "Try",
      "tootip":  "Try",
      "icon":     "generic24.png",

    },
     "unmarshal": {
      "title":    "Unmarshal",
      "group":   "Transformation",
      "description":  "Unmarshal",
      "tootip":  "Unmarshal",
      "icon":     "unmarshal24.png",

    },
     "validate": {
      "title":    "Validate",
      "group":   "Miscellaneous",
      "description":  "Validate",
      "tootip":  "Validate",
      "icon":     "generic24.png",

    },
     "when": {
      "title":    "When",
      "group":   "Routing",
      "description":  "When",
      "tootip":  "When",
      "icon":     "generic24.png",

    },
     "wireTap": {
      "title":    "Wire Tap",
      "group":   "Routing",
      "description":  "Wire Tap",
      "tootip":  "Wire Tap",
      "icon":     "wireTap24.png",

    },
	}
};
