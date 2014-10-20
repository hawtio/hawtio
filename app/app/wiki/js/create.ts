/// <reference path="wikiPlugin.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
module Wiki {

  var CreateController = controller("CreateController", ["$scope", "$location", "$routeParams", "$route", "$http", "$timeout", "workspace", "jolokia", "wikiRepository", ($scope, $location:ng.ILocationService, $routeParams:ng.route.IRouteParamsService, $route:ng.route.IRouteService, $http:ng.IHttpService, $timeout:ng.ITimeoutService, workspace:Core.Workspace, jolokia:Jolokia.IJolokia, wikiRepository) => {
    var isFmc = Fabric.isFMCContainer(workspace);
    Wiki.initScope($scope, $routeParams, $location);
    $scope.createDocumentTree = Wiki.createWizardTree(workspace, $scope);
    $scope.createDocumentTreeActivations = ["camel-spring.xml", "ReadMe.md"];
    $scope.fileExists = {
      exists: false,
      name: ""
    };
    $scope.newDocumentName = "";
    $scope.selectedCreateDocumentExtension = null;
    $scope.fileExists.exists = false;
    $scope.fileExists.name = "";
    $scope.newDocumentName = "";

    function returnToDirectory() {
      var link = Wiki.viewLink($scope.branch, $scope.pageId, $location)
      log.debug("Cancelling, going to link: ", link);
      Wiki.goToLink(link, $timeout, $location);
    }

    $scope.cancel = () => {
      returnToDirectory();
    }

    $scope.onCreateDocumentSelect = (node) => {
      // reset as we switch between document types
      $scope.fileExists.exists = false;
      $scope.fileExists.name = "";
      var entity = node ? node.entity : null;
      $scope.selectedCreateDocumentTemplate = entity;
      $scope.selectedCreateDocumentTemplateRegex = $scope.selectedCreateDocumentTemplate.regex || /.*/;
      $scope.selectedCreateDocumentTemplateInvalid = $scope.selectedCreateDocumentTemplate.invalid || "invalid name";
      $scope.selectedCreateDocumentTemplateExtension = $scope.selectedCreateDocumentTemplate.extension || null;
      log.debug("Entity: ", entity);
      if (entity) {
        if (entity.generated) {
          $scope.formSchema = entity.generated.schema;
          $scope.formData = entity.generated.form(workspace, $scope);
        } else {
          $scope.formSchema = {};
          $scope.formData = {};
        }
        Core.$apply($scope);
      }

    };

    $scope.addAndCloseDialog = (fileName:string) => {
      $scope.newDocumentName = fileName;
      var template = $scope.selectedCreateDocumentTemplate;
      var path = getNewDocumentPath();

      // clear $scope.newDocumentName so we dont remember it when we open it next time
      $scope.newDocumentName = null;

      // reset before we check just in a bit
      $scope.fileExists.exists = false;
      $scope.fileExists.name = "";
      $scope.fileExtensionInvalid = null;

      if (!template || !path) {
        return;
      }

      // validate if the name match the extension
      if ($scope.selectedCreateDocumentTemplateExtension) {
        var idx = path.lastIndexOf('.');
        if (idx > 0) {
          var ext = path.substring(idx);
          if ($scope.selectedCreateDocumentTemplateExtension !== ext) {
            $scope.fileExtensionInvalid = "File extension must be: " + $scope.selectedCreateDocumentTemplateExtension;
            Core.$apply($scope);
            return;
          }
        }
      }

      // validate if the file exists, and use the synchronous call
      var exists:boolean = wikiRepository.exists($scope.branch, path, null);
      if (exists) {
        $scope.fileExists.exists = true;
        $scope.fileExists.name = path;
        Core.$apply($scope);
        return;
      }

      var name = Wiki.fileName(path);
      var folder = Wiki.fileParent(path);
      var exemplar = template.exemplar;

      var commitMessage = "Created " + template.label;
      var exemplarUri = Core.url("/app/wiki/exemplar/" + exemplar);

      if (template.folder) {
        Core.notification("success", "Creating new folder " + name);

        wikiRepository.createDirectory($scope.branch, path, commitMessage, (status) => {
          var link = Wiki.viewLink($scope.branch, path, $location);
          goToLink(link, $timeout, $location);
        });
      } else if (template.profile) {

        function toPath(profileName:string) {
          var answer = "fabric/profiles/" + profileName;
          answer = answer.replace(/-/g, "/");
          answer = answer + ".profile";
          return answer;
        }

        function toProfileName(path:string) {
          var answer = path.replace(/^fabric\/profiles\//, "");
          answer = answer.replace(/\//g, "-");
          answer = answer.replace(/\.profile$/, "");
          return answer;
        }

        // strip off any profile name in case the user creates a profile while looking at
        // another profile
        folder = folder.replace(/\/=?(\w*)\.profile$/, "");

        var concatenated = folder + "/" + name;

        var profileName = toProfileName(concatenated);
        var targetPath = toPath(profileName);

        // check if profile exists
        var profile = Fabric.getProfile(workspace.jolokia, $scope.branch, profileName, false);
        if (profile) {
          $scope.fileExists.exists = true;
          $scope.fileExists.name = profileName;
          Core.$apply($scope);
          return;
        }

        Fabric.createProfile(workspace.jolokia, $scope.branch, profileName, ['default'], () => {
          // notification('success', 'Created profile ' + profileName);
          Core.$apply($scope);
          Fabric.newConfigFile(workspace.jolokia, $scope.branch, profileName, 'ReadMe.md', () => {
            // notification('info', 'Created empty Readme.md in profile ' + profileName);
            Core.$apply($scope);
            var contents = "Here's an empty ReadMe.md for '" + profileName + "', please update!";
            Fabric.saveConfigFile(workspace.jolokia, $scope.branch, profileName, 'ReadMe.md', contents.encodeBase64(), () => {
              // notification('info', 'Updated Readme.md in profile ' + profileName);
              Core.$apply($scope);
              var link = Wiki.viewLink($scope.branch, targetPath, $location);
              goToLink(link, $timeout, $location);
  }, (response) => {
              Core.notification('error', 'Failed to set ReadMe.md data in profile ' + profileName + ' due to ' + response.error);
              Core.$apply($scope);
            });
          }, (response) => {
            Core.notification('error', 'Failed to create ReadMe.md in profile ' + profileName + ' due to ' + response.error);
            Core.$apply($scope);
          });

        }, (response) => {
          Core.notification('error', 'Failed to create profile ' + profileName + ' due to ' + response.error);
          Core.$apply($scope);
        });

      } else if (template.generated) {
        var options:Wiki.GenerateOptions = {
          workspace: workspace,
          form: $scope.formData,
          name: fileName,
          parentId: folder,
          branch: $scope.branch,
          success: (contents)=> {
            if (contents) {
              wikiRepository.putPageBase64($scope.branch, path, contents, commitMessage, (status) => {
                log.debug("Created file " + name);
                Wiki.onComplete(status);
                returnToDirectory();
              });
            } else {
              returnToDirectory();
            }
          },
          error: (error)=> {
            Core.notification('error', error);
            Core.$apply($scope);
          }
        };
        template.generated.generate(options);
      } else {
        // load the example data (if any) and then add the document to git and change the link to the new document
        $http.get(exemplarUri)
          .success(function(data, status, headers, config) {
            putPage(path, name, folder, data, commitMessage);
          })
          .error(function(data, status, headers, config) {
            // create an empty file
            putPage(path, name, folder, "", commitMessage);
          });
      }
    };

    function putPage(path, name, folder, contents, commitMessage) {
      // TODO lets check this page does not exist - if it does lets keep adding a new post fix...
      wikiRepository.putPage($scope.branch, path, contents, commitMessage, (status) => {
        log.debug("Created file " + name);
        Wiki.onComplete(status);

        // lets navigate to the edit link
        // load the directory and find the child item
        $scope.git = wikiRepository.getPage($scope.branch, folder, $scope.objectId, (details) => {
          // lets find the child entry so we can calculate its correct edit link
          var link:string = null;
          if (details && details.children) {
            log.debug("scanned the directory " + details.children.length + " children");
            var child = details.children.find(c => c.name === fileName);
            if (child) {
              link = $scope.childLink(child);
            } else {
              log.debug("Could not find name '" + fileName + "' in the list of file names " + JSON.stringify(details.children.map(c => c.name)));
            }
          }
          if (!link) {
            log.debug("WARNING: could not find the childLink so reverting to the wiki edit page!");
            link = Wiki.editLink($scope.branch, path, $location);
          }
          //Core.$apply($scope);
          goToLink(link, $timeout, $location);
        });
      })
    }

    function getNewDocumentPath() {
      var template = $scope.selectedCreateDocumentTemplate;
      if (!template) {
        log.debug("No template selected.");
        return null;
      }
      var exemplar = template.exemplar || "";
      var name:string = $scope.newDocumentName || exemplar;

      if (name.indexOf('.') < 0) {
        // lets add the file extension from the exemplar
        var idx = exemplar.lastIndexOf(".");
        if (idx > 0) {
          name += exemplar.substring(idx);
        }
      }

      // lets deal with directories in the name
      var folder:string = $scope.pageId;
      if ($scope.isFile) {
        // if we are a file lets discard the last part of the path
        var idx:any = folder.lastIndexOf("/");
        if (idx <= 0) {
          folder = "";
        } else {
          folder = folder.substring(0, idx);
        }
      }
      var idx:any = name.lastIndexOf("/");
      if (idx > 0) {
        folder += "/" + name.substring(0, idx);
        name = name.substring(idx + 1);
      }
      folder = Core.trimLeading(folder, "/");
      return folder + (folder ? "/" : "") + name;
    }

  }]);

}
