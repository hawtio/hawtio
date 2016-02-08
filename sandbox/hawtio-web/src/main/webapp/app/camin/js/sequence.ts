module Camin {

    export class Sequence {
        endpoints : Endpoint[] = [ ];
        execs     : Execution[] = [ ];
        calls     : Call[] = [ ];

        endpoint(url, routeId, contextId, host) : Endpoint {
            for (var i = 0; i < this.endpoints.length; i++) {
                if (this.endpoints[i].url === url && this.endpoints[i].routeId === routeId &&
                        this.endpoints[i].contextId === contextId && this.endpoints[i].host === host) {
                    return this.endpoints[i];
                }
            }
            var endpoint = new Endpoint(url, routeId, contextId, host);
            this.endpoints.push( endpoint );
            return endpoint;
        }

	    exec(exchangeId, endpoint, start, stop) : Execution {
		    var exec = new Execution( exchangeId, endpoint, start, stop );
		    this.execs.push( exec );
		    return exec;
	    }

	    call(callId, execA, execB, start, stop) : Call {
		    var call = new Call( callId, execA, execB, start, stop );
		    this.calls.push( call );
		    return call;
	    }

	    start() : number {
            var start;
            for (var i = 0; i < this.execs.length; i++) {
                start = start ? Math.min(start, this.execs[i].start) : this.execs[i].start;
            }
            for (var i = 0; i < this.calls.length; i++) {
                start = start ? Math.min(start, this.calls[i].start) : this.calls[i].start;
            }
            return start;
        }

    	stop() : number {
            var stop;
            for (var i = 0; i < this.execs.length; i++) {
                stop = stop ? Math.max(stop, this.execs[i].stop) : this.execs[i].stop;
            }
            for (var i = 0; i < this.calls.length; i++) {
                stop = stop ? Math.max(stop, this.calls[i].stop) : this.calls[i].stop;
            }
            return stop;
        }
    }

    export class Endpoint {
        url       : string;
        routeId   : string;
        contextId : string;
        host      : string;

        constructor(url, routeId, contextId, host) {
            this.url       = url;
            this.routeId   = routeId;
            this.contextId = contextId;
            this.host      = host;
        }
    }

	export class Execution {
	    exchangeId : string;
	    endpoint   : Endpoint;
	    start      : number;
	    stop       : number;

	    constructor(exchangeId, endpoint, start, stop) {
	        this.exchangeId = exchangeId;
	        this.endpoint   = endpoint;
	        this.start      = start;
	        this.stop       = stop;
	    }
	}

	export class Call {
	    callId : string;
	    execA  : Execution;
	    execB  : Execution;
	    start  : number;
	    stop   : number;

	    constructor(callId, execA, execB, start, stop) {
	        this.callId = callId;
            this.execA  = execA;
            this.execB  = execB;
            this.start  = start;
            this.stop   = stop;
	    }
	}

}
