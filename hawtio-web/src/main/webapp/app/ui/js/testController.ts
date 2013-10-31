module UI {

    export function UITestController2($scope, workspace, $templateCache) {

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

      $scope.autoDropDown = $templateCache.get("autoDropDownTemplate");
      $scope.zeroClipboard = $templateCache.get("zeroClipboardTemplate");

      $scope.popoverEx = $templateCache.get("myTemplate");
      $scope.popoverUsageEx = $templateCache.get("popoverExTemplate");

      $scope.autoColumnEx = $templateCache.get("autoColumnTemplate");


    }


    export function UITestController1($scope, workspace, $templateCache) {


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

    $scope.showDeleteOne = new Core.Dialog();
    $scope.showDeleteTwo = new Core.Dialog();

    $scope.fileUploadEx1 = '<div hawtio-file-upload="files" target="test1"></div>';
    $scope.fileUploadEx2 = '<div hawtio-file-upload="files" target="test2" show-files="false"></div>';
    $scope.fileUploadExMode = 'text/html';

    $scope.colorPickerEx = 'My Color ({{myColor}}): <div hawtio-color-picker="myColor"></div>';

    $scope.confirmationEx1 = '' +
        '<button class="btn" ng-click="showDeleteOne.open()">Delete Stuff</button>\n' +
        '\n' +
        '<div hawtio-confirm-dialog="showDeleteOne.show"\n' +
        'title="Delete Stuff?"\n' +
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
        '<button class="btn" ng-click="showDeleteTwo.open()">Delete Other Stuff</button>\n' +
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
        '<button class="btn" ng-click="showSlideoutRight = !showSlideoutRight">Show Slideout Right</button>\n' +
        '<div hawtio-slideout="showSlideoutRight" title="Hey look a slider!">\n' +
        '   <div class="dialog-body">\n' +
        '     <div>\n' +
        '       Here is some content or whatever {{transcludedValue}}\n' +
        '     </div>\n' +
        '   </div>\n' +
        '</div>';

    $scope.sliderEx2 = '' +
        '<button class="btn" ng-click="showSlideoutLeft = !showSlideoutLeft">Show Slideout Left</button>\n' +
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
      notification('info', 'cancelled ' + number);
    }

    $scope.onOk = (number) => {
      notification('info', number + ' ok!');
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


  }

}
