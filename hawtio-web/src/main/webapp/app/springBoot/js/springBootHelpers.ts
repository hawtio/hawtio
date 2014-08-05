module SpringBoot {

    export function springBootAppUrl() {
        var url = unescape(document.URL).match(/\/http.*/);
        if (!url) {
            return '';
        }
        url = url[0].substring(1);
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
