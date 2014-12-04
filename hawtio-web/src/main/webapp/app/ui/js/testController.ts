/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
/// <reference path="./dropDown.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module UI {

    _module.controller("UI.UITestController2", ["$scope", "$templateCache", ($scope, $templateCache) => {

      $scope.fileUploadExMode = 'text/html';

      $scope.menuItems = [];
      $scope.divs = [];

      for (var i = 0; i < 20; i++) {
        $scope.menuItems.push("Some Item " + i);
      }

      for (var i = 0; i < 20; i++) {
        $scope.divs.push(i + 1);
      }

      $scope.things = [
        {
          'name': 'stuff1',
          'foo1': 'bar1',
          'foo2': 'bar2'
        },
        {
          'name': 'stuff2',
          'foo3': 'bar3',
          'foo4': 'bar4'
        }
      ];

      $scope.someVal = 1;

      $scope.dropDownConfig = <UI.MenuItem>{
        icon: 'icon-cogs',
        title: 'My Awesome Menu',
        items: [{
          title: 'Some Item',
          action: 'someVal=2'
        }, {
          title: 'Some other stuff',
          icon: 'icon-twitter',
          action: 'someVal=3'
        }, {
          title: "I've got children",
          icon: 'icon-file-text',
          items: [{
            title: 'Hi!',
            action: 'someVal=4'
          }, {
            title: 'Yo!',
            items: [{
              title: 'More!',
              action: 'someVal=5'
            }, {
              title: 'Child',
              action: 'someVal=6'
            }, {
              title: 'Menus!',
              action: 'someVal=7'
            }]
          }]
        }, {
          title: "Call a function!",
          action: () => {
            Core.notification("info", "Function called!");
          }
        }]
      };
      $scope.dropDownConfigTxt = angular.toJson($scope.dropDownConfig, true);

      $scope.$watch('dropDownConfigTxt', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.dropDownConfig = angular.fromJson($scope.dropDownConfigTxt);
        }
      });

      $scope.breadcrumbSelection = 1;

      $scope.breadcrumbConfig = {
        path: '/root/first child',
        icon: 'icon-cogs',
        title: 'root',
        items: [{
          title: 'first child',
          icon: 'icon-folder-close-alt',
          items: [{
            title: "first child's first child",
            icon: 'icon-file-text'
          }]
        }, {
          title: 'second child',
          icon: 'icon-file'
        }, {
          title: "third child",
          icon: 'icon-folder-close-alt',
          items: [{
            title: "third child's first child",
            icon: 'icon-file-text'
          }, {
            title: "third child's second child",
            icon: 'icon-file-text'
          }, {
            title: "third child's third child",
            icon: 'icon-folder-close-alt',
            items: [{
              title: 'More!',
              icon: 'icon-file-text'
            }, {
              title: 'Child',
              icon: 'icon-file-text'
            }, {
              title: 'Menus!',
              icon: 'icon-file-text'
            }]
          }]
        }]
      };

      $scope.breadcrumbConfigTxt = angular.toJson($scope.breadcrumbConfig, true);

      $scope.$watch('breadcrumbConfigTxt', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.breadcrumbconfig = angular.toJson($scope.breadcrumbConfigTxt);
        }
      });

      $scope.breadcrumbEx = $templateCache.get("breadcrumbTemplate");

      $scope.dropDownEx = $templateCache.get("dropDownTemplate");

      $scope.autoDropDown = $templateCache.get("autoDropDownTemplate");
      $scope.zeroClipboard = $templateCache.get("zeroClipboardTemplate");

      $scope.popoverEx = $templateCache.get("myTemplate");
      $scope.popoverUsageEx = $templateCache.get("popoverExTemplate");

      $scope.autoColumnEx = $templateCache.get("autoColumnTemplate");


    }]);


    _module.controller("UI.UITestController1", ["$scope", "$templateCache", ($scope, $templateCache) => {


    $scope.jsplumbEx = $templateCache.get("jsplumbTemplate");

    $scope.nodes = ["node1", "node2"];
    $scope.otherNodes =["node4", "node5", "node6"];

    $scope.anchors = ["Top", "Right", "Bottom", "Left"];

    $scope.createEndpoint = (nodeId) => {
      var node = $scope.jsPlumbNodesById[nodeId]
      if (node) {

        var anchors = $scope.anchors.subtract(node.anchors);
        console.log("anchors: ", anchors);
        if (anchors && anchors.length > 0) {
          var anchor = anchors.first();
          node.anchors.push(anchor);
          node.endpoints.push($scope.jsPlumb.addEndpoint(node.el, {
            anchor: anchor,
            isSource: true,
            isTarget: true,
            maxConnections: -1
          }));
        }
      }
    };

    $scope.expandableEx = '' +
        '<div class="expandable closed">\n' +
        '   <div title="The title" class="title">\n' +
        '     <i class="expandable-indicator"></i> Expandable title\n' +
        '   </div>\n' +
        '   <div class="expandable-body well">\n' +
        '     This is the expandable content...  Note that adding the "well" class isn\'t necessary but makes for a nice inset look\n' +
        '   </div>\n' +
        '</div>'


    $scope.editablePropertyEx1 = '<editable-property ng-model="editablePropertyModelEx1" property="property"></editable-property>';

    $scope.editablePropertyModelEx1 = {
      property: "This is editable (hover to edit)"
    };

    $scope.showDeleteOne = new UI.Dialog();
    $scope.showDeleteTwo = new UI.Dialog();

    $scope.fileUploadEx1 = '<div hawtio-file-upload="files" target="test1"></div>';
    $scope.fileUploadEx2 = '<div hawtio-file-upload="files" target="test2" show-files="false"></div>';
    $scope.fileUploadExMode = 'text/html';

    $scope.colorPickerEx = 'My Color ({{myColor}}): <div hawtio-color-picker="myColor"></div>';

    $scope.confirmationEx1 = '' +
        '<button class="btn" ng-click="showDeleteOne.open()">Delete stuff</button>\n' +
        '\n' +
        '<div hawtio-confirm-dialog="showDeleteOne.show"\n' +
        'title="Delete stuff?"\n' +
        'ok-button-text="Yes, Delete the Stuff"\n' +
        'cancel-button-text="No, Keep the Stuff"\n' +
        'on-cancel="onCancelled(\'One\')"\n' +
        'on-ok="onOk(\'One\')">\n'  +
        '  <div class="dialog-body">\n' +
        '    <p>\n' +
        '        Are you sure you want to delete all the stuff?\n' +
        '    </p>\n' +
        '  </div>\n' +
        '</div>\n';

    $scope.confirmationEx2 = '' +
        '<button class="btn" ng-click="showDeleteTwo.open()">Delete other stuff</button>\n' +
        '\n' +
        '<!-- Use more defaults -->\n' +
        '<div hawtio-confirm-dialog="showDeleteTwo.show\n"' +
        '  on-cancel="onCancelled(\'Two\')"\n' +
        '  on-ok="onOk(\'Two\')">\n' +
        '  <div class="dialog-body">\n' +
        '    <p>\n' +
        '      Are you sure you want to delete all the other stuff?\n' +
        '    </p>\n' +
        '  </div>\n' +
        '</div>';


    $scope.sliderEx1 = '' +
        '<button class="btn" ng-click="showSlideoutRight = !showSlideoutRight">Show slideout right</button>\n' +
        '<div hawtio-slideout="showSlideoutRight" title="Hey look a slider!">\n' +
        '   <div class="dialog-body">\n' +
        '     <div>\n' +
        '       Here is some content or whatever {{transcludedValue}}\n' +
        '     </div>\n' +
        '   </div>\n' +
        '</div>';

    $scope.sliderEx2 = '' +
        '<button class="btn" ng-click="showSlideoutLeft = !showSlideoutLeft">Show slideout left</button>\n' +
        '<div hawtio-slideout="showSlideoutLeft" direction="left" title="Hey, another slider!">\n' +
        '   <div class="dialog-body">\n' +
        '     <div hawtio-editor="someText" mode="javascript"></div>\n' +
        '   </div>\n' +
        '</div>\n';

    $scope.editorEx1 = '' +
        'Instance 1\n' +
        '<div class="row-fluid">\n' +
        '   <div hawtio-editor="someText" mode="mode" dirty="dirty"></div>\n' +
        '   <div>Text : {{someText}}</div>\n' +
        '</div>\n' +
        '\n' +
        'Instance 2 (readonly)\n' +
        '<div class="row-fluid">\n' +
        '   <div hawtio-editor="someText" read-only="true" mode="mode" dirty="dirty"></div>\n' +
        '   <div>Text : {{someText}}</div>\n' +
        '</div>';



    $scope.transcludedValue = "and this is transcluded";

    $scope.onCancelled = (number) => {
      Core.notification('info', 'cancelled ' + number);
    }

    $scope.onOk = (number) => {
      Core.notification('info', number + ' ok!');
    }

    $scope.showSlideoutRight = false;
    $scope.showSlideoutLeft = false;

    $scope.dirty = false;
    $scope.mode = 'javascript';

    $scope.someText = "var someValue = 0;\n" +
                      "var someFunc = function() {\n" +
                      "  return \"Hello World!\";\n" +
                      "}\n";


    $scope.myColor = "#FF887C";
    $scope.showColorDialog = false;

    $scope.files = [];

    $scope.$watch('files', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        console.log("Files: ", $scope.files);
      }
    }, true);


  }]);

}
