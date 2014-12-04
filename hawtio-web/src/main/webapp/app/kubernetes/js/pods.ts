/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
/// <reference path="../../forms/js/formInterfaces.ts"/>
/// <reference path="../../helpers/js/arrayHelpers.ts"/>
/// <reference path="../../service/js/serviceHelpers.ts"/>
module Kubernetes {


  export var EnvItem = controller("EnvItem", ["$scope", ($scope) => {
    var parts = $scope.data.split('=');
    $scope.key = parts.shift();
    $scope.value = parts.join('=');
  }]);

  // main controller for the page
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", "ServiceRegistry", "$dialog", "$window", "$templateCache", "$routeParams", "jolokia", "$location", "localStorage",
    ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, ServiceRegistry, $dialog, $window, $templateCache, $routeParams, jolokia:Jolokia.IJolokia, $location:ng.ILocationService, localStorage) => {

    $scope.namespace = $routeParams.namespace;
    $scope.pods = undefined;
    var pods = [];
    $scope.fetched = false;
    $scope.json = '';
    $scope.itemSchema = Forms.createFormConfiguration();

    $scope.hasService = (name) => Service.hasService(ServiceRegistry, name);

    $scope.tableConfig = {
      data: 'pods',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
/*
        TODO can't add icons yet as we need to know the service / RC Id for a pod to be able to look up the icon

        { field: 'icon', displayName: '', cellTemplate: $templateCache.get("iconCellTemplate.html") },
*/
        {
          field: 'id',
          displayName: 'ID',
          defaultSort: true,
          cellTemplate: $templateCache.get("idTemplate.html")
        },
        {
              field: 'namespace',
              displayName: 'Namespace'
        },
        {
          field: 'currentState.status',
          displayName: 'Status',
          cellTemplate: $templateCache.get("statusTemplate.html")
        },
        {
          field: 'containerImages',
          displayName: 'Images',
          cellTemplate: $templateCache.get("imageTemplate.html")
        },
        {
          field: 'currentState.host',
          displayName: 'Host'
        },
        {
          field: 'currentState.podIP',
          displayName: 'Pod IP'
        },
        {
          field: 'labels',
          displayName: 'Labels',
          cellTemplate: $templateCache.get("labelTemplate.html")
        }
      ]
    };

    $scope.podDetail = {
      properties: {
        'manifest/containers/image$': {
          template: $templateCache.get('imageTemplate.html') 
        },
        'currentState/status': {
          template: $templateCache.get('statusTemplate.html')
        },
        '\\/Env\\/': {
          template: $templateCache.get('envItemTemplate.html')
        },
        '^\\/labels$': {
          template: $templateCache.get('labelTemplate.html')
        },
        '\\/env\\/key$': {
          hidden: true
        }
      }
    };

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

    $scope.openLogs = () => {
      var pods = $scope.tableConfig.selectedItems;
      if (!pods || !pods.length) {
        if ($scope.id) {
          var item = $scope.item;
          if (item) {
            pods = [item];
          }
        }
      }
      openLogsForPods(ServiceRegistry, $window, pods);
    };

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.pods);
    });

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.pods);
    });

    jolokia.getAttribute(Kubernetes.mbean, 'DockerIp', undefined,
      <Jolokia.IParams> onSuccess((results) => {
        log.info("got Docker IP: " + results);
        if (results) {
          $scope.dockerIp = results;
        }
        Core.$apply($scope);
      }, {
        error: (response) => {
          log.debug("error fetching API URL: ", response);
        }
      }));
    jolokia.getAttribute(Kubernetes.mbean, 'HostName', undefined,
      <Jolokia.IParams> onSuccess((results) => {
        log.info("got hostname: " + results);
        if (results) {
          $scope.hostName = results;
        }
        Core.$apply($scope);
      }, {
        error: (response) => {
          log.debug("error fetching API URL: ", response);
        }
      }));

    Kubernetes.initShared($scope, $location);

    $scope.connect = {
      dialog: new UI.Dialog(),
      saveCredentials: false,
      userName: null,
      password: null,
      jolokiaUrl: null,
      containerName: null,
      view: null,

      onOK: () => {
        var userName = $scope.connect.userName;
        var password = $scope.connect.password;
        var userDetails = <Core.UserDetails> Core.injector.get('userDetails');
        if (!userDetails.password) {
          // this can get unset if the user happens to refresh and hasn't checked rememberMe
          userDetails.password = password;
        }
        if ($scope.connect.saveCredentials) {
          $scope.connect.saveCredentials = false;
          if (userName) {
            localStorage['kuberentes.userName'] = userName;
          }
          if (password) {
            localStorage['kuberentes.password'] = password;
          }
        }
        log.info("Connecting to " + $scope.connect.jolokiaUrl + " for container: " + $scope.connect.containerName + " user: " + $scope.connect.userName);
        var options = Core.createConnectOptions({
          jolokiaUrl: $scope.connect.jolokiaUrl,
          userName: userName,
          password: password,
          useProxy: true,
          view: $scope.connect.view,
          name: $scope.connect.containerName
        });
        Core.connectToServer(localStorage, options);
        setTimeout(() => {
          $scope.connect.dialog.close();
          Core.$apply($scope);
        }, 100);
      },

      doConnect: (entity) => {
        var userDetails = <Core.UserDetails> Core.injector.get('userDetails');
        if (userDetails) {
          $scope.connect.userName = userDetails.username;
          $scope.connect.password = userDetails.password;
        }
        $scope.connect.jolokiaUrl =  entity.$jolokiaUrl;
        $scope.connect.containerName = entity.id;
        //$scope.connect.view = "#/openlogs";

        var alwaysPrompt = localStorage['fabricAlwaysPrompt'];
        if ((alwaysPrompt && alwaysPrompt !== "false") || !$scope.connect.userName || !$scope.connect.password) {
          $scope.connect.dialog.open();
        } else {
          $scope.connect.onOK();
        }
      }
    };

    KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
      $scope.deletePrompt = (selected) => {
        if (angular.isString(selected)) {
          selected = [{
            id: selected
          }];
        }
        UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
          collection: selected,
          index: 'id',
          onClose: (result:boolean) => {
            if (result) {
              function deleteSelected(selected:Array<KubePod>, next:KubePod) {
                if (!next) {
                  if (!jolokia.isRunning()) {
                    $scope.fetch();
                  }
                } else {
                  log.debug("deleting: ", next.id);
                  KubernetesPods.delete({
                    id: next.id
                  }, undefined, () => {
                    log.debug("deleted: ", next.id);
                    deleteSelected(selected, selected.shift());
                  }, (error) => {
                    log.debug("Error deleting: ", error);
                    deleteSelected(selected, selected.shift());
                  });
                }
              }
              deleteSelected(selected, selected.shift());
            }
          },
          title: 'Delete pods?',
          action: 'The following pods will be deleted:',
          okText: 'Delete',
          okClass: 'btn-danger',
          custom: "This operation is permanent once completed!",
          customClass: "alert alert-warning"
        }).open();
      };

      // setup polling
      $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
        KubernetesPods.query((response) => {
          $scope.fetched = true;
          var redraw = ArrayHelpers.sync(pods, (response['items'] || []).sortBy((pod:KubePod) => { return pod.id }).filter((pod:KubePod) => { return pod.id && (!$scope.namespace || $scope.namespace === pod.namespace)}));
          angular.forEach(pods, entity => {
            entity.$labelsText = Kubernetes.labelsToString(entity.labels);

            // lets try detect a console...
            var info = Core.pathGet(entity, ["currentState", "info"]);
            var hostPort = null;
            var currentState = entity.currentState || {};
            var desiredState = entity.desiredState || {};
            var host = currentState["host"];
            var podIP = currentState["podIP"];
            var hasDocker = false;
            var foundContainerPort = null;
            if (currentState && !podIP) {
              angular.forEach(info, (containerInfo, containerName) => {
                if (!hostPort) {
                  var jolokiaHostPort = Core.pathGet(containerInfo, ["detailInfo", "HostConfig", "PortBindings", "8778/tcp"]);
                  if (jolokiaHostPort) {
                    var hostPorts = jolokiaHostPort.map("HostPort");
                    if (hostPorts && hostPorts.length > 0) {
                      hostPort = hostPorts[0];
                      hasDocker = true;
                    }
                  }
                }
              });
            }
            if (desiredState && !hostPort) {
              var containers = Core.pathGet(desiredState, ["manifest", "containers"]);
              angular.forEach(containers, (container) => {
                if (!hostPort) {
                  var ports = container.ports;
                  angular.forEach(ports, (port) => {
                    if (!hostPort) {
                      var containerPort = port.containerPort;
                      var portName = port.name;
                      var containerHostPort = port.hostPort;
                      if (containerPort === 8778 || "jolokia" === portName) {
                        if (containerPort) {
                          if (podIP) {
                            foundContainerPort = containerPort;
                          }
                          if (containerHostPort) {
                            hostPort = containerHostPort;
                          }
                        }
                      }
                    }
                  });
                }
              });
            }
            if (podIP && foundContainerPort) {
              host = podIP;
              hostPort = foundContainerPort;
              hasDocker = false;
            }
            if (hostPort) {
              if (!host) {
                host = "localhost";
              }
              // if Kubernetes is running locally on a platform which doesn't support docker natively
              // then docker containers will be on a different IP so lets check for localhost and
              // switch to the docker IP if its available
              if ($scope.dockerIp && hasDocker) {
                if (host === "localhost" || host === "127.0.0.1" || host === $scope.hostName) {
                  host = $scope.dockerIp;
                }
              }
              if (isRunning(currentState)) {
                entity.$jolokiaUrl = "http://" + host + ":" + hostPort + "/jolokia/";

                // TODO note if we can't access the docker/local host we could try access via
                // the pod IP; but typically you need to explicitly enable that inside boot2docker
                // see: https://github.com/fabric8io/fabric8/blob/2.0/docs/getStarted.md#if-you-are-on-a-mac
                entity.$connect = $scope.connect;
              }
            }
          });
          Kubernetes.setJson($scope, $scope.id, pods);
          $scope.pods = pods;
          updateNamespaces($scope.kubernetes, pods);

          // technically the above won't trigger hawtio simple table's watch, so let's force it
          $scope.$broadcast("hawtio.datatable.pods");
          //log.debug("Pods: ", $scope.pods);
          next();
        });
      });
      // kick off polling
      $scope.fetch();
    });
  }]);
}
