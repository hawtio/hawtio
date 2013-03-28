module Wiki {
  export function EditController($scope, $location, $routeParams, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository) {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.objectId = $routeParams["objectId"];
    $scope.entity = {
      source: null
    };

    var format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    var form = null;
    if ((format && format === "javascript") || isCreate()) {
      form = $location.search()["form"];
    }

    var options = {
      mode: {
        name: format
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);


    $scope.isValid = () => $scope.fileName;

    $scope.viewLink = () => Wiki.viewLink($scope.pageId, $location, $scope.fileName);

    $scope.cancel = () => {
      goToView();
    };

    $scope.save = () => {
      saveTo($scope.pageId);
    };

    $scope.create = () => {
      // lets combine the file name with the current pageId (which is the directory)
      var path = $scope.pageId + "/" + $scope.fileName;
      console.log("creating new file at " + path);
      saveTo(path);
    };

    $scope.onSubmit = (json, form) => {
      if (isCreate()) {
        $scope.create();
      } else {
        $scope.save();
      }
    };

    $scope.onCancel = (form) => {
      setTimeout(() => {
        goToView();
        Core.$apply($scope)
      }, 50);
    };


    updateView();

    function isCreate() {
      return $location.path().startsWith("/wiki/create");
    }

    function updateView() {
      // only load the source if not in create mode
      if (isCreate()) {
        updateSourceView();
      } else {
        wikiRepository.getPage($scope.pageId, $scope.objectId, onFileContents);
      }
    }

    function onFileContents(details) {
      var contents = details.text;
      $scope.entity.source = contents;
      updateSourceView();
      Core.$apply($scope);
    }

    function updateSourceView() {
      if (form) {
        if (isCreate()) {
          // lets default a file name
          if (!$scope.fileName) {
            $scope.fileName = "" + Core.getUUID() + ".json";
          }
        }
        // now lets try load the form defintion JSON so we can then render the form
        $scope.sourceView = null;
        if (form === "/") {
          onFormSchema(_jsonSchema);
        } else {
          $scope.git = wikiRepository.getPage(form, $scope.objectId, (details) => {
            onFormSchema(Wiki.parseJson(details.text));
          });
        }
      } else {
        $scope.sourceView = "app/wiki/html/sourceEdit.html";
      }
    }

    function onFormSchema(json) {
      $scope.formDefinition = json;
      if ($scope.entity.source) {
        $scope.formEntity = Wiki.parseJson($scope.entity.source);
      }
      $scope.sourceView = "app/wiki/html/formEdit.html";
      Core.$apply($scope);
    }

    function goToView() {
      var path = Core.trimLeading($scope.viewLink(), "#");
      console.log("going to view " + path);
      $location.path(path);
      console.log("location is now " + $location.path());
    }

    function saveTo(path:string) {
      var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
      var contents = $scope.entity.source;
      if ($scope.formEntity) {
        contents = JSON.stringify($scope.formEntity, null, "  ");
      }
      //console.log("About to write contents '" + contents + "'");
      wikiRepository.putPage(path, contents, commitMessage, (status) => {
        Wiki.onComplete(status);
        goToView();
        Core.$apply($scope);
      });
    }
  }
}