module Wiki {
  export function DozerMappingsController($scope, $location, $routeParams, workspace:Workspace, jolokia, wikiRepository:GitWikiRepository) {
    Wiki.initScope($scope, $routeParams, $location);

    $scope.schema = {};
    $scope.addDialog = new Core.Dialog();
    $scope.propertiesDialog = new Core.Dialog();
    $scope.deleteDialog = false;

    $scope.selectedItems = [];
    $scope.mappings = [];

    // lets customize the schemas
    io_hawt_dozer_schema_Field["tabs"] = {
      'Fields': ['a.value', 'b.value'],
      'From Field': ['a\\..*'],
      'To Field': ['b\\..*'],
      'Field Configuration': ['*']
    };
    io_hawt_dozer_schema_Mapping["tabs"] = {
      'Classes': ['class-a.value', 'class-b.value'],
      'From Class': ['class-a\\..*'],
      'To Class': ['class-b\\..*'],
      'Class Configuration': ['*']
    };
    // hide the fields table from the class configuration tab
    io_hawt_dozer_schema_Mapping.properties.fieldOrFieldExclude.hidden = true;

    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "a", "properties", "value", "label"], "From Field");
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "b", "properties", "value", "label"], "To Field");

    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-a", "properties", "value", "label"], "From Class");
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-b", "properties", "value", "label"], "To Class");

    // ignore prefixes in the generated labels
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "a", "ignorePrefixInLabel"], true);
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "b", "ignorePrefixInLabel"], true);
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-a", "ignorePrefixInLabel"], true);
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-b", "ignorePrefixInLabel"], true);

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'mappings',
      displayFooter: false,
      showFilter: false,
      //sortInfo: { field: 'timestamp', direction: 'DESC'},
      filterOptions: {
        filterText: "searchText"
      },
      columnDefs: [
        {
          field: 'class_a',
          displayName: 'From',
          cellTemplate: '<div class="ngCellText">{{row.entity.class_a.name}}</div>'
        },
        {
          field: 'class_b',
          displayName: 'To',
          cellTemplate: '<div class="ngCellText">{{row.entity.class_b.name}}</div>'
        }
      ]
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });


    $scope.addAndCloseDialog = () => {
      /*
       var nodeModel = $scope.selectedNodeModel();
       if (nodeModel) {
       addNewNode(nodeModel);
       }
       */
      $scope.addDialog.close();
    };

    $scope.canDelete = () => {
      return $scope.selectedFolder ? true : false;
    };

    $scope.removeNode = () => {
      if ($scope.selectedFolder && $scope.treeNode) {
        // TODO deal with deleting fields
        var folder = $scope.selectedFolder;
        var entity = folder.entity;
        if (entity instanceof Dozer.Field) {
          // lets remove this from the parent mapping
          var mapping = Core.pathGet(folder, ["parent", "entity"]);
          if (mapping) {
            mapping.fields.remove(entity);
          }
        }
        $scope.selectedFolder.detach();
        $scope.treeNode.remove();
        $scope.selectedFolder = null;
        $scope.treeNode = null;
      }
    };

    $scope.save = () => {
      console.log("Saving the dozer mapping file!");
      if ($scope.model) {
        // lets copy the mappings from the tree
        //var model = $scope.model;
        var model = Dozer.loadModelFromTree($scope.rootTreeNode, $scope.model);
        var text = Dozer.saveToXmlText(model);
        if (text) {
          console.log("saving model " + text);

          var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
          wikiRepository.putPage($scope.branch, $scope.pageId, text, commitMessage, (status) => {
            Wiki.onComplete(status);
            goToView();
            Core.$apply($scope);
          });
        }
      }
    };

    $scope.cancel = () => {
      console.log("cancelling...");
      // TODO show dialog if folks are about to lose changes...
    };

    $scope.addMapping = () => {
      var treeNode = $scope.rootTreeNode;
      if (treeNode) {
        var parentFolder = treeNode.data;
        var mapping = new Dozer.Mapping();
        var addedNode = Dozer.createMappingFolder(mapping, parentFolder);
        var added = treeNode.addChild(addedNode);
        if (added) {
          added.expand(true);
          added.select(true);
          added.activate(true);
        }
        console.log("added!");
      }
    };

    $scope.onRootTreeNode = (rootTreeNode) => {
      $scope.rootTreeNode = rootTreeNode;
    };

    $scope.onNodeSelect = (folder, treeNode) => {
      $scope.selectedFolder = folder;
      $scope.treeNode = treeNode;
      $scope.propertiesTemplate = null;
      $scope.dozerEntity = null;
      $scope.selectedDescription = "";
      if (folder) {
        var entity = folder.entity;
        $scope.dozerEntity = entity;
        var propertiesTemplate = "app/wiki/html/dozerPropertiesEdit.html";
        if (entity instanceof Dozer.Field) {
          //var field: Dozer.Field = entity;
          $scope.propertiesTemplate = propertiesTemplate;
          $scope.nodeModel = io_hawt_dozer_schema_Field;
          $scope.selectedDescription = "Field Mapping";
        }
        else if (entity instanceof Dozer.Mapping) {
          //var mapping: Dozer.Mapping = entity;
          $scope.propertiesTemplate = propertiesTemplate;
          $scope.nodeModel = io_hawt_dozer_schema_Mapping;
          $scope.selectedDescription = "Class Mapping";
        }
      }
      Core.$apply($scope);
    };


    updateView();

    function updateView() {
      $scope.pageId = Wiki.pageId($routeParams, $location);
      if (Git.getGitMBean(workspace)) {
        $scope.git = wikiRepository.getPage($scope.branch, $scope.pageId, $scope.objectId, onResults);
      }
    }

    function onResults(response) {
      var text = response.text;
      if (text) {
        // lets remove any dodgy characters so we can use it as a DOM id
        $scope.model = Dozer.loadDozerModel(text, $scope.pageId);
        $scope.mappings = Core.pathGet($scope.model, ["mappings"]);
        //console.log("Has mappings " + JSON.stringify($scope.mappings, null, '  '));
        $scope.mappingTree = Dozer.createDozerTree($scope.model);
      } else {
        console.log("No XML found for page " + $scope.pageId);
      }
      Core.$applyLater($scope);
    }

    function goToView() {
      // TODO lets navigate to the view if we have a separate view one day :)
      /*
       if ($scope.breadcrumbs && $scope.breadcrumbs.length > 1) {
       var viewLink = $scope.breadcrumbs[$scope.breadcrumbs.length - 2];
       console.log("goToView has found view " + viewLink);
       var path = Core.trimLeading(viewLink, "#");
       $location.path(path);
       } else {
       console.log("goToView has no breadcrumbs!");
       }
       */
    }
  }
}