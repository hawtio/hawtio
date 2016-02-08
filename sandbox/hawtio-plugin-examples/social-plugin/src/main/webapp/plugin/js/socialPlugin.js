/**
 * @module SOCIAL
 * @main SOCIAL
 *
 * The main entrypoint for the Social module
 *
 */
 var SOCIAL = (function (SOCIAL) {

    SOCIAL.pluginName = "SOCIAL";
    SOCIAL.log = Logger.get(SOCIAL.pluginName);

    SOCIAL.templatePath = '/social/plugin/html/';
    SOCIAL.templateDocPath = '/social/plugin/doc/';

    SOCIAL.jmxDomain = "hawtio";
    SOCIAL.mbeanType = "SocialMedia";
    SOCIAL.attribute = "PublishData";
    SOCIAL.mbean = SOCIAL.jmxDomain + ":type=" + SOCIAL.mbeanType;
    SOCIAL.startMap = function() {
    };

    SOCIAL.module = angular.module(SOCIAL.pluginName, ['ui', 'bootstrap', 'ui.bootstrap', 'ui.bootstrap.modal', 'ngResource', 'ngGrid', 'hawtioCore', 'hawtio-ui', 'hawtio-forms'])
    .config(function ($routeProvider) {
        $routeProvider.
        when('/social/chart', { templateUrl: SOCIAL.templatePath + 'areachart.html' }).
        when('/social/tweets', { templateUrl: SOCIAL.templatePath + 'searchtweets.html' }).
        when('/social/user', { templateUrl: SOCIAL.templatePath + 'userinfo.html' });
    });

    SOCIAL.module.run(function (workspace, viewRegistry, helpRegistry) {

        // tell the app to use the full layout, also could use layoutTree
        // to get the JMX tree or provide a URL to a custom layout
        //viewRegistry["social"] = layoutTree;
        viewRegistry["social"] = SOCIAL.templatePath + 'layout.html';
        helpRegistry.addUserDoc('social', SOCIAL.templateDocPath + 'help.md');

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
            id: "social",
            content: "Social",
            title: "Social plugin loaded dynamically",
            isValid: function () {
                return true;
            },
            href: function () {
                return "#/social/tweets";
            },
            isActive: function (workspace) {
                return workspace.isTopTabActive("social");
            }
        });

        /**
         * By default tabs are pulled from the "container" perspective, here
         * we can define includes or excludes to customize the available tabs
         * in hawtio.  Use "href" to match from the start of a URL and "rhref"
         * to match a URL via regex string.
         */
         Core.pathSet(Perspective, ['metadata', 'example'], {
            label: "Example",
            lastPage: "#/social/user",
            isValid: function (workspace) {
                return true;
            },
            topLevelTabs: {
                includes: [{
                    href: "#/social"
                }]
            }
        });


     });

SOCIAL.SocialController = function ($scope, jolokia) {
    $scope.message = "Data collected from Social Camel Component";
    $scope.likes = "0"

        // register a watch with jolokia on this mbean to
        // get updated metrics
        Core.register(jolokia, $scope, {
            type: 'read',
            mbean: SOCIAL.mbean
        }, onSuccess(render));

        // update display of metric
        function render(response) {
            $scope.likes = response.value['PublishData'];
            $scope.$apply();
        }

    }

    SOCIAL.FormController = function ($scope, $log, $http, jolokia, workspace, $location) {
        SOCIAL.log.info('FormController - starting up, yeah!');
        $scope.form = {};
        $scope.username = '';
        $scope.keywords = '';
        $scope.reponse = '';

        $scope.isReply = false;

        $scope.id = '';
        $scope.name = '';
        $scope.screenName = '';
        $scope.location = '';
        $scope.description = '';
        $scope.followersCount = '';
        $scope.friendsCount = '';
        $scope.favouritesCount = '';
        $scope.timeZone = '';
        $scope.lang = '';
        $scope.createdAt = '';

        /*        $scope.expectedLen = 0;*/

        $scope.tweetsGrid = {
            data: 'tweets',
            enableRowClickSelection: false,
            showSelectionCheckbox: false,
            columnDefs: [
            {
                field: 'tweet',
                displayName: 'Tweet',
                resizable: true,
                width: 1500
            }
            ]
        }

        $scope.hover = function (isReply) {
            // Shows/hides the delete button on hover
            return $scope.isReply = false;
        };


        $scope.searchUser = function () {
            if (Core.isBlank($scope.username)) {
                return;
            }
            SOCIAL.log.debug("User searched : " + $scope.username);

            jolokia.request({
                type: 'exec',
                mbean: SOCIAL.mbean,
                operation: 'userInfo',
                arguments: [$scope.username]
            }, {
                method: 'POST',
                success: function (response) {
                    /* TextArea = Response
                     $scope.response = JSON.stringify(response);
                     */

                     $scope.isReply = true;

                     value = JSON.parse(response['value']);
                     $scope.id = value['id'];
                     $scope.name = value['name'];
                     $scope.screenName = value['screenName'];
                     $scope.location = value['location'];
                     $scope.description = value['description'];
                     $scope.followersCount = value['followersCount'];
                     $scope.friendsCount = value['friendsCount'];
                     $scope.favouritesCount = value['favouritesCount'];
                     $scope.timeZone = value['timeZone'];
                     $scope.lang = value['lang'];
                     $scope.createdAt = value['createdAt'];

                    // Reset Username field
                    $scope.username = '';

                    Core.$apply($scope);
                },
                error: function (response) {
                    SOCIAL.log.warn("Failed to search for Tweets: ", response.error);
                    SOCIAL.log.info("Stack trace: ", response.stacktrace);
                    Core.$apply($scope);
                }

            })
};


$scope.searchTweets = function () {
    if (Core.isBlank($scope.keywords)) {
        return;
    }
    SOCIAL.log.debug("Search for : " + $scope.keywords);

    jolokia.request({
        type: 'exec',
        mbean: SOCIAL.mbean,
        operation: 'searchTweets',
        arguments: [$scope.keywords]
    }, {
        method: 'POST',
        success: function (response) {
            /* TextArea = Response */
            list = response.value;
            result = "";
            for (var record in list) {
                result += list[record] + String.fromCharCode(13);
            }
            $scope.response = result;

            /* Simple Table */
                    //$scope.tweets = response.value;
                    $scope.tweets = response.value.map(function (val) {
                        return { tweet: val };
                    });

                    SOCIAL.log.debug("tweets: ", response.value);

                    // Reset keywords field
                    $scope.keywords = '';

                    Core.$apply($scope);
                },
                error: function (response) {
                    SOCIAL.log.warn("Failed to search for Tweets: ", response.error);
                    SOCIAL.log.info("Stack trace: ", response.stacktrace);
                    Core.$apply($scope);
                }

            })
};

};

SOCIAL.AreaChartController = function ($scope, $routeParams, jolokia, $templateCache, localStorage, $element) {

    $scope.width = 1280;
    $scope.height = 300;
    $scope.delay = 0;
    $scope.duration = 0;
    $scope.label = "Nber of Likes"

    $scope.template = "";
    $scope.entries = [];

    $scope.data = {
        entries: $scope.entries
    };

    $scope.req = [
    {type: 'read',
    mbean: SOCIAL.mbean,
    attribute: SOCIAL.attribute
}
];

function render(response) {
    $scope.entries.push({
        time: response.timestamp,
        count: response.value
    });

    $scope.entries = $scope.entries.last(15);

    if ($scope.template === "") {
        $scope.template = $templateCache.get("areaChart");
    }

    $scope.data = {
        _type: "date_histogram",
        entries: $scope.entries
    };

    Core.$apply($scope);
}

Core.register(jolokia, $scope, $scope.req, onSuccess(render));
}

/*    SOCIAL.MapController = function ($scope, $timeout) {

        //$('body').append('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=onGoogleReady"></script><script>function onGoogleReady(){angular.bootstrap(document.getElementById("map"),["SOCIAL"]);}</script>');

        if (!$scope.myMap) {
            $scope.model = {
                myMap: undefined
            };
        }

        if (!$scope.myMarkers) {
            $scope.myMarkers = [];
        }

        var mapInitFlag = false;
        $scope.showMap = function(){
            $scope.isShow = !$scope.isShow;
            if(!mapInitFlag)
            {
                $timeout(function(){
                    google.maps.event.trigger($scope.myMap,'resize');
                    mapInitFlag=true;
                    console.log('adjust map');
                });
            }
        };

        $scope.address = "Florennes, BE";

*//*        $scope.start = function() {

            debugger;

            // must have initial map options
            $scope.mapOptions = {
                center: new google.maps.LatLng(35.784, -78.670),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.isShow = !$scope.isShow;
        }

        SOCIAL.startMap = $scope.start;*//*

        *//*
        $('body').append('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=SOCIAL.startMap"></script>');
        *//*

        // must have initial map options
        $scope.mapOptions = {
            center: new google.maps.LatLng(35.784, -78.670),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.codeAddress = function () {
            var address = $scope.address;
            geocoder = new google.maps.Geocoder();

            geocoder.geocode({ 'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    var latlng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    var mapOptions = {
                        zoom: 15,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    }
                    $scope.myMap = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);


                    // Add it after rendering of the map otherwise, don't appear
                    var marker = new google.maps.Marker({
                        map: $scope.myMap,
                        position: results[0].geometry.location
                    });
                    $scope.myMarkers.push(marker);

                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        };

*//*        // only assign template to scope so we only draw map when we are ready
        $scope.template = $templateCache.get("pageTemplate");*//*

    };*/
    return SOCIAL;
}(SOCIAL || { }));

hawtioPluginLoader.addModule(SOCIAL.pluginName);