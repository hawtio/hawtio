/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('hawtioMessagePanel', () => {
    return new UI.MessagePanel();
  });

  export class MessagePanel {
    public restrict = 'A';

    public link = ($scope, $element, $attrs) => {

      var height = "100%";
      if ('hawtioMessagePanel' in $attrs) {
        var wantedHeight = $attrs['hawtioMessagePanel'];
        if (wantedHeight && !wantedHeight.isBlank()) {
          height = wantedHeight;
        }
      }

      var speed = "1s";
      if ('speed' in $attrs) {
        var wantedSpeed = $attrs['speed'];
        if (speed && !speed.isBlank()) {
          speed = wantedSpeed;
        }
      }

      $element.css({
        position: 'absolute',
        bottom: 0,
        height: 0,
        'min-height': 0,
        transition: 'all ' + speed + ' ease-in-out'
      });


      $element.parent().mouseover(() => {
        $element.css({
          height: height,
          'min-height': 'auto'
        });
      });

      $element.parent().mouseout(() => {
        $element.css({
          height: 0,
          'min-height': 0
        });
      })
    };
  }


  _module.directive('hawtioInfoPanel', () => {
    return new UI.InfoPanel();
  });

  export class InfoPanel {
    public restrict = 'A';

    public link = ($scope, $element, $attrs) => {

      var validDirections = {
        'left': {
          side: 'right',
          out: 'width'
        },
        'right': {
          side: 'left',
          out: 'width'
        },
        'up': {
          side: 'bottom',
          out: 'height'
        },
        'down': {
          side: 'top',
          out: 'height'
        }
      };

      var direction = "right";
      if ('hawtioInfoPanel' in $attrs) {
        var wantedDirection = $attrs['hawtioInfoPanel'];
        if (wantedDirection && !wantedDirection.isBlank()) {
          if (Object.extended(validDirections).keys().any(wantedDirection)) {
            direction = wantedDirection;
          }
        }
      }

      var speed = "1s";
      if ('speed' in $attrs) {
        var wantedSpeed = $attrs['speed'];
        if (speed && !speed.isBlank()) {
          speed = wantedSpeed;
        }
      }

      var toggle="open";
      if ('toggle' in $attrs) {
        var wantedToggle = $attrs['toggle'];
        if (toggle && !toggle.isBlank()) {
          toggle = wantedToggle;
        }
      }

      var initialCss = {
        position: 'absolute',
        transition: 'all ' + speed + ' ease-in-out'
      };

      var openCss = {};
      openCss[validDirections[direction]['out']] = '100%';
      var closedCss = {};
      closedCss[validDirections[direction]['out']] = 0;

      initialCss[validDirections[direction]['side']] = 0;
      initialCss[validDirections[direction]['out']] = 0;

      $element.css(initialCss);

      $scope.$watch(toggle, (newValue, oldValue) => {
        if (Core.parseBooleanValue(newValue)) {
          $element.css(openCss);
        } else {
          $element.css(closedCss);
        }
      });

      $element.click(() => {
        $scope[toggle] = false;
        Core.$apply($scope);
      });

    };



  }

}
