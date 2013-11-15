

declare var Logger:Logging.LoggerStatic;

declare module Logging {

  export interface LogLevel {
    value: number;
    name: string;
  }

  export interface Logger {
    setHandler(handler:Function):void;
    enabledFor(level:LogLevel):boolean;
    setLevel(level:LogLevel):void;
    debug(...arguments:any[]):void;
    info(...arguments:any[]):void;
    warn(...arguments:any[]):void;
    error(...arguments:any[]):void;
    formatStackTraceString(stack:string):string;
  }

  export interface LoggerStatic extends Logger {
    useDefaults(level:LogLevel):void;
    get(name:string):Logger;
    DEBUG:LogLevel;
    INFO:LogLevel;
    WARN:LogLevel;
    ERROR:LogLevel;
    OFF:LogLevel;
  }

}
