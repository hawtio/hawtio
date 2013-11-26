/**
 * @module Osgi
 */
module Osgi {

    export class OsgiDataService {

        private jolokia;
        private workspace : Workspace;

        constructor (workspace: Workspace, jolokia) {

            this.jolokia = jolokia;
            this.workspace = workspace;
        }

        public getBundles() {
            var bundles = {};

            var response = this.jolokia.request({
                type: 'exec',
                mbean: getSelectionBundleMBean(this.workspace),
                operation: 'listBundles()'
            }, onSuccess(null));

            angular.forEach(response.value, function (value, key) {
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

                bundles[value.Identifier] = obj;
            });

            return bundles;
        }

        public getServices() {
            var services = {};

            var response = this.jolokia.request({
                type: 'exec',
                mbean: getSelectionServiceMBean(this.workspace),
                operation: 'listServices()'
            }, onSuccess(null));

            var answer = response.value;

            angular.forEach(answer, function (value, key) {
              services[value.Identifier] = value;
            });

            return services;
        }

        public getPackages() {

            var packages = {};

            var response = this.jolokia.request({
                type: 'exec',
                mbean: getSelectionPackageMBean(this.workspace),
                operation: 'listPackages()'
            }, onSuccess(null));

            var answer = response.value.values;

            answer.forEach( (value) => {
                packages[value.Name + "-" + value.Version] = value;
            })

            return packages;
        }

    }
}
