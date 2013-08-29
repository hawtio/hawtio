module ES {

    // Function to test if a property is empty, not null
    export function isEmptyObject(value) {
        return $.isEmptyObject(value);
    }

    // Search Angular Controller used by ES
    export function SearchCtrl($scope, $location, $log, ejsResource) {

        // Retrieve by default parameters from config.js
        //var defaultEsServer = $scope.defaultEsServer = "http://localhost:9200";
        var esServer = $scope.esServer = config["elasticsearch"];
        var query = $scope.queryTerm = config["query"];
        var facetField = $scope.facetField = "tags";
        var facetType = $scope.facetType = "terms";
        var index = $scope.indice = config["indice"];
        var type = $scope.docType = config["doctype"];
        var ejs;
        var request;
        $scope.log = $log;

        /* Define search function that will be called when a user
         submits a Query String search
         Query syntax : *
         Query syntax : field: 'value'
         Query syntax : field: 'value' AND field: 'value'
         Query syntax : field: 'value' OR field: 'value'
         where value corresponds to text to search ortext + * symbol
         */
        $scope.search = function () {

            if (isEmptyObject(ejs)) {
                console.log("Init EJS server");
                ejs = initElasticsearchServer(esServer);
            }

            // Initialize ES Server to send request
            setupEsRequest();

            // Setup Query String
            request = request
                    .query(ejs.QueryStringQuery(query));

            // Run query
            var results = request.doSearch();

            console.log("Do Elastic Search");

            results.then(function (results) {

                //$location.path("/elasticjs");

                // Reset field after search
                $scope.queryTerm = "";

                if (typeof results.error != 'undefined') {

                    // Message should be displayed in the web page as a modal window
                    console.error("ES error : " + results.error);

                    // Solution proposed by kibana3
                    // $scope.panel.error = $scope.parse_error(results.error);
                    return;
                }

                console.log(results.hits.total + " : results retrieved");
                $scope.results = results;

            });

        };

        $scope.facetTermsSearch = function() {

            if (isEmptyObject(ejs)) {
                console.log("Init EJS server");
                ejs = initElasticsearchServer(esServer);
            }

            // Initialize ES Server to send request
            setupEsRequest();

            if (!isEmptyObject($scope.facetField)) {
                facetField = $scope.facetField;
            }

            if (!isEmptyObject($scope.facetType)) {
                facetType = $scope.facetType;
            }

            // Setup QueryString and Facets
            request = request
                    .query(ejs.QueryStringQuery(query))
                    .facet(
                        ejs.TermsFacet("termFacet")
                            .field(facetField)
                            .size(50)
                    )
            ;

            // Run query
            var results = request.doSearch();

            console.log("Do Elastic Search");

            results.then(function (results) {

                //$location.path("/elasticjs");

                // Reset field after search
                $scope.queryTerm = "";

                if (typeof results.error != 'undefined') {

                    // Message should be displayed in the web page as a modal window
                    console.error("ES error : " + results.error);

                    // Solution proposed by kibana3
                    // $scope.panel.error = $scope.parse_error(results.error);
                    return;
                }

                console.log(results.hits.total + " : results retrieved");
                $scope.results = results;

            });

        };

        $scope.facetDateHistogramSearch = function() {

            if (isEmptyObject(ejs)) {
                console.log("Init EJS server");
                ejs = initElasticsearchServer(esServer);
            }

            // Initialize ES Server to send request
            setupEsRequest();

            if (!isEmptyObject($scope.facetField)) {
                facetField = $scope.facetField;
            }

            if (!isEmptyObject($scope.facetType)) {
                facetType = $scope.facetType;
            }

            // Setup QueryString and Facets
            request = request
                    .query(ejs.QueryStringQuery(query))
                    .facet(
                            ejs.DateHistogramFacet("dateHistoFacet")
                                    .field(facetField)
                                    .interval("minute")
                    )
            ;

            // Run query
            var results = request.doSearch();

            console.log("Do Elastic Search");

            results.then(function (results) {

                //$location.path("/elasticjs");

                // Reset field after search
                $scope.queryTerm = "";

                if (typeof results.error != 'undefined') {

                    // Message should be displayed in the web page as a modal window
                    console.error("ES error : " + results.error);

                    // Solution proposed by kibana3
                    // $scope.panel.error = $scope.parse_error(results.error);
                    return;
                }

                console.log(results.hits.total + " : results retrieved");
                $scope.results = results;

            });

        };

        // index the sample documents using data
        // coming from json file
        $scope.indexSampleDocs = function () {

            var host = "http://" + location.host;

            if (isEmptyObject(ejs)) {
                console.log("EJS object is not defined - create it - setupEsRequest");
                ejs = initElasticsearchServer(esServer);
            }

            // Load json records from JSON file
            // & create elastcsearch document
            var docs = [];
            $.getJSON(host + "/hawtio/app/elasticsearch/js/data.json", function (result) {
                $.each(result, function (i, field) {
                    console.log("Field : " + field);
                    docs[i] = ejs.Document(index, type, i).source(field)
                    docs[i].refresh(true).doIndex();
                });
            });

            // Using sugarjs & ECMA5 forEach
            /*
             var doSearch = ( $scope.search ).after(docs.length);
             docs.forEach(function (doc) {
             console.log("Do Index called");
             doc.refresh(true).doIndex(doSearch);
             });
             */

        };

        function setupEsRequest(){

            console.log("ES Server = " + $scope.esServer);
            console.log("Indice = " + $scope.indice);
            console.log("Type = " + $scope.docType);
            console.log("Query = " + $scope.queryTerm);

            if (!isEmptyObject($scope.indice)) {
                index = $scope.indice;
            }

            if (!isEmptyObject($scope.esServer)) {
                esServer = $scope.esServer;
            }

            if (!isEmptyObject($scope.docType)) {
                type = $scope.docType;
            }

            if (!isEmptyObject($scope.queryTerm)) {
                query = $scope.queryTerm;
            }

            var ejs = ejsResource($scope.esServer);

            // Define Request to call ES
            request = ejs.Request()
                    .indices(index)
                    .types(type);

            console.log("Request to call ElasticSearch defined");
        }

        function initElasticsearchServer(esServer) {
            return ejsResource(esServer);
        }

        $scope.parse_error = function (data) {
            var _error = data.match("nested: (.*?);");
            return _error == null ? data : _error[1];
        };

    }
}