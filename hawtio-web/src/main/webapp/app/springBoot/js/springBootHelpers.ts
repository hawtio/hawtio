module SpringBoot {

    /**
     * Resolves Jolokia URL of the Spring Boot to which Hawt.io is connected.
     **/
    export function springBootAppUrl() {
        var urlFromParameter = document.URL.match(/.http.*/);
        if (!urlFromParameter) {
            return '';
        }
        var decodedUrl = decodeURIComponent(urlFromParameter[0].substring(1));
        var hashIndex = decodedUrl.lastIndexOf('#');
        return decodedUrl.substring(0, hashIndex)
    }

    export function callIfSpringBootAppAvailable(jolokia, callbackFunc) {
        jolokia.execute('org.springframework.boot:type=Endpoint,name=metricsEndpoint', "getData()", onSuccess(function (data) {
            callbackFunc()
        }));
    }

}
