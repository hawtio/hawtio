/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
/// <reference path="../../forms/js/formInterfaces.ts"/>
module Kubernetes {

  // main controller for the page
  export var Pods = controller("Pods", ["$scope", "KubernetesPods", "$dialog", "$templateCache", "jolokia", "$location", "localStorage", ($scope, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, $dialog, $templateCache, jolokia:Jolokia.IJolokia, $location:ng.ILocationService, localStorage) => {

    $scope.pods = [];
    $scope.fetched = false;
    $scope.json = '';
    $scope.itemSchema = Forms.createFormConfiguration();

    $scope.podDetail = {
      properties: {
        'manifest/containers/image': {
          template: $templateCache.get('imageTemplate.html') 
        },
        'currentState/status': {
          template: $templateCache.get('statusTemplate.html')
        }
      }
    };

    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

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

    Kubernetes.initShared($scope);

    $scope.tableConfig = {
      data: 'pods',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: ''
      },
      columnDefs: [
        {
          field: 'id',
          displayName: 'ID',
          defaultSort: true,
          cellTemplate: $templateCache.get("idTemplate.html")
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
          $scope.pods = (response['items'] || []).sortBy((pod:KubePod) => { return pod.id }).filter((pod:KubePod) => { return pod.id });
          angular.forEach($scope.pods, entity => {
            entity.$labelsText = Kubernetes.labelsToString(entity.labels);

            // lets try detect a console...
            var info = Core.pathGet(entity, ["currentState", "info"]);
            var hostPort = null;
            var currentState = entity.currentState;
            var host = currentState ? currentState["host"] : null;
            if (currentState)
            angular.forEach(info, (containerInfo, containerName) => {
              if (!hostPort) {
                var jolokiaHostPort = Core.pathGet(containerInfo, ["detailInfo", "HostConfig", "PortBindings", "8778/tcp"]);
                if (jolokiaHostPort) {
                  var hostPorts = jolokiaHostPort.map("HostPort");
                  if (hostPorts && hostPorts.length > 0) {
                    hostPort = hostPorts[0];
                  }
                }
              }
            });
            if (hostPort) {
              if (!host) {
                host = "localhost";
              }
              // if Kubernetes is running locally on a platform which doesn't support docker natively
              // then docker containers will be on a different IP so lets check for localhost and
              // switch to the docker IP if its available
              if ($scope.dockerIp) {
                if (host === "localhost" || host === "127.0.0.1" || host === $scope.hostName) {
                  host = $scope.dockerIp;
                }
              }
              entity.$jolokiaUrl = "http://" + host + ":" + hostPort + "/jolokia/";

              // TODO note if we can't access the docker/local host we could try access via
              // the pod IP; but typically you need to explicitly enable that inside boot2docker
              // see: https://github.com/fabric8io/fabric8/blob/2.0/docs/getStarted.md#if-you-are-on-a-mac
              entity.$connect = $scope.connect;
            }
          });
          Kubernetes.setJson($scope, $scope.id, $scope.pods);
          //log.debug("Pods: ", $scope.pods);
          next();
        });
      });
      // kick off polling
      $scope.fetch();
    });
  }]);
}
