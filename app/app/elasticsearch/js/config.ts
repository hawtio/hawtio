module ES {

    export var config = {
        elasticsearch: "http://" + window.location.hostname + ":9200",
        indice: "twitter",
        doctype: "tweet",
        query: "*"
    };

}