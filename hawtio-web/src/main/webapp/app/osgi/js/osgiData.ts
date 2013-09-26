module Osgi {

    export class OsgiDataService {

        private result = {};
        private bundles = [];
        private services = {};

        private jolokia;
        private workspace : Workspace;
        private callback;

        constructor (workspace: Workspace, jolokia) {

            var svc :OsgiDataService = this

            this.jolokia = jolokia;
            this.workspace = workspace;

            Core.register(jolokia, svc, {
                type: 'exec', mbean: getSelectionBundleMBean(workspace),
                operation: 'listBundles()'
            }, onSuccess(function(response) {
                svc.processBundles(response)
            }));
        }

        public register(callback) {
            this.result = {};
            this.bundles = [];

            this.callback = callback;
        }

        public getBundles() {
            return this.bundles;
        }

        public getServices() {
            return this.services;
        }

        private loadServices(svc) {

            var response = svc.jolokia.request({
                type: 'exec',
                mbean: getSelectionServiceMBean(svc.workspace),
                operation: 'listServices()'
            }, onSuccess(null));

            var answer = response.value;
            svc.services = {};

            angular.forEach(answer, function (value, key) {
              svc.services[value.Identifier] = value;
            });
        }

        private processBundles(response) {

            var svc = this;

            if (!Object.equal(svc.result, response.value)) {
                var newBundles = [];
                svc.loadServices(svc);

                svc.result = response.value;

                angular.forEach(svc.result, function (value, key) {
                    var obj = {
                        Identifier: value.Identifier,
                        Name: "",
                        SymbolicName: value.SymbolicName,
                        Fragment: value.Fragment,
                        State: value.State,
                        Version: value.Version,
                        LastModified: new Date(Number(value.LastModified)),
                        Location: value.Location,
                        StartLevel: undefined,
                        RegisteredServices: value.RegisteredServices,
                        ServicesInUse: value.ServicesInUse
                    };
                    if (value.Headers['Bundle-Name']) {
                        obj.Name = value.Headers['Bundle-Name']['Value'];
                    }
                    newBundles.push(obj);
                });

                // Obtain start level information for all the bundles
                for(var i = 0; i < newBundles.length; i++) {
                    var b = newBundles[i];
                    svc.jolokia.request({
                        type: 'exec', mbean: getSelectionBundleMBean(svc.workspace),
                        operation: 'getStartLevel(long)',
                        arguments: [newBundles[i].Identifier]
                    }, onSuccess(function(bundle) {
                        return function(response) {
                            bundle.StartLevel = response.value;
                        }
                    }(b)));
                }

                svc.bundles = newBundles

                if (svc.callback) {
                    svc.callback()
                }
            }
       }
    }
}