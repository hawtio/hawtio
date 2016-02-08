/**
 * @module Wiki
 */
/// <reference path="./wikiPlugin.ts"/>
module Wiki {
  _module.controller("Wiki.DozerMappingsController", ["$scope", "$location", "$routeParams", "workspace", "jolokia", "wikiRepository", "$templateCache", ($scope, $location, $routeParams, workspace:Workspace, jolokia, wikiRepository:GitWikiRepository, $templateCache) => {
    var log:Logging.Logger = Logger.get("Dozer");

    Wiki.initScope($scope, $routeParams, $location);
    Dozer.schemaConfigure();

    $scope.profileId = Fabric.pagePathToProfileId($scope.pageId);
    $scope.versionId = $scope.branch || "1.0";

    $scope.schema = {};
    $scope.addDialog = new UI.Dialog();
    $scope.propertiesDialog = new UI.Dialog();
    $scope.deleteDialog = false;
    $scope.unmappedFieldsHasValid = false;
    $scope.modified = false;

    $scope.selectedItems = [];
    $scope.mappings = [];
    $scope.schemas = [];

    $scope.aName = '';
    $scope.bName = '';

    $scope.connectorStyle = [ "Bezier" ];

    $scope.main = "";
    $scope.tab = "Mappings";

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

    if ($scope.profileId) {
      Fabric.profileJolokia(jolokia, $scope.profileId, $scope.versionId, (containerJolokia) => {
        $scope.containerJolokia = containerJolokia;
        $scope.missingContainer = !containerJolokia ? true : false;
      });
    }

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    $scope.triggerRefresh = (timeout = 500) => {
      $scope.main = "";
      setTimeout(() => {
        $scope.main = $templateCache.get("pageTemplate.html");
        Core.$apply($scope);
      }, timeout);
    };

    $scope.disableReload = () => {
      var aValue = Core.pathGet($scope, ["selectedMapping", "class_a", "value"]);
      var bValue = Core.pathGet($scope, ["selectedMapping", "class_b", "value"]);
      return aValue === $scope.aName && bValue === $scope.bName;
    };

    $scope.doReload = () => {
      $scope.selectedMapping.class_a.value = $scope.aName;
      $scope.selectedMapping.class_b.value = $scope.bName;
      $scope.triggerRefresh();
    };

    $scope.$watch('selectedMapping', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.aName = newValue.class_a.value;
        $scope.bName = newValue.class_b.value;
        $scope.triggerRefresh();
      }
    });

    $scope.$watch('selectedMapping.class_a.value', (newValue, oldValue) => {
      if (newValue !== oldValue && newValue !== '') {
        $scope.fetchProperties(newValue, $scope.selectedMapping.class_a, 'Right');
      }
    });

    $scope.$watch('selectedMapping.class_b.value', (newValue, oldValue) => {
      if (newValue !== oldValue && newValue !== '') {
        $scope.fetchProperties(newValue, $scope.selectedMapping.class_b, 'Left');
      }
    });

    $scope.fetchProperties = (className, target, anchor) => {
      var introspectorMBean = Dozer.getIntrospectorMBean(workspace);
      if (introspectorMBean && !$scope.missingContainer) {
        var aJolokia: any = $scope.containerJolokia || jolokia;
        aJolokia.request({
          type: 'exec',
          mbean: introspectorMBean,
          operation: 'getProperties(java.lang.String)',
          arguments: [className]
        }, {
          success: (response) => {
            target.error = null;
            target.properties = response.value;
            var parentId = '';
            if (angular.isDefined(target.value)) {
              parentId = target.value;
            } else {
              parentId = target.path;
            }

            angular.forEach(target.properties, (property) => {
              property.id = Core.getUUID();
              property.path = parentId + '/' + property.displayName;
              property.anchor = anchor;

              // TODO - Let's see if we need to do this...
              /*
               var lookup = !Dozer.excludedPackages.any((excluded) => { return property.typeName.has(excluded); });
               if (lookup) {
               $scope.fetchProperties(property.typeName, property, anchor);
               }
               */
            });
            Core.$apply($scope);
          },
          error: (response) => {
            target.properties = null;
            target.error = {
              'type': response.error_type,
              'stackTrace': response.error
            };
            log.error("got: " + response);
            Core.$apply($scope);
          }
        });
      }
    };

    $scope.getSourceAndTarget = (info) => {
      var sourcePath = info.source.attr('field-path');
      var targetPath = info.target.attr('field-path');

      var sourceField = sourcePath.split('/').last();
      var targetField = sourcePath.split('/').last();

      return {
        from: sourceField,
        to: targetField
      };
    };


    function extractProperty(clazz, prop) {
      return (!clazz || !clazz.properties) ? null :
        clazz.properties.find((property) => {
        return property.path.endsWith('/' + prop);
      });
    }

    // The jsPlumb directive will call this after it's done it's thing...
    function addConnectionClickHandler(connection, jsplumb) {
      connection.bind('click', (connection) => {
        jsplumb.detach(connection);
      });
    }

    function getPaintStyle() {
      return {
        strokeStyle: UI.colors.sample(),
        lineWidth: 4
      };
    }

    $scope.jsPlumbCallback = (jsplumb, nodes, nodesById, connections) => {

      // Set up any connections loaded from the XML
      // TODO - currently we actually are only looking at the top-level properties
      angular.forEach($scope.selectedMapping.fields, (field) => {
        var a_property = extractProperty($scope.selectedMapping.class_a, field.a.value);
        var b_property = extractProperty($scope.selectedMapping.class_b, field.b.value);

        if (a_property && b_property) {
          var a_node = nodesById[a_property.id];
          var b_node = nodesById[b_property.id];

          var connection = $scope.jsPlumb.connect({
            source: a_node.el,
            target: b_node.el
          }, {
            connector: $scope.connectorStyle,
            maxConnections: 1,
            paintStyle: getPaintStyle()
          });

          //Ensure loaded connections can also be removed
          addConnectionClickHandler(connection, jsplumb);
          a_node.connections.push(connection);
          b_node.connections.push(connection);
        }
      });


      // Handle new connection events...
      jsplumb.bind('connection', (info) => {

        // Add a handler so we can click on a connection to make it go away
        addConnectionClickHandler(info.connection, jsplumb);
        info.connection.setPaintStyle(getPaintStyle());

        var newMapping = $scope.getSourceAndTarget(info);

        var field = new Dozer.Field(new Dozer.FieldDefinition(newMapping.from), new Dozer.FieldDefinition(newMapping.to));
        $scope.selectedMapping.fields.push(field);
        $scope.modified = true;
        Core.$apply($scope);
      });

      // Handle connection detach events...
      jsplumb.bind('connectionDetached', (info) => {
        var toDetach = $scope.getSourceAndTarget(info);
        var field = new Dozer.Field(new Dozer.FieldDefinition(toDetach.from), new Dozer.FieldDefinition(toDetach.to));
        $scope.selectedMapping.fields.remove(field);
        $scope.modified = true;
        Core.$apply($scope);
      });
    };


    $scope.formatStackTrace = (exception) => {
      return Log.formatStackTrace(exception);
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
          onTreeModified();
        }
        $scope.mappings.push(mapping);
        $scope.selectedMapping = mapping;
      }
    };

    $scope.addField = () => {
      if ($scope.selectedMapping) {
        // lets find all the possible unmapped fields we can map from...
        Dozer.findUnmappedFields(workspace, $scope.selectedMapping, (data) => {
          log.warn("has unmapped data fields: " + data);
          $scope.unmappedFields = data;
          $scope.unmappedFieldsHasValid = false;
          $scope.addDialog.open();
          Core.$apply($scope);
        });
      }
    };

    $scope.addAndCloseDialog = () => {
      log.info("About to add the unmapped fields " + JSON.stringify($scope.unmappedFields, null, "  "));
      if ($scope.selectedMapping) {
        // TODO whats the folder???
        angular.forEach($scope.unmappedFields, (unmappedField) => {
          if (unmappedField.valid) {
            // TODO detect exclude!
            var field = new Dozer.Field(new Dozer.FieldDefinition(unmappedField.fromField), new Dozer.FieldDefinition(unmappedField.toField));
            $scope.selectedMapping.fields.push(field);
            var treeNode = $scope.selectedMappingTreeNode;
            var mappingFolder = $scope.selectedMappingFolder;
            if (treeNode && mappingFolder) {
              var fieldFolder = Dozer.addMappingFieldFolder(field, mappingFolder);
              var added = treeNode.addChild(fieldFolder);
              if (added) {
                added.expand(true);
                added.select(true);
                added.activate(true);
                onTreeModified();
              }
            } else {
              log.warn("No treenode and folder for mapping node! treeNode " + treeNode + " mappingFolder " + mappingFolder);
            }
          }
        });
      }
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
        onTreeModified();
      }
    };

    $scope.saveMappings = () => {
      $scope.model.mappings = $scope.mappings;
      var text = Dozer.saveToXmlText($scope.model);
      if (text) {
        var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
        wikiRepository.putPage($scope.branch, $scope.pageId, text, commitMessage, (status) => {
          Wiki.onComplete(status);
          $scope.modified = false;
          Core.notification("success", "Saved " + $scope.pageId)
          goToView();
          Core.$apply($scope);
        });
      }
    };

    $scope.save = () => {
      if ($scope.tab === "Mappings") {
        $scope.saveMappings();
        return;
      }
      if ($scope.model) {
        // lets copy the mappings from the tree
        var model = Dozer.loadModelFromTree($scope.rootTreeNode, $scope.model);
        var text = Dozer.saveToXmlText(model);
        if (text) {
          var commitMessage = $scope.commitMessage || "Updated page " + $scope.pageId;
          wikiRepository.putPage($scope.branch, $scope.pageId, text, commitMessage, (status) => {
            Wiki.onComplete(status);
            $scope.modified = false;
            Core.notification("success", "Saved " + $scope.pageId)
            goToView();
            Core.$apply($scope);
          });
        }
      }
    };

    $scope.cancel = () => {
      log.info("cancelling...");
      // TODO show dialog if folks are about to lose changes...
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
      $scope.selectedMapping = null;
      $scope.selectedMappingTreeNode = null;
      $scope.selectedMappingFolder = null;
      // now the model is bound, lets add a listener
      if ($scope.removeModelChangeListener) {
        $scope.removeModelChangeListener();
        $scope.removeModelChangeListener = null;
      }

      if (folder) {
        var entity = folder.entity;
        $scope.dozerEntity = entity;
        var propertiesTemplate = "app/wiki/html/dozerPropertiesEdit.html";
        if (entity instanceof Dozer.Field) {
          //var field: Dozer.Field = entity;
          $scope.propertiesTemplate = propertiesTemplate;
          $scope.nodeModel = io_hawt_dozer_schema_Field;
          $scope.selectedDescription = "Field Mapping";
          $scope.selectedMapping = Core.pathGet(folder, ["parent", "entity"]);
          $scope.selectedMappingFolder = folder.parent;
          $scope.selectedMappingTreeNode = treeNode.parent;
        }
        else if (entity instanceof Dozer.Mapping) {
          //var mapping: Dozer.Mapping = entity;
          $scope.propertiesTemplate = propertiesTemplate;
          $scope.nodeModel = io_hawt_dozer_schema_Mapping;
          $scope.selectedDescription = "Class Mapping";
          $scope.selectedMapping = entity;
          $scope.selectedMappingFolder = folder;
          $scope.selectedMappingTreeNode = treeNode;
        }
        if ($scope.selectedMapping && !$scope.removeModelChangeListener) {
/*
          TODO problem is we have many forms here so we end up creating lots of change events when really we don't change things!: )
          // maybe watch the entity instead?

          console.log("Adding onTreeModified form listener");
          $scope.removeModelChangeListener = $scope.$on("hawtio.form.modelChange", () => {
            console.log("form modified!");
            onTreeModified();
          });
*/
        }
      }

      Core.$apply($scope);
    };



    $scope.onUnmappedFieldChange = (unmappedField) => {
      unmappedField.valid = unmappedField.toField ? true : false;
      $scope.unmappedFieldsHasValid = $scope.unmappedFields.find(f => f.valid);
    };

    function findFieldNames(className, text) {
      //console.log("Finding the to field names for expression '" + text + "'  on class " + className);
      var properties = Dozer.findProperties(workspace, className, text, null);
      return properties.map(p => p.name);
    }

    $scope.fromFieldNames = (text) => {
      var className = Core.pathGet($scope.selectedMapping, ["class_a", "value"]);
      return findFieldNames(className, text);
    };

    $scope.toFieldNames = (text) => {
      var className = Core.pathGet($scope.selectedMapping, ["class_b", "value"]);
      return findFieldNames(className, text);
    };

    $scope.classNames = (text) => {
      // lets only query if the size is reasonable
      if (!text || text.length < 2) return [];
      return Core.time("Time the query of classes", () => {
        log.info("searching for class names with filter '" + text + "'");
        var answer =  Dozer.findClassNames(workspace, text);
        log.info("Found results: " + answer.length);
        return answer;
      })
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
        if ($scope.responseText !== text) {
          $scope.responseText = text;
          // lets remove any dodgy characters so we can use it as a DOM id
          $scope.model = Dozer.loadDozerModel(text, $scope.pageId);

          $scope.mappings = Core.pathGet($scope.model, ["mappings"]);

          $scope.mappingTree = Dozer.createDozerTree($scope.model);
          if (!angular.isDefined($scope.selectedMapping)) {
            $scope.selectedMapping = $scope.mappings.first();
          }

          $scope.main = $templateCache.get("pageTemplate.html");
        }
      } else {
        log.warn("No XML found for page " + $scope.pageId);
      }
      Core.$apply($scope);
    }

    function onTreeModified() {
      $scope.modified = true;
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
  }]);
}
