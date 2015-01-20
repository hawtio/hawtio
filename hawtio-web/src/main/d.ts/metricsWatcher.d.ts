declare module MetricsWatcher {

  export interface IMetricsWatcher {
    addGauge: (divId:string, className:string, metricName:string, title:string) => void;
    addMeter: (divId:string, className:string, metricName:string, title:string, eventType:string) => void;
    addCounter: (divId:string, className:string, metricName:string, max:number, title:string) => void;
    addHistogram: (divId:string, className:string, metricName:string, max:number, title:string) => void;
    addLinkedCounter: (divId:string, className:string, metricName:string, maxClassName:string, maxMetricName:string, title:string) => void;
    addTimer: (divId:string, className:string, metricName:string, max:number, title:string, eventType:string, durationMax:number) => void;
    addCache: (divId:string, className:string, title:string) => void;
    addJvm: (divId, className, title) => void;
    addWeb: (divId, className, title) => void;
    addLog4j: (divId, className, title) => void;
    initGraphs: () => void;
    updateGraphs: (json: any) => void;
  }

}

declare var metricsWatcher: MetricsWatcher.IMetricsWatcher;
