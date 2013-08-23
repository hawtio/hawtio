module ES {

    // Function to test if a property is empty, not null
    export function isEmptyObject(value) {
        return $.isEmptyObject(value);
    }


    // Search Angular Controller used by ES
    export function SearchCtrl($scope, $location, $log, ejsResource) {

        // Retrieve by default parameters from config.js
        //var defaultEsServer = $scope.defaultEsServer = "http://localhost:9200";
        var defaultEsServer = $scope.defaultEsServer = config["elasticsearch"];
        var query = $scope.queryTerm = config["query"];
        var index = $scope.indice = config["indice"];
        var type = $scope.docType = config["doctype"];
        var ejs = ejsResource(defaultEsServer);
        $scope.log = $log;

        // setup the indices and types to search across
        var request;

        $scope.parse_error = function(data) {
            var _error = data.match("nested: (.*?);");
            return _error == null ? data : _error[1];
        };

        // define our search function that will be called when a user
        // submits a search
        $scope.search = function () {

            console.log("Search button called");
            console.log("ES Server = " + $scope.defaultEsServer);
            console.log("Indice value = " + $scope.indice);
            console.log("Indice = " + index);
            console.log("Type value = " + $scope.docType);
            console.log("Type = " + type);

            if (!isEmptyObject($scope.indice)) {
                index = $scope.indice;
            } else {
                index = 'twitter';
            }

            if (!isEmptyObject($scope.docType)) {
                type = $scope.docType;
            } else {
                type = 'tweet';
            }

            // Call ES server
            var ejs = ejsResource($scope.defaultEsServer);

            // Define Request to call ES
            var request = ejs.Request()
                    .indices(index)
                    .types(type);

            // Setup query
            request = request
                    .query(ejs.QueryStringQuery(query));

            // Run query
            var results = request.doSearch();

            results.then(function(results) {

                //$location.path("/elasticjs");

                // Reset fields after search
                $scope.queryTerm = "";
                $scope.indice = "";
                $scope.docType = "";

                if (typeof results.error != 'undefined') {

                    // Message should be displayed in the web page as a modal window
                    console.error("Cannot connect to the ES Server");

                    // Solution proposed by kibana3
                    // $scope.panel.error = $scope.parse_error(results.error);
                    return;
                }

                console.log( results.length + " : results retrieved");
                $scope.results = results;

            });

        };

        // index the sample documents
        $scope.indexSampleDocs = function () {

            // our example documents
            var docs = [
                ejs.Document(index, type, '1').source({
                    user: 'mrweber',
                    postedDate: '2013-08-22T18:30:00',
                    message: 'Elastic.js - a Javascript implementation of the ElasticSearch Query DSL and Core API'}),

                ejs.Document(index, type, '2').source({
                    user: 'egaumer',
                    postedDate: '2013-08-22T18:25:00',
                    message: 'FullScale Labs just released Elastic.js go check it out!'
                }),

                ejs.Document(index, type, '3').source({
                    user: 'dataintensive',
                    postedDate: '2013-08-22T18:10:00',
                    message: 'We are pleased to announce Elastic.js an implementation of the #elasticsearch query dsl'
                }),

                ejs.Document(index, type, '4').source({
                    user: 'kimchy',
                    postedDate: '2013-08-22T18:10:00',
                    message: 'The FullScale Labs team are awesome!  Go check out Elastic.js'
                }),

                ejs.Document(index, type, '5').source({
                    user: 'egaumer',
                    postedDate: '2013-08-22T18:05:00',
                    message: 'Use elastic.js to write a complex query and translate it to json with our query translator'
                }),

                ejs.Document(index, type, '6').source({
                    user: 'cmoulliard',
                    postedDate: '2013-08-22T18:30:00',
                    message: 'Elastic.js - a Javascript implementation of the ElasticSearch Query DSL and Core API'}),

                ejs.Document(index, type, '7').source({
                    user: 'cmoulliard',
                    postedDate: '2013-08-22T18:25:00',
                    message: 'FullScale Labs just released Elastic.js go check it out!'
                }),

                ejs.Document(index, type, '8').source({
                    user: 'jstrachan',
                    postedDate: '2013-08-22T18:10:00',
                    message: 'We are pleased to announce Elastic.js an implementation of the #elasticsearch query dsl'
                }),

                ejs.Document(index, type, '9').source({
                    user: 'davclaus',
                    postedDate: '2013-08-22T18:10:00',
                    message: 'The FullScale Labs team are awesome!  Go check out Elastic.js'
                }),

                ejs.Document(index, type, '10').source({
                    user: 'egaumer',
                    postedDate: '2013-08-22T18:05:00',
                    message: 'Use elastic.js to write a complex query and translate it to json with our query translator'
                })
            ];

            // Using sugarjs & ECMA5 forEach
            var doSearch = ( $scope.search ).after(docs.length);
            docs.forEach(function (doc) {
                doc.refresh(true).doIndex(doSearch);
            });

        };

    };
}