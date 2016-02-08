module SpringBatch{
    export function getHost(link){
        var endIdx;
        if(link.indexOf('\\')>=0) endIdx = link.indexOf('\\');
        else endIdx = link.indexOf(':');
        return link.substring(0,endIdx);
    }

    export function getPort(link){
        return link.substring(link.indexOf(':')+1,link.indexOf('/'));
    }

    export function getServerSuffix(link){
        if(link.indexOf('/') != link.lastIndexOf('/'))
            return link.substring(link.indexOf('/')+1,link.lastIndexOf('/'));
        else return '';
    }

    export function getServerUrl(host, port, path){
        var server = '';
        server = host+'\\:'+port;
        if(path){
            if(path.charAt(0) != '/')
                server=server+'/'+path;
            else
                server=server+path;
        }
        if(server.charAt(server.length-1) != '/'){
            server=server+'/'
        }
        return server;
    }
}