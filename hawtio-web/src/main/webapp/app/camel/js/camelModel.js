var _apacheCamelModel = {
  "nodes": {
     "from": {
        "title":    "From",
        "group":   "Endpoints",
        "description":  "Consumes from an endpoint",
        "tootip":  "Consumes from an endpoint",
        "icon":     "endpoint24.png"
      },
     "to": {
        "title":    "To",
        "group":   "Endpoints",
        "description":  "Sends messages to an endpoint",
        "tootip":  "Sends messages to an endpoint",
        "icon":     "endpoint24.png"
      },
     "route": {
        "title":    "Route",
        "group":   "",
        "description":  "A collection of EIP steps",
        "tootip":  "A collection of EIP steps",
        "icon":     "route24.png"
      },

     "aggregate": {
      "title":    "Aggregate",
      "group":   "Routing",
      "description":  "Aggregate",
      "tootip":  "Aggregate",
      "icon":     "aggregate24.png",
      "properties": [
          {
          "id":     "correlationexpression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"correlationExpression",
          "tooltip":"correlationExpression",
															          "title":  "correlationExpression"
        },
          {
          "id":     "completionpredicate",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"completionPredicate",
          "tooltip":"completionPredicate",
															          "title":  "completionPredicate"
        },
          {
          "id":     "completiontimeoutexpression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"completionTimeoutExpression",
          "tooltip":"completionTimeoutExpression",
															          "title":  "completionTimeoutExpression"
        },
          {
          "id":     "completionsizeexpression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"completionSizeExpression",
          "tooltip":"completionSizeExpression",
															          "title":  "completionSizeExpression"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "timeoutcheckerexecutorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"timeoutCheckerExecutorServiceRef",
          "tooltip":"timeoutCheckerExecutorServiceRef",
															          "title":  "timeoutCheckerExecutorServiceRef"
        },
          {
          "id":     "aggregationrepositoryref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"aggregationRepositoryRef",
          "tooltip":"aggregationRepositoryRef",
															          "title":  "aggregationRepositoryRef"
        },
          {
          "id":     "strategyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"strategyRef",
          "tooltip":"strategyRef",
															          "title":  "strategyRef"
        },
          {
          "id":     "parallelprocessing",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"parallelProcessing",
          "tooltip":"parallelProcessing",
															          "title":  "parallelProcessing"
        },
          {
          "id":     "completionsize",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"completionSize",
          "tooltip":"completionSize",
															          "title":  "completionSize"
        },
          {
          "id":     "completioninterval",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"completionInterval",
          "tooltip":"completionInterval",
															          "title":  "completionInterval"
        },
          {
          "id":     "completiontimeout",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"completionTimeout",
          "tooltip":"completionTimeout",
															          "title":  "completionTimeout"
        },
          {
          "id":     "completionfrombatchconsumer",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"completionFromBatchConsumer",
          "tooltip":"completionFromBatchConsumer",
															          "title":  "completionFromBatchConsumer"
        },
          {
          "id":     "groupexchanges",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"groupExchanges",
          "tooltip":"groupExchanges",
															          "title":  "groupExchanges"
        },
          {
          "id":     "eagercheckcompletion",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"eagerCheckCompletion",
          "tooltip":"eagerCheckCompletion",
															          "title":  "eagerCheckCompletion"
        },
          {
          "id":     "ignoreinvalidcorrelationkeys",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"ignoreInvalidCorrelationKeys",
          "tooltip":"ignoreInvalidCorrelationKeys",
															          "title":  "ignoreInvalidCorrelationKeys"
        },
          {
          "id":     "closecorrelationkeyoncompletion",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"closeCorrelationKeyOnCompletion",
          "tooltip":"closeCorrelationKeyOnCompletion",
															          "title":  "closeCorrelationKeyOnCompletion"
        },
          {
          "id":     "discardoncompletiontimeout",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"discardOnCompletionTimeout",
          "tooltip":"discardOnCompletionTimeout",
															          "title":  "discardOnCompletionTimeout"
        },
          {
          "id":     "forcecompletiononstop",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"forceCompletionOnStop",
          "tooltip":"forceCompletionOnStop",
															          "title":  "forceCompletionOnStop"
        },
        ]
    },
     "AOP": {
      "title":    "AOP",
      "group":   "Miscellaneous",
      "description":  "AOP",
      "tootip":  "AOP",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "beforeuri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"beforeUri",
          "tooltip":"beforeUri",
															          "title":  "beforeUri"
        },
          {
          "id":     "afteruri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"afterUri",
          "tooltip":"afterUri",
															          "title":  "afterUri"
        },
          {
          "id":     "afterfinallyuri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"afterFinallyUri",
          "tooltip":"afterFinallyUri",
															          "title":  "afterFinallyUri"
        },
        ]
    },
     "bean": {
      "title":    "Bean",
      "group":   "Endpoints",
      "description":  "Bean",
      "tootip":  "Bean",
      "icon":     "bean24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	              "type":   "combo",
				"kind":   "beanRef",
				"title": "Select a bean...",
	    	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
          {
          "id":     "method",
				  				    
				  	      
					"type":   "combo",
					"kind": "beanMethod",
          "title":'Select a method...',
      	        "type":   "string",
          
          "description":"method",
          "tooltip":"method",
															          "title":  "method"
        },
          {
          "id":     "beantype",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"beanType",
          "tooltip":"beanType",
															          "title":  "beanType"
        },
        ]
    },
     "catch": {
      "title":    "Catch",
      "group":   "Control Flow",
      "description":  "Catch",
      "tootip":  "Catch",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "exceptions",
				  				    
				  	      
      	        "type":   "java.util.List",
          
          "description":"exceptions",
          "tooltip":"exceptions",
															          "title":  "exceptions"
        },
          {
          "id":     "handled",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"handled",
          "tooltip":"handled",
															          "title":  "handled"
        },
        ]
    },
     "choice": {
      "title":    "Choice",
      "group":   "Routing",
      "description":  "Choice",
      "tootip":  "Choice",
      "icon":     "choice24.png",
      "properties": [
        ]
    },
     "convertBody": {
      "title":    "Convert Body",
      "group":   "Transformation",
      "description":  "Convert Body",
      "tootip":  "Convert Body",
      "icon":     "convertBody24.png",
      "properties": [
          {
          "id":     "type",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"type",
          "tooltip":"type",
															          "title":  "type"
        },
          {
          "id":     "charset",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"charset",
          "tooltip":"charset",
															          "title":  "charset"
        },
        ]
    },
     "delay": {
      "title":    "Delay",
      "group":   "Control Flow",
      "description":  "Delay",
      "tootip":  "Delay",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "asyncdelayed",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"asyncDelayed",
          "tooltip":"asyncDelayed",
															          "title":  "asyncDelayed"
        },
          {
          "id":     "callerrunswhenrejected",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"callerRunsWhenRejected",
          "tooltip":"callerRunsWhenRejected",
															          "title":  "callerRunsWhenRejected"
        },
        ]
    },
     "dynamicRouter": {
      "title":    "Dynamic Router",
      "group":   "Routing",
      "description":  "Dynamic Router",
      "tootip":  "Dynamic Router",
      "icon":     "dynamicRouter24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "uridelimiter",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uriDelimiter",
          "tooltip":"uriDelimiter",
															          "title":  "uriDelimiter"
        },
          {
          "id":     "ignoreinvalidendpoints",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"ignoreInvalidEndpoints",
          "tooltip":"ignoreInvalidEndpoints",
															          "title":  "ignoreInvalidEndpoints"
        },
        ]
    },
     "enrich": {
      "title":    "Enrich",
      "group":   "Transformation",
      "description":  "Enrich",
      "tootip":  "Enrich",
      "icon":     "enrich24.png",
      "properties": [
          {
          "id":     "resourceuri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"resourceUri",
          "tooltip":"resourceUri",
															          "title":  "resourceUri"
        },
          {
          "id":     "aggregationstrategyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"aggregationStrategyRef",
          "tooltip":"aggregationStrategyRef",
															          "title":  "aggregationStrategyRef"
        },
        ]
    },
     "filter": {
      "title":    "Filter",
      "group":   "Routing",
      "description":  "Filter",
      "tootip":  "Filter",
      "icon":     "filter24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
        ]
    },
     "finally": {
      "title":    "Finally",
      "group":   "Control Flow",
      "description":  "Finally",
      "tootip":  "Finally",
      "icon":     "generic24.png",
      "properties": [
        ]
    },
     "idempotentConsumer": {
      "title":    "Idempotent Consumer",
      "group":   "Routing",
      "description":  "Idempotent Consumer",
      "tootip":  "Idempotent Consumer",
      "icon":     "idempotentConsumer24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "messageidrepositoryref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"messageIdRepositoryRef",
          "tooltip":"messageIdRepositoryRef",
															          "title":  "messageIdRepositoryRef"
        },
          {
          "id":     "eager",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"eager",
          "tooltip":"eager",
															          "title":  "eager"
        },
          {
          "id":     "skipduplicate",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"skipDuplicate",
          "tooltip":"skipDuplicate",
															          "title":  "skipDuplicate"
        },
          {
          "id":     "removeonfailure",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"removeOnFailure",
          "tooltip":"removeOnFailure",
															          "title":  "removeOnFailure"
        },
        ]
    },
     "inOnly": {
      "title":    "In Only",
      "group":   "Transformation",
      "description":  "In Only",
      "tootip":  "In Only",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "uri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uri",
          "tooltip":"uri",
															          "title":  "uri"
        },
        ]
    },
     "inOut": {
      "title":    "In Out",
      "group":   "Transformation",
      "description":  "In Out",
      "tootip":  "In Out",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "uri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uri",
          "tooltip":"uri",
															          "title":  "uri"
        },
        ]
    },
     "intercept": {
      "title":    "Intercept",
      "group":   "Control Flow",
      "description":  "Intercept",
      "tootip":  "Intercept",
      "icon":     "generic24.png",
      "properties": [
        ]
    },
     "interceptFrom": {
      "title":    "Intercept From",
      "group":   "Control Flow",
      "description":  "Intercept From",
      "tootip":  "Intercept From",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "uri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uri",
          "tooltip":"uri",
															          "title":  "uri"
        },
        ]
    },
     "interceptSendToEndpoint": {
      "title":    "Intercept Send To Endpoint",
      "group":   "Control Flow",
      "description":  "Intercept Send To Endpoint",
      "tootip":  "Intercept Send To Endpoint",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "uri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uri",
          "tooltip":"uri",
															          "title":  "uri"
        },
          {
          "id":     "skipsendtooriginalendpoint",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"skipSendToOriginalEndpoint",
          "tooltip":"skipSendToOriginalEndpoint",
															          "title":  "skipSendToOriginalEndpoint"
        },
        ]
    },
     "loadBalance": {
      "title":    "Load Balance",
      "group":   "Routing",
      "description":  "Load Balance",
      "tootip":  "Load Balance",
      "icon":     "loadBalance24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
          {
          "id":     "loadbalancertype",
				  				    
						"elements": {
						  				       "failover": "org.apache.camel.model.loadbalancer.FailoverLoadBalancerDefinition",
						  				       "random": "org.apache.camel.model.loadbalancer.RandomLoadBalancerDefinition",
						  				       "custom": "org.apache.camel.model.loadbalancer.CustomLoadBalancerDefinition",
						  				       "roundRobin": "org.apache.camel.model.loadbalancer.RoundRobinLoadBalancerDefinition",
						  				       "sticky": "org.apache.camel.model.loadbalancer.StickyLoadBalancerDefinition",
						  				       "topic": "org.apache.camel.model.loadbalancer.TopicLoadBalancerDefinition",
						  				       "weighted": "org.apache.camel.model.loadbalancer.WeightedLoadBalancerDefinition",
						  							},
				  	      
      	        "type":   "org.apache.camel.model.LoadBalancerDefinition",
          
          "description":"loadBalancerType",
          "tooltip":"loadBalancerType",
															          "title":  "loadBalancerType"
        },
        ]
    },
     "log": {
      "title":    "Log",
      "group":   "Endpoints",
      "description":  "Log",
      "tootip":  "Log",
      "icon":     "log24.png",
      "properties": [
          {
          "id":     "message",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"message",
          "tooltip":"message",
															          "title":  "message"
        },
          {
          "id":     "logname",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"logName",
          "tooltip":"logName",
															          "title":  "logName"
        },
          {
          "id":     "marker",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"marker",
          "tooltip":"marker",
															          "title":  "marker"
        },
          {
          "id":     "logginglevel",
				  				    
				  	      
      	        "type":   "org.apache.camel.LoggingLevel",
          
          "description":"loggingLevel",
          "tooltip":"loggingLevel",
															          "title":  "loggingLevel"
        },
        ]
    },
     "loop": {
      "title":    "Loop",
      "group":   "Control Flow",
      "description":  "Loop",
      "tootip":  "Loop",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "copy",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"copy",
          "tooltip":"copy",
															          "title":  "copy"
        },
        ]
    },
     "marshal": {
      "title":    "Marshal",
      "group":   "Transformation",
      "description":  "Marshal",
      "tootip":  "Marshal",
      "icon":     "marshal24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
          {
          "id":     "dataformattype",
				  				    
						"elements": {
						  				       "avro": "org.apache.camel.model.dataformat.AvroDataFormat",
						  				       "beanio": "org.apache.camel.model.dataformat.BeanioDataFormat",
						  				       "bindy": "org.apache.camel.model.dataformat.BindyDataFormat",
						  				       "c24io": "org.apache.camel.model.dataformat.C24IODataFormat",
						  				       "castor": "org.apache.camel.model.dataformat.CastorDataFormat",
						  				       "crypto": "org.apache.camel.model.dataformat.CryptoDataFormat",
						  				       "csv": "org.apache.camel.model.dataformat.CsvDataFormat",
						  				       "custom": "org.apache.camel.model.dataformat.CustomDataFormat",
						  				       "flatpack": "org.apache.camel.model.dataformat.FlatpackDataFormat",
						  				       "gzip": "org.apache.camel.model.dataformat.GzipDataFormat",
						  				       "hl7": "org.apache.camel.model.dataformat.HL7DataFormat",
						  				       "jaxb": "org.apache.camel.model.dataformat.JaxbDataFormat",
						  				       "jibx": "org.apache.camel.model.dataformat.JibxDataFormat",
						  				       "json": "org.apache.camel.model.dataformat.JsonDataFormat",
						  				       "protobuf": "org.apache.camel.model.dataformat.ProtobufDataFormat",
						  				       "rss": "org.apache.camel.model.dataformat.RssDataFormat",
						  				       "secureXML": "org.apache.camel.model.dataformat.XMLSecurityDataFormat",
						  				       "serialization": "org.apache.camel.model.dataformat.SerializationDataFormat",
						  				       "soapjaxb": "org.apache.camel.model.dataformat.SoapJaxbDataFormat",
						  				       "string": "org.apache.camel.model.dataformat.StringDataFormat",
						  				       "syslog": "org.apache.camel.model.dataformat.SyslogDataFormat",
						  				       "tidyMarkup": "org.apache.camel.model.dataformat.TidyMarkupDataFormat",
						  				       "xmlBeans": "org.apache.camel.model.dataformat.XMLBeansDataFormat",
						  				       "xmljson": "org.apache.camel.model.dataformat.XmlJsonDataFormat",
						  				       "xstream": "org.apache.camel.model.dataformat.XStreamDataFormat",
						  				       "pgp": "org.apache.camel.model.dataformat.PGPDataFormat",
						  				       "zip": "org.apache.camel.model.dataformat.ZipDataFormat",
						  							},
				  	      
      	        "type":   "org.apache.camel.model.DataFormatDefinition",
          
          "description":"dataFormatType",
          "tooltip":"dataFormatType",
															          "title":  "dataFormatType"
        },
        ]
    },
     "multicast": {
      "title":    "Multicast",
      "group":   "Routing",
      "description":  "Multicast",
      "tootip":  "Multicast",
      "icon":     "multicast24.png",
      "properties": [
          {
          "id":     "strategyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"strategyRef",
          "tooltip":"strategyRef",
															          "title":  "strategyRef"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "onprepareref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"onPrepareRef",
          "tooltip":"onPrepareRef",
															          "title":  "onPrepareRef"
        },
          {
          "id":     "parallelprocessing",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"parallelProcessing",
          "tooltip":"parallelProcessing",
															          "title":  "parallelProcessing"
        },
          {
          "id":     "streaming",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"streaming",
          "tooltip":"streaming",
															          "title":  "streaming"
        },
          {
          "id":     "stoponexception",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"stopOnException",
          "tooltip":"stopOnException",
															          "title":  "stopOnException"
        },
          {
          "id":     "timeout",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"timeout",
          "tooltip":"timeout",
															          "title":  "timeout"
        },
          {
          "id":     "shareunitofwork",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"shareUnitOfWork",
          "tooltip":"shareUnitOfWork",
															          "title":  "shareUnitOfWork"
        },
        ]
    },
     "onCompletion": {
      "title":    "On Completion",
      "group":   "Control Flow",
      "description":  "On Completion",
      "tootip":  "On Completion",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "oncompleteonly",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"onCompleteOnly",
          "tooltip":"onCompleteOnly",
															          "title":  "onCompleteOnly"
        },
          {
          "id":     "onfailureonly",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"onFailureOnly",
          "tooltip":"onFailureOnly",
															          "title":  "onFailureOnly"
        },
          {
          "id":     "useoriginalmessagepolicy",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"useOriginalMessagePolicy",
          "tooltip":"useOriginalMessagePolicy",
															          "title":  "useOriginalMessagePolicy"
        },
        ]
    },
     "onException": {
      "title":    "On Exception",
      "group":   "Control Flow",
      "description":  "On Exception",
      "tootip":  "On Exception",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "exceptions",
				  				    
				  	      
      	        "type":   "java.util.List",
          
          "description":"exceptions",
          "tooltip":"exceptions",
															          "title":  "exceptions"
        },
          {
          "id":     "retrywhile",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"retryWhile",
          "tooltip":"retryWhile",
															          "title":  "retryWhile"
        },
          {
          "id":     "redeliverypolicyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"redeliveryPolicyRef",
          "tooltip":"redeliveryPolicyRef",
															          "title":  "redeliveryPolicyRef"
        },
          {
          "id":     "handled",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"handled",
          "tooltip":"handled",
															          "title":  "handled"
        },
          {
          "id":     "continued",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"continued",
          "tooltip":"continued",
															          "title":  "continued"
        },
          {
          "id":     "onredeliveryref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"onRedeliveryRef",
          "tooltip":"onRedeliveryRef",
															          "title":  "onRedeliveryRef"
        },
          {
          "id":     "redeliverypolicy",
				  				    
				  	      
      	        "type":   "org.apache.camel.model.RedeliveryPolicyDefinition",
          
          "description":"redeliveryPolicy",
          "tooltip":"redeliveryPolicy",
															          "title":  "redeliveryPolicy"
        },
          {
          "id":     "useoriginalmessagepolicy",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"useOriginalMessagePolicy",
          "tooltip":"useOriginalMessagePolicy",
															          "title":  "useOriginalMessagePolicy"
        },
        ]
    },
     "otherwise": {
      "title":    "Otherwise",
      "group":   "Routing",
      "description":  "Otherwise",
      "tootip":  "Otherwise",
      "icon":     "generic24.png",
      "properties": [
        ]
    },
     "pipeline": {
      "title":    "Pipeline",
      "group":   "Routing",
      "description":  "Pipeline",
      "tootip":  "Pipeline",
      "icon":     "pipeline24.png",
      "properties": [
        ]
    },
     "policy": {
      "title":    "Policy",
      "group":   "Miscellaneous",
      "description":  "Policy",
      "tootip":  "Policy",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
        ]
    },
     "pollEnrich": {
      "title":    "Poll Enrich",
      "group":   "Transformation",
      "description":  "Poll Enrich",
      "tootip":  "Poll Enrich",
      "icon":     "pollEnrich24.png",
      "properties": [
          {
          "id":     "resourceuri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"resourceUri",
          "tooltip":"resourceUri",
															          "title":  "resourceUri"
        },
          {
          "id":     "aggregationstrategyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"aggregationStrategyRef",
          "tooltip":"aggregationStrategyRef",
															          "title":  "aggregationStrategyRef"
        },
          {
          "id":     "timeout",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"timeout",
          "tooltip":"timeout",
															          "title":  "timeout"
        },
        ]
    },
     "process": {
      "title":    "Process",
      "group":   "Endpoints",
      "description":  "Process",
      "tootip":  "Process",
      "icon":     "process24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
        ]
    },
     "recipientList": {
      "title":    "Recipient List",
      "group":   "Routing",
      "description":  "Recipient List",
      "tootip":  "Recipient List",
      "icon":     "recipientList24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "delimiter",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"delimiter",
          "tooltip":"delimiter",
															          "title":  "delimiter"
        },
          {
          "id":     "strategyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"strategyRef",
          "tooltip":"strategyRef",
															          "title":  "strategyRef"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "onprepareref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"onPrepareRef",
          "tooltip":"onPrepareRef",
															          "title":  "onPrepareRef"
        },
          {
          "id":     "parallelprocessing",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"parallelProcessing",
          "tooltip":"parallelProcessing",
															          "title":  "parallelProcessing"
        },
          {
          "id":     "stoponexception",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"stopOnException",
          "tooltip":"stopOnException",
															          "title":  "stopOnException"
        },
          {
          "id":     "ignoreinvalidendpoints",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"ignoreInvalidEndpoints",
          "tooltip":"ignoreInvalidEndpoints",
															          "title":  "ignoreInvalidEndpoints"
        },
          {
          "id":     "streaming",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"streaming",
          "tooltip":"streaming",
															          "title":  "streaming"
        },
          {
          "id":     "timeout",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"timeout",
          "tooltip":"timeout",
															          "title":  "timeout"
        },
          {
          "id":     "shareunitofwork",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"shareUnitOfWork",
          "tooltip":"shareUnitOfWork",
															          "title":  "shareUnitOfWork"
        },
        ]
    },
     "removeHeader": {
      "title":    "Remove Header",
      "group":   "Transformation",
      "description":  "Remove Header",
      "tootip":  "Remove Header",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "headername",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"headerName",
          "tooltip":"headerName",
															          "title":  "headerName"
        },
        ]
    },
     "removeHeaders": {
      "title":    "Remove Headers",
      "group":   "Transformation",
      "description":  "Remove Headers",
      "tootip":  "Remove Headers",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "pattern",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"pattern",
          "tooltip":"pattern",
															          "title":  "pattern"
        },
          {
          "id":     "excludepattern",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"excludePattern",
          "tooltip":"excludePattern",
															          "title":  "excludePattern"
        },
        ]
    },
     "removeProperty": {
      "title":    "Remove Property",
      "group":   "Transformation",
      "description":  "Remove Property",
      "tootip":  "Remove Property",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "propertyname",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"propertyName",
          "tooltip":"propertyName",
															          "title":  "propertyName"
        },
        ]
    },
     "resequence": {
      "title":    "Resequence",
      "group":   "Routing",
      "description":  "Resequence",
      "tootip":  "Resequence",
      "icon":     "resequence24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "resequencerconfig",
				  				    
						"elements": {
						  				       "batch-config": "org.apache.camel.model.config.BatchResequencerConfig",
						  				       "stream-config": "org.apache.camel.model.config.StreamResequencerConfig",
						  							},
				  	      
      	        "type":   "org.apache.camel.model.config.ResequencerConfig",
          
          "description":"resequencerConfig",
          "tooltip":"resequencerConfig",
															          "title":  "resequencerConfig"
        },
        ]
    },
     "rollback": {
      "title":    "Rollback",
      "group":   "Control Flow",
      "description":  "Rollback",
      "tootip":  "Rollback",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "message",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"message",
          "tooltip":"message",
															          "title":  "message"
        },
          {
          "id":     "markrollbackonly",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"markRollbackOnly",
          "tooltip":"markRollbackOnly",
															          "title":  "markRollbackOnly"
        },
          {
          "id":     "markrollbackonlylast",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"markRollbackOnlyLast",
          "tooltip":"markRollbackOnlyLast",
															          "title":  "markRollbackOnlyLast"
        },
        ]
    },
     "route": {
      "title":    "Route",
      "group":   "Miscellaneous",
      "description":  "Route",
      "tootip":  "Route",
      "icon":     "route24.png",
      "properties": [
          {
          "id":     "autostartup",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"autoStartup",
          "tooltip":"autoStartup",
										
          "optional": true,
		      					          "title":  "autoStartup"
        },
          {
          "id":     "delayer",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"delayer",
          "tooltip":"delayer",
										
          "optional": true,
		      					          "title":  "delayer"
        },
          {
          "id":     "errorhandlerref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"errorHandlerRef",
          "tooltip":"errorHandlerRef",
										
          "optional": true,
		      					          "title":  "errorHandlerRef"
        },
          {
          "id":     "group",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"group",
          "tooltip":"group",
										
          "optional": true,
		      					          "title":  "group"
        },
          {
          "id":     "handlefault",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"handleFault",
          "tooltip":"handleFault",
										
          "optional": true,
		      					          "title":  "handleFault"
        },
          {
          "id":     "routepolicyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"routePolicyRef",
          "tooltip":"routePolicyRef",
										
          "optional": true,
		      					          "title":  "routePolicyRef"
        },
          {
          "id":     "streamcache",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"streamCache",
          "tooltip":"streamCache",
										
          "optional": true,
		      					          "title":  "streamCache"
        },
          {
          "id":     "trace",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"trace",
          "tooltip":"trace",
										
          "optional": true,
		      					          "title":  "trace"
        },
        ]
    },
     "routingSlip": {
      "title":    "Routing Slip",
      "group":   "Routing",
      "description":  "Routing Slip",
      "tootip":  "Routing Slip",
      "icon":     "routingSlip24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "uridelimiter",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uriDelimiter",
          "tooltip":"uriDelimiter",
															          "title":  "uriDelimiter"
        },
          {
          "id":     "ignoreinvalidendpoints",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"ignoreInvalidEndpoints",
          "tooltip":"ignoreInvalidEndpoints",
															          "title":  "ignoreInvalidEndpoints"
        },
        ]
    },
     "sampling": {
      "title":    "Sampling",
      "group":   "Miscellaneous",
      "description":  "Sampling",
      "tootip":  "Sampling",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "sampleperiod",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"samplePeriod",
          "tooltip":"samplePeriod",
															          "title":  "samplePeriod"
        },
          {
          "id":     "messagefrequency",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"messageFrequency",
          "tooltip":"messageFrequency",
															          "title":  "messageFrequency"
        },
          {
          "id":     "units",
				  				    
				  	      
      	        "type":   "java.util.concurrent.TimeUnit",
          
          "description":"units",
          "tooltip":"units",
															          "title":  "units"
        },
        ]
    },
     "setBody": {
      "title":    "Set Body",
      "group":   "Transformation",
      "description":  "Set Body",
      "tootip":  "Set Body",
      "icon":     "setBody24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
        ]
    },
     "setExchangePattern": {
      "title":    "Set Exchange Pattern",
      "group":   "Transformation",
      "description":  "Set Exchange Pattern",
      "tootip":  "Set Exchange Pattern",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "pattern",
				  				    
				  	      
      	        "type":   "org.apache.camel.ExchangePattern",
          
          "description":"pattern",
          "tooltip":"pattern",
															          "title":  "pattern"
        },
        ]
    },
     "setFaultBody": {
      "title":    "Set Fault Body",
      "group":   "Transformation",
      "description":  "Set Fault Body",
      "tootip":  "Set Fault Body",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
        ]
    },
     "setHeader": {
      "title":    "Set Header",
      "group":   "Transformation",
      "description":  "Set Header",
      "tootip":  "Set Header",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "headername",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"headerName",
          "tooltip":"headerName",
															          "title":  "headerName"
        },
        ]
    },
     "setOutHeader": {
      "title":    "Set Out Header",
      "group":   "Transformation",
      "description":  "Set Out Header",
      "tootip":  "Set Out Header",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "headername",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"headerName",
          "tooltip":"headerName",
															          "title":  "headerName"
        },
        ]
    },
     "setProperty": {
      "title":    "Set Property",
      "group":   "Transformation",
      "description":  "Set Property",
      "tootip":  "Set Property",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "propertyname",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"propertyName",
          "tooltip":"propertyName",
															          "title":  "propertyName"
        },
        ]
    },
     "sort": {
      "title":    "Sort",
      "group":   "Routing",
      "description":  "Sort",
      "tootip":  "Sort",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "comparatorref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"comparatorRef",
          "tooltip":"comparatorRef",
															          "title":  "comparatorRef"
        },
        ]
    },
     "split": {
      "title":    "Split",
      "group":   "Routing",
      "description":  "Split",
      "tootip":  "Split",
      "icon":     "split24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "strategyref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"strategyRef",
          "tooltip":"strategyRef",
															          "title":  "strategyRef"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "onprepareref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"onPrepareRef",
          "tooltip":"onPrepareRef",
															          "title":  "onPrepareRef"
        },
          {
          "id":     "parallelprocessing",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"parallelProcessing",
          "tooltip":"parallelProcessing",
															          "title":  "parallelProcessing"
        },
          {
          "id":     "streaming",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"streaming",
          "tooltip":"streaming",
															          "title":  "streaming"
        },
          {
          "id":     "stoponexception",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"stopOnException",
          "tooltip":"stopOnException",
															          "title":  "stopOnException"
        },
          {
          "id":     "timeout",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"timeout",
          "tooltip":"timeout",
															          "title":  "timeout"
        },
          {
          "id":     "shareunitofwork",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"shareUnitOfWork",
          "tooltip":"shareUnitOfWork",
															          "title":  "shareUnitOfWork"
        },
        ]
    },
     "stop": {
      "title":    "Stop",
      "group":   "Miscellaneous",
      "description":  "Stop",
      "tootip":  "Stop",
      "icon":     "generic24.png",
      "properties": [
        ]
    },
     "threads": {
      "title":    "Threads",
      "group":   "Miscellaneous",
      "description":  "Threads",
      "tootip":  "Threads",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "threadname",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"threadName",
          "tooltip":"threadName",
															          "title":  "threadName"
        },
          {
          "id":     "poolsize",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"poolSize",
          "tooltip":"poolSize",
															          "title":  "poolSize"
        },
          {
          "id":     "maxpoolsize",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"maxPoolSize",
          "tooltip":"maxPoolSize",
															          "title":  "maxPoolSize"
        },
          {
          "id":     "keepalivetime",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"keepAliveTime",
          "tooltip":"keepAliveTime",
															          "title":  "keepAliveTime"
        },
          {
          "id":     "timeunit",
				  				    
				  	      
      	        "type":   "java.util.concurrent.TimeUnit",
          
          "description":"timeUnit",
          "tooltip":"timeUnit",
															          "title":  "timeUnit"
        },
          {
          "id":     "maxqueuesize",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"maxQueueSize",
          "tooltip":"maxQueueSize",
															          "title":  "maxQueueSize"
        },
          {
          "id":     "rejectedpolicy",
				  				    
				  	      
      	        "type":   "org.apache.camel.ThreadPoolRejectedPolicy",
          
          "description":"rejectedPolicy",
          "tooltip":"rejectedPolicy",
															          "title":  "rejectedPolicy"
        },
          {
          "id":     "callerrunswhenrejected",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"callerRunsWhenRejected",
          "tooltip":"callerRunsWhenRejected",
															          "title":  "callerRunsWhenRejected"
        },
        ]
    },
     "throttle": {
      "title":    "Throttle",
      "group":   "Control Flow",
      "description":  "Throttle",
      "tootip":  "Throttle",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "timeperiodmillis",
				  				    
				  	      
      	        "type":   "number",
          
          "description":"timePeriodMillis",
          "tooltip":"timePeriodMillis",
															          "title":  "timePeriodMillis"
        },
          {
          "id":     "asyncdelayed",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"asyncDelayed",
          "tooltip":"asyncDelayed",
															          "title":  "asyncDelayed"
        },
          {
          "id":     "callerrunswhenrejected",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"callerRunsWhenRejected",
          "tooltip":"callerRunsWhenRejected",
															          "title":  "callerRunsWhenRejected"
        },
        ]
    },
     "throwException": {
      "title":    "Throw Exception",
      "group":   "Control Flow",
      "description":  "Throw Exception",
      "tootip":  "Throw Exception",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
        ]
    },
     "transacted": {
      "title":    "Transacted",
      "group":   "Control Flow",
      "description":  "Transacted",
      "tootip":  "Transacted",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
        ]
    },
     "transform": {
      "title":    "Transform",
      "group":   "Transformation",
      "description":  "Transform",
      "tootip":  "Transform",
      "icon":     "transform24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
        ]
    },
     "try": {
      "title":    "Try",
      "group":   "Control Flow",
      "description":  "Try",
      "tootip":  "Try",
      "icon":     "generic24.png",
      "properties": [
        ]
    },
     "unmarshal": {
      "title":    "Unmarshal",
      "group":   "Transformation",
      "description":  "Unmarshal",
      "tootip":  "Unmarshal",
      "icon":     "unmarshal24.png",
      "properties": [
          {
          "id":     "ref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"ref",
          "tooltip":"ref",
															          "title":  "ref"
        },
          {
          "id":     "dataformattype",
				  				    
						"elements": {
						  				       "avro": "org.apache.camel.model.dataformat.AvroDataFormat",
						  				       "beanio": "org.apache.camel.model.dataformat.BeanioDataFormat",
						  				       "bindy": "org.apache.camel.model.dataformat.BindyDataFormat",
						  				       "c24io": "org.apache.camel.model.dataformat.C24IODataFormat",
						  				       "castor": "org.apache.camel.model.dataformat.CastorDataFormat",
						  				       "crypto": "org.apache.camel.model.dataformat.CryptoDataFormat",
						  				       "csv": "org.apache.camel.model.dataformat.CsvDataFormat",
						  				       "custom": "org.apache.camel.model.dataformat.CustomDataFormat",
						  				       "flatpack": "org.apache.camel.model.dataformat.FlatpackDataFormat",
						  				       "gzip": "org.apache.camel.model.dataformat.GzipDataFormat",
						  				       "hl7": "org.apache.camel.model.dataformat.HL7DataFormat",
						  				       "jaxb": "org.apache.camel.model.dataformat.JaxbDataFormat",
						  				       "jibx": "org.apache.camel.model.dataformat.JibxDataFormat",
						  				       "json": "org.apache.camel.model.dataformat.JsonDataFormat",
						  				       "protobuf": "org.apache.camel.model.dataformat.ProtobufDataFormat",
						  				       "rss": "org.apache.camel.model.dataformat.RssDataFormat",
						  				       "secureXML": "org.apache.camel.model.dataformat.XMLSecurityDataFormat",
						  				       "serialization": "org.apache.camel.model.dataformat.SerializationDataFormat",
						  				       "soapjaxb": "org.apache.camel.model.dataformat.SoapJaxbDataFormat",
						  				       "string": "org.apache.camel.model.dataformat.StringDataFormat",
						  				       "syslog": "org.apache.camel.model.dataformat.SyslogDataFormat",
						  				       "tidyMarkup": "org.apache.camel.model.dataformat.TidyMarkupDataFormat",
						  				       "xmlBeans": "org.apache.camel.model.dataformat.XMLBeansDataFormat",
						  				       "xmljson": "org.apache.camel.model.dataformat.XmlJsonDataFormat",
						  				       "xstream": "org.apache.camel.model.dataformat.XStreamDataFormat",
						  				       "pgp": "org.apache.camel.model.dataformat.PGPDataFormat",
						  				       "zip": "org.apache.camel.model.dataformat.ZipDataFormat",
						  							},
				  	      
      	        "type":   "org.apache.camel.model.DataFormatDefinition",
          
          "description":"dataFormatType",
          "tooltip":"dataFormatType",
															          "title":  "dataFormatType"
        },
        ]
    },
     "validate": {
      "title":    "Validate",
      "group":   "Miscellaneous",
      "description":  "Validate",
      "tootip":  "Validate",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
        ]
    },
     "when": {
      "title":    "When",
      "group":   "Routing",
      "description":  "When",
      "tootip":  "When",
      "icon":     "generic24.png",
      "properties": [
          {
          "id":     "expression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"expression",
          "tooltip":"expression",
															          "title":  "expression"
        },
        ]
    },
     "wireTap": {
      "title":    "Wire Tap",
      "group":   "Routing",
      "description":  "Wire Tap",
      "tootip":  "Wire Tap",
      "icon":     "wireTap24.png",
      "properties": [
          {
          "id":     "uri",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"uri",
          "tooltip":"uri",
															          "title":  "uri"
        },
          {
          "id":     "newexchangeprocessorref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"newExchangeProcessorRef",
          "tooltip":"newExchangeProcessorRef",
															          "title":  "newExchangeProcessorRef"
        },
          {
          "id":     "newexchangeexpression",
				  				    
				  	      				"kind" : "expression",
      	        "type":   "org.apache.camel.model.language.ExpressionDefinition",
          
          "description":"newExchangeExpression",
          "tooltip":"newExchangeExpression",
															          "title":  "newExchangeExpression"
        },
          {
          "id":     "headers",
				  				    
				  	      
      	        "type":   "java.util.List",
          
          "description":"headers",
          "tooltip":"headers",
															          "title":  "headers"
        },
          {
          "id":     "executorserviceref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"executorServiceRef",
          "tooltip":"executorServiceRef",
															          "title":  "executorServiceRef"
        },
          {
          "id":     "onprepareref",
				  				    
				  	      
      	        "type":   "string",
          
          "description":"onPrepareRef",
          "tooltip":"onPrepareRef",
															          "title":  "onPrepareRef"
        },
          {
          "id":     "copy",
				  				    
				  	      
      	        "type":   "bool",
          
          "description":"copy",
          "tooltip":"copy",
															          "title":  "copy"
        },
        ]
    },
	},
	"languages": {
    "constant": {
      "name": "Constant",
      "description": "Constant expression"
    },
    "el": {
      "name": "EL",
      "description": "Unified expression language from JSP / JSTL / JSF"
    },
    "header": {
      "name": "Header",
      "description": "Header value"
    },
    "javaScript": {
      "name": "JavaScript",
      "description": "JavaScript expression"
    },
    "jxpath": {
      "name": "JXPath",
      "description": "JXPath expression"
    },
    "method": {
      "name": "Method",
      "description": "Method call expression"
    },
    "mvel": {
      "name": "MVEL",
      "description": "MVEL expression"
    },
    "ognl": {
      "name": "OGNL",
      "description": "OGNL expression"
    },
    "groovy": {
      "name": "Groovy",
      "description": "Groovy expression"
    },
    "property": {
      "name": "Property",
      "description": "Property value"
    },
    "python": {
      "name": "Python",
      "description": "Python expression"
    },
    "php": {
      "name": "PHP",
      "description": "PHP expression"
    },
    "ref": {
      "name": "Ref",
      "description": "Reference to a bean expression"
    },
    "ruby": {
      "name": "Ruby",
      "description": "Ruby expression"
    },
    "simple": {
      "name": "Simple",
      "description": "Simple expression language from Camel"
    },
    "spel": {
      "name": "Spring EL",
      "description": "Spring expression language"
    },
    "sql": {
      "name": "SQL",
      "description": "SQL expression"
    },
    "tokenize": {
      "name": "Tokenizer",
      "description": "Tokenizing expression"
    },
    "xpath": {
      "name": "XPath",
      "description": "XPath expression"
    },
    "xquery": {
      "name": "XQuery",
      "description": "XQuery expression"
    },
	}
};
