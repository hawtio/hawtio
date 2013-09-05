module Osgi {

    export class OsgiDataService {

        public getBundles() : Object[] {
            var bundles = []

            var obj = {
                name: "foo"
            };

            bundles.push(obj)

            return bundles;
        }

    }
}