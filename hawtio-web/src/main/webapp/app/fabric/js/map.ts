/// <reference path="fabricPlugin.ts"/>
module Fabric {

  export var startMaps = () => {};

  _module.controller("Fabric.MapController", ["$scope", "$templateCache", "jolokia", ($scope, $templateCache, jolokia) => {
    $scope.myMarkers = [];
    $scope.containers = {};
    $scope.template = "";
    $scope.first = true;
    $scope.myMap = null;

    $scope.start = () => {

      // must have initial map options
      $scope.mapOptions = {
        center: new google.maps.LatLng(35.784, -78.670),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: 'containers()',
        arguments: []
      }, onSuccess(render));
    };

    Fabric.startMaps = $scope.start

    $('body').append('<script type="text/javascript" src="//maps.google.com/maps/api/js?sensor=false&async=2&callback=Fabric.startMaps"></script>');

    // TODO: adding markers on map to place containers is not (yet) supported
    /*
    $scope.addMarker = function ($event) {
      $scope.myMarkers.push(new google.maps.Marker({
        map: $scope.myMap,
        position: $event.latLng
      }));
    };

    $scope.setZoomMessage = function (zoom) {
      //$scope.zoomMessage = 'You just zoomed to ' + zoom + '!';
      console.log(zoom, 'zoomed')
    };

    $scope.openMarkerInfo = function (marker) {
      $scope.currentMarker = marker;
      $scope.currentMarkerLat = marker.getPosition().lat();
      $scope.currentMarkerLng = marker.getPosition().lng();
      $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.setMarkerPosition = function (marker, lat, lng) {
      marker.setPosition(new google.maps.LatLng(lat, lng));
    };
    */

    function render(response) {
      if (response && response.value) {
        response.value.forEach(function (container) {
          var addMarker = false;
          var id = container.id;
          var containerData = $scope.containers[id];
          if (!containerData) {
            containerData = {
              name: id,
            };

            $scope.containers[id] = containerData;
            addMarker = true;
          }
          containerData.alive = container.alive;
          containerData.version = container.versionId;
          containerData.profileIds = container.profileIds;

          var geoLocation = container["geoLocation"];
          if (geoLocation) {
            var values = geoLocation.split(",");
            if (values.length >= 2) {
              var lattitude = Core.parseFloatValue(values[0], "lattitude");
              var longitude = Core.parseFloatValue(values[1], "longitude");
              if (lattitude && longitude) {
                // only add marker if we got the map initialized
                if ($scope.myMap) {
                  var marker = containerData.marker;
                  if (addMarker || !marker) {
                    log.info("Adding marker as we have map " + $scope.myMap);
                    marker = new google.maps.Marker({
                      position: new google.maps.LatLng(lattitude, longitude),
                      map: $scope.myMap,
                      title: container.id,
                      tooltip: "(lattitude: " + lattitude + ", longitude: " + longitude + ")"
                    });
                    containerData.marker = marker;
                    $scope.myMarkers.push(marker);
                  }
                } else {
                  // lets update the marker in case the container moved ;)
                  if (containerData.marker) {
                    containerData.marker.position = new google.maps.LatLng(lattitude, longitude);
                  }
                }
                // lets update the container data
                containerData.lattitude = lattitude;
                containerData.longitude = longitude;
              }
            }
          }
        });

        // if there is only 1 container then jump to it asap
        if ($scope.myMarkers.length > 0 && $scope.first) {
          // lets jump to this as the centre
          if ($scope.myMap) {
            var marker = $scope.myMarkers[0];
            log.info("Auto selecting first container on map: " + marker.title);
            $scope.myMap.panTo(marker.getPosition());
            $scope.first = false;
          }
        }

        // only assign template to scope so we only draw map when we are ready
        $scope.template = $templateCache.get("pageTemplate");

        Core.$apply($scope);
      }
    }
  }]);
}
