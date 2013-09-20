module Fabric {

  export var startMaps = () => {};

  export function MapController($scope, $templateCache, jolokia) {
    $scope.myMarkers = [];
    $scope.containers = {};
    $scope.template = "";

    $scope.start = () => {

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

      $scope.template = $templateCache.get("pageTemplate");
    };

    Fabric.startMaps = $scope.start

    $('body').append('<script type="text/javascript" src="//maps.google.com/maps/api/js?sensor=false&async=2&callback=Fabric.startMaps"></script>');

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
            // TODO parse into 2 strings?
            var values = geoLocation.split(",");
            if (values.length >= 2) {
              var lattitude = Core.parseFloatValue(values[0], "lattitude");
              var longitude = Core.parseFloatValue(values[1], "longitude");
              if (lattitude && longitude) {
                var marker = containerData.marker;
                if (addMarker || !marker) {
                  marker = new google.maps.Marker({
                    map: $scope.myMap,
                    position: new google.maps.LatLng(lattitude, longitude),
                    title:container.id
                  });
                  containerData.marker = marker;
                  $scope.myMarkers.push(marker);
                  if ($scope.myMarkers.length === 1) {
                    // lets jump to this as the centre
                    if ($scope.myMap) {
                      $scope.myMap.panTo(marker.getPosition());
                    }
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
        Core.$apply($scope);
      }
    }
  }
}
