angular.module("mapApp", ['ui.map'])
.controller("mapCtrl", function ($scope, $timeout) {

  if (!$scope.myMap) {
    $scope.model = {
      myMap: undefined
    };
  }

  if (!$scope.myMarkers) {
    $scope.myMarkers = [];
  }

  $scope.address = "Florennes, BE"

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
  }

});