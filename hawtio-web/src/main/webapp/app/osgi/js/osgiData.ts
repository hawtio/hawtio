module Osgi {

    export class OsgiDataService {

        private result = {};
        private bundles = [];

        private jolokia;
        private workspace : Workspace;
        private callback;

        constructor (workspace: Workspace, jolokia, callback) {

            var svc :OsgiDataService = this

            this.jolokia = jolokia;
            this.workspace = workspace;

            Core.register(jolokia, svc, {
                type: 'exec', mbean: getSelectionBundleMBean(workspace),
                operation: 'listBundles()'
            }, onSuccess(function(response) {
                svc.processResponse(response)
            }));
        }

        public register(callback) {
            this.callback = callback;
        }

        public getBundles() {
            return this.bundles;
        }

        private processResponse(response) {

            var svc = this;

            if (!Object.equal(svc.result, response.value)) {
                var newBundles = [];

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
                        StartLevel: undefined
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

                if (callback) {
                    callback()
                }
            }
       }
    }
}