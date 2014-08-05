module SpringBoot {

    export function springBootAppUrl() {
        var urls = decodeURI(document.URL).match(/\/http.*/);
        if (!urls) {
            return '';
        }
        var url = urls[0].substring(1);
        var hashIndex = url.lastIndexOf('#');
        return url.substring(0, hashIndex)
    }

    export function callIfSpringBootAppAvailable(http, url, callbackFunc) {
        http({
            method: 'GET',
            url: url + '/beans'
        }).success(function (data) {
            callbackFunc();
        });
    }

}
