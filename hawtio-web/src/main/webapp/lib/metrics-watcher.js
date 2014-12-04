/*****************************************************************************
 * Metrics-Watcher
 *
 * Copyright 2012 Ben Bertola and iovation, Inc.
 *
 * To use this library:
 * 1. Call metricsWatcher.addXXX() for each graph you want on your page
 * 2. Call metricsWatcher.initGraphs() once to draw the initial graphs
 * 3. Call metricsWatcher.updateGraphs(jsonData) with JSON data from your
 *    metrics/servlet as often as you'd like your graphs to update
 *
 *****************************************************************************/

(function(metricsWatcher, $, undefined) {

	/**
	 * Add a Gauge type graph to your page.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param metricName The metric name of your metrics data, from the metrics servlet
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addGauge = function(divId, className, metricName, title) {
		var metricInfo = new MetricInfo(divId, className, metricName, null, title, 'gauges', null);
		graphs.push(metricInfo);
	};

	/**
	 * Add a Meter type graph to your page.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param metricName The metric name of your metrics data, from the metrics servlet
	 * @param max What the max value target is, used to determine the % width of progress bars for this graph
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addMeter = function(divId, className, metricName, max, title, eventType) {
		if (eventType == undefined) eventType = 'Calls';
		var metricInfo = new MetricInfo(divId, className, metricName, max, title, 'meters', eventType);
		metricInfo.eventType = eventType;
		graphs.push(metricInfo);
	};

	/**
	 * Add a Counter graph
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param metricName The metric name of your metrics data, from the metrics servlet
	 * @param max What the max value target is, used to determine the % width of progress bars for this graph
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addCounter = function(divId, className, metricName, max, title) {
		var metricInfo = new MetricInfo(divId, className, metricName, max, title, 'counters', null);
		graphs.push(metricInfo);
	};

		/**
	 * Add a standalone Histogram graph
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param metricName The metric name of your metrics data, from the metrics servlet
	 * @param max What the max value target is, used to determine the % width of progress bars for this graph
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addHistogram = function(divId, className, metricName, max, title){
		var metricInfo = new MetricInfo(divId, className, metricName, (!max ? 1: max), title, 'histograms', null);
		graphs.push(metricInfo);
	};

	/**
	 * Add a linked Counter graph. Linked Counters differ from a plain counter graph in that both the numerator and denominator
	 * of a linked counter graph each come from individual Counter Metrics.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param metricName The metric name of your metrics data, from the metrics servlet
	 * @param maxClassName
	 * @param maxMetricName
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addLinkedCounter = function(divId, className, metricName, maxClassName, maxMetricName, title) {
		var metricInfo = new MetricInfo(divId, className, metricName, null, title, "counters", null);
		if(!metricInfo)
			metricInfo = new MetricInfo(divId, className, metricName, null, title, "timers", null);
		
		metricInfo.maxClassName = maxClassName;
		metricInfo.maxMetricName = maxMetricName;

		metricInfo.getMax = function(json) {
			var maxNode = this.getMetricNode(this.maxClassName, this.maxMetricName, json);
			return maxNode["count"];
		};
		
			metricInfo.getMetricNode = function getMetricNode(className, metricName, jsonRoot) {
				
				var node=!(jsonRoot["counters"][className+'.'+metricName]) ? null : jsonRoot["counters"][className+'.'+metricName];
				if(node){
					return node;
				}else{
					return !(jsonRoot["timers"][className+'.'+metricName]) ? null : jsonRoot["timers"][className+'.'+metricName];
				}
			};

		graphs.push(metricInfo);
	};

	/**
	 * Add a Timer graph. This will include a Meter, Timing Info, and a Histogram.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param metricName The metric name of your metrics data, from the metrics servlet
	 * @param max The max target value for the Meter, showing frequency
	 * @param title The user-displayed title of this graph
	 * @param eventType a name for this event type
	 * @param durationMax The max target value for duration
	 */
	metricsWatcher.addTimer = function(divId, className, metricName, max, title, eventType, durationMax) {
		var timer = addTimerInternal(divId, className, metricName, max, title, eventType, durationMax, false);
		graphs.push(timer);
	};

	/**
	 * Add an ehcache graph.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addCache = function(divId, className, title) {
		var metricInfo = new MetricInfo(divId, className, null, null, title, "caches", null);

		metricInfo.components = {
			gauges : [
				new MetricInfo(null, className, "hits", null, "Hits", "gauges", null),
				new MetricInfo(null, className, "misses", null, "Misses", "gauges", null),
				new MetricInfo(null, className, "objects", null, "Objects", "gauges", null),
				new MetricInfo(null, className, "eviction-count", null, "Eviction Count", "gauges", null),
				new MetricInfo(null, className, "in-memory-hits", null, "In Memory Hits", "gauges", null),
				new MetricInfo(null, className, "in-memory-misses", null, "In Memory Misses", "gauges", null),
				new MetricInfo(null, className, "in-memory-objects", null, "In Memory Objects", "gauges", null),
				new MetricInfo(null, className, "off-heap-hits", null, "Off Heap Hits", "gauges", null),
				new MetricInfo(null, className, "off-heap-misses", null, "Off Heap Misses", "gauges", null),
				new MetricInfo(null, className, "off-heap-objects", null, "Off Heap Objects", "gauges", null),
				new MetricInfo(null, className, "on-disk-hits", null, "On Disk Hits", "gauges", null),
				new MetricInfo(null, className, "on-disk-misses", null, "On Disk Misses", "gauges", null),
				new MetricInfo(null, className, "on-disk-objects", null, "On Disk Objects", "gauges", null),
				new MetricInfo(null, className, "mean-get-time", null, "Mean Get Time", "gauges", null),
				new MetricInfo(null, className, "mean-search-time", null, "Mean Search Time", "gauges", null),
				new MetricInfo(null, className, "searches-per-second", null, "Searches Per Sec", "gauges", null),
				new MetricInfo(null, className, "writer-queue-size", null, "Writer Queue Size", "gauges", null),
				new MetricInfo(null, className, "accuracy", null, "Accuracy", "gauges", null)
			]
		};
		metricInfo.getTimer = addTimerInternal(divId + "gettimer", className, "gets", 5, "Get", "get", 1, true);
		metricInfo.putTimer = addTimerInternal(divId + "puttimer", className, "puts", 5, "Put", "put", 1, true);

		graphs.push(metricInfo);
	};

	/**
	 * Add a JVM graph.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addJvm = function(divId, className, title) {
		var metricInfo = new MetricInfo(divId, className, null, null, title, "jvms", null);
		graphs.push(metricInfo);
	};

	/**
	 * Add a web server graph.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addWeb = function(divId, className, title) {
		var metricInfo = new MetricInfo(divId, className, null, null, title, "webs", null);

		metricInfo.components = {
			meters : [
				new MetricInfo(divId + " td.responseCodesOkGraph", className, "responseCodes.ok", 10, "OK Responses", "meters", null),
				new MetricInfo(divId + " td.responseCodesBadRequestGraph", className, "responseCodes.badRequest", 10, "Bad Requests", "meters", null),
				new MetricInfo(divId + " td.responseCodesCreatedGraph", className, "responseCodes.created", 10, "Created Responses", "meters", null),
				new MetricInfo(divId + " td.responseCodesNoContentGraph", className, "responseCodes.noContent", 10, "No Content Responses", "meters", null),
				new MetricInfo(divId + " td.responseCodesNotFoundGraph", className, "responseCodes.notFound", 10, "Not Found Responses", "meters", null),
				new MetricInfo(divId + " td.responseCodesOtherGraph", className, "responseCodes.other", 10, "Other Responses", "meters", null),
				new MetricInfo(divId + " td.responseCodesServerErrorGraph", className, "responseCodes.serverError", 10, "Server Error Responses", "meters", null)
			],
			activeRequestsInfo : new MetricInfo(divId + " td.activeRequestsGraph", className, "activeRequests", 10, "Active Requests", "counters", null),
			requestsInfo : addTimerInternal(divId + " td.requestsGraph", className, "requests", 100, "Requests", "requests", 100, true)
		};

		graphs.push(metricInfo);
	};

	/**
	 * Add a log4j logged events graph.
	 *
	 * @param divId The id of the div to draw the graph in
	 * @param className The class name of your metrics data, from the metrics servlet
	 * @param title The user-displayed title of this graph
	 */
	metricsWatcher.addLog4j = function(divId, className, title) {
		var metricInfo = new MetricInfo(divId, className, null, null, title, "log4js", null);

		metricInfo.components = {
			meters : [
				new MetricInfo(divId + " td.all", className, "all", 100, "all", "meters", null),
				new MetricInfo(divId + " td.fatal", className, "fatal", 100, "fatal", "meters", null),
				new MetricInfo(divId + " td.error", className, "error", 100, "error", "meters", null),
				new MetricInfo(divId + " td.warn", className, "warn", 100, "warn", "meters", null),
				new MetricInfo(divId + " td.info", className, "info", 100, "info", "meters", null),
				new MetricInfo(divId + " td.debug", className, "debug", 100, "debug", "meters", null),
				new MetricInfo(divId + " td.trace", className, "trace", 100, "trace", "meters", null)
			]
		};

		graphs.push(metricInfo);
	};

	/**
	 * Initialized each of the graphs that you have added through addXXX() calls,
	 * and draws them on the screen for the first time
	 */
	metricsWatcher.initGraphs = function() {
		// draw all graphs for the first time
		for (var i = 0; i < graphs.length; i++) {
			if (graphs[i].type == "gauges")
				drawGauge(graphs[i]);
			else if (graphs[i].type == "meters")
				drawMeter(graphs[i]);
			else if (graphs[i].type == "counters" || graphs[i].type == "linkedTimerCounters")
				drawCounter(graphs[i]);
			else if (graphs[i].type == "histograms")
				drawHistogram(graphs[i]);
			else if (graphs[i].type == "timers")
				drawTimer(graphs[i]);
			else if (graphs[i].type == "caches")
				drawCache(graphs[i]);
			else if (graphs[i].type == "jvms")
				drawJvm(graphs[i]);
			else if (graphs[i].type == "webs")
				drawWeb(graphs[i]);
			else if (graphs[i].type == "log4js")
				drawLog4j(graphs[i]);
			else
				alert("Unknown meter info type: " + graphs[i].type);
		}
	};

	/**
	 * Update the existing graphs with new data. You can call this method as frequently as you would
	 * like to, and all graph info will be updated.
	 *
	 * @param json The root of the json node returned from your ajax call to the metrics servlet
	 */
	metricsWatcher.updateGraphs = function(json) {
		for (var i = 0; i < graphs.length; i++) {
			if (graphs[i].type == "gauges")
				updateGauge(graphs[i], json);
			else if (graphs[i].type == "meters")
				updateMeter(graphs[i], json);
			else if (graphs[i].type == "counters" || graphs[i].type == "linkedTimerCounters")
				updateCounter(graphs[i], json);
			else if (graphs[i].type == "histograms")
				updateHistogram(graphs[i], json);
			else if (graphs[i].type == "timers")
				updateTimer(graphs[i], json);
			else if (graphs[i].type == "caches")
				updateCache(graphs[i], json);
			else if (graphs[i].type == "jvms")
				updateJvm(graphs[i], json);
			else if (graphs[i].type == "webs")
				updateWeb(graphs[i], json);
			else if (graphs[i].type == "log4js")
				updateLog4j(graphs[i], json);
			else
				alert("Unknown meter info type: " + graphs[i].type);
		}
	};

	/*
	 * Private Methods
	 */
	var graphs = [];

  function MetricInfo(divId, className, metricName, max, title, type, subTitle) {
		this.divId = divId;
		this.className = className;
		this.metricName = metricName;
		this.max = max;
		this.title = title;
		this.type = type;
    this.subTitle = subTitle;

		this.getMax = function(json) {
			return this.max;
		};
		this.getMetricNode = function getMetricNode(className, metricName, jsonRoot) {
			return !(jsonRoot[type][className+'.'+metricName]) ? null : jsonRoot[type][className+'.'+metricName];
		};

    this.getSubTitle = function() {
      if (this.subTitle != null) {
        return this.subTitle;
      } else {
        // fallback and use title
        return this.title;
      }
    }
	}

	function calculatePercentage(currentVal, maxVal) {
		var p = (currentVal / maxVal) * 100;
		return p.toFixed(0);
	}

	function formatNumber(varNumber, n) {
		if (isNaN(n)) n = 1;

		return !isNaN(varNumber)?varNumber.toFixed(n):n;
	}

	function capitalizeFirstLetter(input) {
		return input.charAt(0).toUpperCase() + input.slice(1);
	}

	function addTimerInternal(divId, className, metricName, max, title, eventType, durationMax, isNested) {
		var metricInfo = new MetricInfo(divId, className, metricName, max, title, 'timers', eventType);

		metricInfo.getMeterInfo = function() {
			var myDivId = this.divId + " div.timerGraph td.meterGraph";
			var retVal = new MetricInfo(myDivId, this.className, this.metricName, this.max, "Frequency", 'timers', null);

			retVal.getMetricNode = function(className, metricName, jsonRoot) {
				return !jsonRoot['timers'][className+'.'+metricName] ? null : jsonRoot['timers'][className+'.'+metricName];
			};

			retVal.eventType = eventType;
			return retVal;
		};

		metricInfo.getTimerStatsDivId = function() {
			return "#" + this.divId + " div.timerGraph td.timerStatsGraph";
		};
		metricInfo.getTimerHistogramDivId = function() {
			return "#" + this.divId + " div.timerGraph td.timerHistogram";
		};
		metricInfo.durationMax = durationMax;
		metricInfo.isNested = isNested;

		return metricInfo;
	}

	/*
	 * Counter methods
	 */
	function drawCounter(counterInfo) {
		var parentDiv = $("#" + counterInfo.divId);
		var html = "<div class='metricsWatcher counter counterGraph'><div class='heading3'>" + counterInfo.title
				+ "</div><div class='progress'><div class='progress-bar' style='width: 0%;'></div></div></div>";
		parentDiv.html(html);
	}
	
	function updateCounter(counterInfo, json) {
		var metricData = counterInfo.getMetricNode(counterInfo.className, counterInfo.metricName, json);
		var pct = calculatePercentage(metricData.count, counterInfo.getMax(json));

		$("#" + counterInfo.divId + " div.progress div.progress-bar").css("width", pct + "%");
		$("#" + counterInfo.divId + " div.progress div.progress-bar").html(metricData.count + "/" + counterInfo.getMax(json));
	}

	/*
	 * Timer methods
	 */
	function drawTimer(timerInfo) {
		var parentDiv = $("#" + timerInfo.divId);

		var nested = (timerInfo.isNested) ? " nested" : "";
		var html = "<div class='metricsWatcher timer timerGraph" + nested + " col-md-12'>"
				+ "<fieldset><legend>" + ((timerInfo.isNested) ? "<div class='heading1'>":"<div class='heading1 btn-link' data-toggle='collapse' data-target='#" + timerInfo.divId + "Collapse'>") 
				+ timerInfo.title + "</div></legend>"
				+ "<div class='timerContainer col-md-12" + ((timerInfo.isNested) ? "": "collapse") +"' id='" + timerInfo.divId +"Collapse'>"
				+ "<table><tr>"
				+ "<td class='meterGraph col-md-4'></td>"
				+ "<td class='timerStatsGraph col-md-4'></td>"
				+ "<td class='timerHistogram col-md-4'></td>"
				+ "</tr></table></div></fieldset>";
		parentDiv.html(html);

		drawMeter(timerInfo.getMeterInfo());
		drawDurationStats(timerInfo);
		drawDurationHistogram(timerInfo);
	};

	function drawDurationStats(timerInfo) {
		var html = "<div class='heading3'>Duration</div><div class='timeUnit'></div><div class='metricGraph'><table class='progressTable'>"
			+ addMeterRow("Min", "min")
			+ addMeterRow("Mean", "mean")
			+ addMeterRow("Max", "max")
			+ addMeterRow("Std&nbsp;Dev", "stddev")
			+ "</table></div>";
		var parentDiv = $(timerInfo.getTimerStatsDivId());
		parentDiv.html(html);
	}

	function drawDurationHistogram(timerInfo) {
		var html = "<div class='heading3'> " +(timerInfo.isNested?  "Histogram" :timerInfo.getSubTitle()) + "</div><p>Percentiles</p><div class='metricGraph'><table class='progressTable'>"
			+ addMeterRow("99.9%", "p999")
			+ addMeterRow("99%", "p99")
			+ addMeterRow("98%", "p98")
			+ addMeterRow("95%", "p95")
			+ addMeterRow("75%", "p75")
			+ addMeterRow("50%", "p50")
			+ "</table></div>";
		var parentDiv = $(timerInfo.getTimerHistogramDivId());
		parentDiv.html(html);
	}

	function updateTimer(timerInfo, json) {
		updateMeter(timerInfo.getMeterInfo(), json);
		updateDurationStats(timerInfo, json);
		updateDurationHistogram(timerInfo, json);
	}

	function updateDurationStats(timerInfo, json) {
		var metricNode = timerInfo.getMetricNode(timerInfo.className, timerInfo.metricName, json);
		if (!metricNode) return;

		var timeUnitDiv = $(timerInfo.getTimerStatsDivId() + " div.timeUnit");
		timeUnitDiv.html(capitalizeFirstLetter(metricNode["duration_units"]));

		updateDuration(timerInfo.getTimerStatsDivId(), metricNode, "min", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerStatsDivId(), metricNode, "mean", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerStatsDivId(), metricNode, "max", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerStatsDivId(), metricNode, "stddev", timerInfo.durationMax);
	}

	function updateDuration(timerStatsDivId, durationData, style, max) {
		$(timerStatsDivId + " tr." + style + " td.progressValue").html(formatNumber(durationData[style]));
		$(timerStatsDivId + " tr." + style + " td.progressBar div.progress div.progress-bar")
			.css("width", calculatePercentage(durationData[style], max) + "%");
	}

	function updateDurationHistogram(timerInfo, json) {
		var metricNode = timerInfo.getMetricNode(timerInfo.className, timerInfo.metricName, json);
		if (!metricNode) return;

		updateDuration(timerInfo.getTimerHistogramDivId(), metricNode, "p999", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerHistogramDivId(), metricNode, "p99", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerHistogramDivId(), metricNode, "p98", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerHistogramDivId(), metricNode, "p95", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerHistogramDivId(), metricNode, "p75", timerInfo.durationMax);
		updateDuration(timerInfo.getTimerHistogramDivId(), metricNode, "p50", timerInfo.durationMax);
	}

/*
 * Histogram methods
 */

	function drawHistogram(histogramInfo) {
		var parentDiv = $("#" + histogramInfo.divId);
		var html = "<div class='metricsWatcher histogram histogramContainer'>" 
			+ "<div class='heading1 btn-link col-md-12' data-toggle='collapse' data-target='#" + histogramInfo.divId + "Collapse'> " +(histogramInfo.isNested?  "Histogram" :histogramInfo.title) + "</div>" 
			+ "<div class='collapse' id='" + histogramInfo.divId + "Collapse'>"
			+ "<table>" 
				+ "<tr><td class='col-md-4'>Count</td><td class='col-md-4'>Min</td><td class='col-md-4'>Max<td class='col-md-4'>Mean</td></tr>" 
				+ "<tr><td class='countVal'></td><td class='minVal'></td><td class='meanVal'></td><td class='maxVal'></td></tr>"
			+ "</table>"
			+	"<p>Percentiles</p>"
			+"<table class='progressTable'>"
			+ addMeterRow("99.9%", "p999")
			+ addMeterRow("99%", "p99")
			+ addMeterRow("98%", "p98")
			+ addMeterRow("95%", "p95")
			+ addMeterRow("75%", "p75")
			+ addMeterRow("50%", "p50")
			+ "</table></div></div>";
		parentDiv.html(html);
	}

	function updateHistogram(histogramInfo, json) {
		var metricNode = histogramInfo.getMetricNode(histogramInfo.className, histogramInfo.metricName, json);
		$("#" + histogramInfo.divId +  " td.countVal").html(formatNumber(metricNode['count'],0));
		$("#" + histogramInfo.divId +  " td.minVal").html(formatNumber(metricNode['min'],0));
		$("#" + histogramInfo.divId +  " td.maxVal").html(formatNumber(metricNode['max'],0));
		$("#" + histogramInfo.divId +  " td.meanVal").html(formatNumber(metricNode['mean'],0));
		
		setMeterRow(histogramInfo, metricNode, "p999", "p999", histogramInfo.max);
		setMeterRow(histogramInfo, metricNode, "p99", "p99", histogramInfo.max);
		setMeterRow(histogramInfo, metricNode, "p98", "p98", histogramInfo.max);
		setMeterRow(histogramInfo, metricNode, "p95", "p95", histogramInfo.max);
		setMeterRow(histogramInfo, metricNode, "p75", "p75", histogramInfo.max);
		setMeterRow(histogramInfo, metricNode, "p50", "p50", histogramInfo.max);
	}

	/*
	 * Meter methods
	 */
	function drawMeter(meterInfo) {
		var parentDiv = $("#" + meterInfo.divId);

		var html = "<div class='metricsWatcher metric metricGraph'><div class='heading3'>" + meterInfo.title
			+ "</div><div class='counterVal'></div><table class='progressTable'>"
			+ addMeterRow("1&nbsp;min", "onemin")
			+ addMeterRow("5&nbsp;min", "fivemin")
			+ addMeterRow("15&nbsp;min", "fifteenmin")
			+ addMeterRow("Mean", "mean")
			+ "</table></div>";
		parentDiv.html(html);
	}

	function addMeterRow(type, className) {
		return "<tr class='" + className + "'><td class='progressLabel'>" + type + "</td>"
			+ "<td class='progressBar'><div class='progress'><div class='progress-bar' style='width: 0%;'></div>"
			+ "</div></td><td class='progressValue'>0</td></tr>";
	}

	function updateMeter(meterInfo, json) {
		var metricData = meterInfo.getMetricNode(meterInfo.className, meterInfo.metricName, json);
		if (metricData) {
			updateMeterData(meterInfo, metricData);
		}
	}

	function updateMeterData(meterInfo, meterData) {
		// set the big counter
		var gaugeDiv = $("#" + meterInfo.divId + " div.counterVal");

		gaugeDiv.html(meterData.rate_units + " (" + meterData.count + " total)");

		var maxRate = Math.max(meterData['mean_rate'],meterData['m1_rate'],meterData['m5_rate'],meterData['m15_rate']);

		// set the mean count
		setMeterRow(meterInfo, meterData, "mean_rate", "mean", maxRate);
		setMeterRow(meterInfo, meterData, "m1_rate", "onemin", maxRate);
		setMeterRow(meterInfo, meterData, "m5_rate", "fivemin", maxRate);
		setMeterRow(meterInfo, meterData, "m15_rate", "fifteenmin", maxRate);
	}

	function setMeterRow(meterInfo, meterData, rowType, rowStyle) {
		setMeterRow(meterInfo, meterData, rowType, rowStyle, meterInfo.max);
	}

	function setMeterRow(meterInfo, meterData, rowType, rowStyle, max) {
		$("#" + meterInfo.divId + " tr." + rowStyle + " td.progressValue").html(formatNumber(meterData[rowType]));
		$("#" + meterInfo.divId + " tr." + rowStyle + " td.progressBar div.progress div.progress-bar")
			.css("width", calculatePercentage(meterData[rowType], max) + "%");
	}

	/*
	 * Gauge methods
	 */
	function drawGauge(gaugeInfo) {
		var parentDiv = $("#" + gaugeInfo.divId);
		var html = "<div class='metricsWatcher metric metricGraph'><div class='heading3'>" + gaugeInfo.title + "</span><div class='gaugeDataVal'></div></div>";
		parentDiv.html(html);
	}
	function updateGauge(gaugeInfo, json) {
		var metricData = gaugeInfo.getMetricNode(gaugeInfo.className, gaugeInfo.metricName, json);
		if (metricData) {
			updateGaugeData(gaugeInfo, metricData);
		}
	}
	function updateGaugeData(gaugeInfo, gaugeData) {
		var gaugeDiv = $("#" + gaugeInfo.divId + " div.gaugeDataVal");
		gaugeDiv.html(gaugeData.value);
	}

	/*
	 * GaugeTable methods
	 */
	function drawGaugeTable(divId, title, gauges) {
		var parentDiv = $("#" + divId);
		var html = "<div class='metricsWatcher metric metricGraph nested'>"
				+ "<fieldset><legend><div class='heading1'>" + title + "</div></legend>"
				+ "<div class='gaugeTableContainer'><table class='gaugeTable'></table></div></fieldset></div>";

		parentDiv.html(html);
	}
	function updateGaugeTable(divId, gauges, json) {
		var div = $("#" + divId + " table");

		var html = "";
		var length = gauges.length;
		for (var i = 0; i < length; i++) {
			var gauge = gauges[i];
			html += "<tr><td><h5>" + gauge.title + "</h5></td>"
				+ "<td><h4>" + gauge.getMetricNode(gauge.className, gauge.metricName, json).value
				+ "</h4></td></tr>";
		}
		div.html(html);
	}

	/*
	 * Cache methods
	 */
	function drawCache(cacheInfo) {
		var parentDiv = $("#" + cacheInfo.divId);

		var html = "<div class='metricsWatcher cache cacheGraph col-md-12'>"
				+ "<fieldset><legend><div class='heading1'>" + cacheInfo.title + "</div></legend>"
				+ "<div class='cacheContainer col-md-12'>"
				+ "	<div class='row'>"
				+ "		<div class='col-md-3'><div id='" + cacheInfo.divId + "Statistics'></div></div>"
				+ "		<div class='col-md-9'>"
				+ "			<div id='" + cacheInfo.divId + "gettimer'></div>"
				+ "			<div id='" + cacheInfo.divId + "puttimer'></div>"
				+ "		</div>"
				+ "	</div>"
				+ "</div></fieldset></div>";
		parentDiv.html(html);

		var length = cacheInfo.components.gauges.length;
		for (var i = 0; i < length; i++) {
			drawGauge(cacheInfo.components.gauges[i]);
		}
		drawTimer(cacheInfo.getTimer);
		drawTimer(cacheInfo.putTimer);
		drawGaugeTable(cacheInfo.divId + "Statistics", "Statistics", cacheInfo.components.gauges);
	}
	function updateCache(cacheInfo, json) {
		var length = cacheInfo.components.gauges.length;
		for (var i = 0; i < length; i++) {
			var gauge = cacheInfo.components.gauges[i];
			var data = gauge.getMetricNode(cacheInfo.className, gauge.metricName, json);
			if (data) {
				var gaugeDiv = $("#" + gauge.divId + " div.metricGraph div.gaugeDataVal");
				gaugeDiv.html(data.value);
			}
		}
		updateTimer(cacheInfo.getTimer, json);
		updateTimer(cacheInfo.putTimer, json);
		updateGaugeTable(cacheInfo.divId + "Statistics", cacheInfo.components.gauges, json);
	}

	/*
	 * JVM methods
	 */
	function drawJvm(jvmInfo) {
		var parentDiv = $("#" + jvmInfo.divId);
		var html = "<div class='metricsWatcher jvm metricGraph col-md-12'>"
				+ "<fieldset><legend><div  class='heading1 btn-link' data-toggle='collapse' data-target='#" + jvmInfo.divId + "Collapse'>" + jvmInfo.title + "</div></legend>"
				+ "<div class='jvmContainer col-md-12 collapse' id='" + jvmInfo.divId + "Collapse'>"
				+ "	<div id='" + jvmInfo.divId + "Vm'></div>"
				+ "</div>"
				+ "</fieldset></div>";
		parentDiv.html(html);
	}

	function updateJvm(jvmInfo, json) {
		var vmDiv = $("#" + jvmInfo.divId + "Vm");
		var jvm = json['gauges'];
		var html = "<div class='row'>"
				+ "<div class='col-md-3'><table class='jvmTable'><caption>Memory</caption>"
				+ "<tr><td><h5>Total Init</h5></td><td>" + jvm['jvm.memory.total.init'].value + "</td></tr>"
				+ "<tr><td><h5>Total Used</h5></td><td>" + jvm['jvm.memory.total.used'].value + "</td></tr>"
				+ "<tr><td><h5>Total Max</h5></td><td>" + jvm['jvm.memory.total.max'].value + "</td></tr>"
				+ "<tr><td><h5>Total Committed</h5></td><td>" + jvm['jvm.memory.total.committed'].value + "</td></tr>"
				+ "<tr><td><h5>Heap Init</h5></td><td>" + jvm['jvm.memory.heap.init'].value + "</td></tr>"
				+ "<tr><td><h5>Heap Used</h5></td><td>" + jvm['jvm.memory.heap.used'].value + "</td></tr>"
				+ "<tr><td><h5>Heap Max</h5></td><td>" + jvm['jvm.memory.heap.max'].value + "</td></tr>"
				+ "<tr><td><h5>Heap Committed</h5></td><td>" + jvm['jvm.memory.heap.committed'].value + "</td></tr>"
				+ "<tr><td><h5>Non Heap Init</h5></td><td>" + jvm['jvm.memory.non-heap.init'].value + "</td></tr>"
				+ "<tr><td><h5>Non Heap Used</h5></td><td>" + jvm['jvm.memory.non-heap.used'].value + "</td></tr>"
				+ "<tr><td><h5>Non Heap Max</h5></td><td>" + jvm['jvm.memory.non-heap.max'].value + "</td></tr>"
				+ "<tr><td><h5>Non Heap Committed</h5></td><td>" + jvm['jvm.memory.non-heap.committed'].value + "</td></tr>"
				+ "</table></div>"
				+ "<div class='col-md-3'><table class='jvmTable'><caption>Memory Usage</caption>"
				+ "<tr><td><h5>Heap Usage</h5></td><td>" + (jvm['jvm.memory.heap.usage'].value * 100).toFixed(2) + "</td></tr>"
				+ "<tr><td><h5>Non Heap Usage</h5></td><td>" + (jvm['jvm.memory.non-heap.usage'].value * 100).toFixed(2) + "</td></tr>"
				+ (!jvm['jvm.memory.pools.JIT-code-cache.usage']?"":("<tr><td><h5>JIT Code Cache Usage</h5></td><td>" + (jvm['jvm.memory.pools.JIT-code-cache.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.Code-Cache.usage']?"":("<tr><td><h5>JIT Code Cache Usage</h5></td><td>" + (jvm['jvm.memory.pools.Code-Cache.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.JIT-data-cache.usage']?"":("<tr><td><h5>JIT Data Cache Usage</h5></td><td>" + (jvm['jvm.memory.pools.JIT-data-cache.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.Java-heap.usage']?"":("<tr><td><h5>Java Heap Usage</h5></td><td>" + (jvm['jvm.memory.pools.Java-heap.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.class-storage.usage']?"":("<tr><td><h5>Class Storage Usage</h5></td><td>" + (jvm['jvm.memory.pools.class-storage.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.Perm-Gen.usage']?"":("<tr><td><h5>Perm Gen Usage</h5></td><td>" + (jvm['jvm.memory.pools.Perm-Gen.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.Tenured-Gen.usage']?"":("<tr><td><h5>Tenured Gen Usage</h5></td><td>" + (jvm['jvm.memory.pools.Tenured-Gen.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.miscellaneous-non-heap-storage.usage']?"":("<tr><td><h5>Misc Non Heap Storage Usage</h5></td><td>" + (jvm['jvm.memory.pools.miscellaneous-non-heap-storage.usage'].value * 100).toFixed(2)  + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.Survivor-Space.usage']?"":("<tr><td><h5>Survivor Space Usage</h5></td><td>" + (jvm['jvm.memory.pools.Survivor-Space.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+ (!jvm['jvm.memory.pools.Eden-Space.usage']?"":("<tr><td><h5>Eden Space Usage</h5></td><td>" + (jvm['jvm.memory.pools.Eden-Space.usage'].value * 100).toFixed(2) + "</td></tr>"))
				+"</table></div>"
				+ "<div class='col-md-3'><table class='jvmTable'><caption>Garbage Collection</caption>"
				+ "<tr><td><h5>PS Mark Sweep Runs</h5></td><td>" + jvm['jvm.gc.MarkSweepCompact.count'].value + "</td></tr>"
				+ "<tr><td><h5>PS Mark Sweep Time</h5></td><td>" + jvm['jvm.gc.MarkSweepCompact.time'].value + "</td></tr>"
				+ "<tr><td><h5>GC Copy Runs</h5></td><td>" + jvm['jvm.gc.Copy.count'].value + "</td></tr>"
				+ "<tr><td><h5>GC Copy Time</h5></td><td>" + jvm['jvm.gc.Copy.time'].value + "</td></tr>"
				+ "</table></div>"
				+ "<div class='col-md-3'><table class='jvmTable'><caption>Threads</caption>"
//				+ "<tr><td class='rowName'><h5>Name</h5></td><td>" + jvm['jvm.vm.name'].value + "</td></tr>"
//				+ "<tr><td><h5>Version</h5></td><td>" + jvm['jvm.vm.version'].value + "</td></tr>"
//				+ "<tr><td><h5>Current Time</h5></td><td>" + jvm['jvm.current_time'].value + "</td></tr>"
//				+ "<tr><td><h5>Uptime</h5></td><td>" + jvm['jvm.uptime'].value + "</td></tr>"
				+ "<tr><td><h5>FD Usage</h5></td><td>" + formatNumber(jvm['jvm.fd.usage'].value, 2) + "</td></tr>"
				+ "<tr><td><h5>Daemon Threads</h5></td><td>" + jvm['jvm.thread-states.daemon.count'].value + "</td></tr>"
				+ "<tr><td><h5>Threads</h5></td><td>" + jvm['jvm.thread-states.count'].value + "</td></tr>"
				+ "<tr><td><h5>Deadlocks</h5></td><td>" + jvm['jvm.thread-states.deadlocks'].value + "</td></tr>"
				+ "</table><table class='jvmTable'><caption>Thread States</caption>"
				+ "<tr><td><h5>Terminated</h5></td><td>" + jvm['jvm.thread-states.terminated.count'].value + "</td></tr>"
				+ "<tr><td><h5>Timed Waiting</h5></td><td>" + jvm['jvm.thread-states.timed_waiting.count'].value + "</td></tr>"
				+ "<tr><td><h5>Blocked</h5></td><td>" + jvm['jvm.thread-states.blocked.count'].value + "</td></tr>"
				+ "<tr><td><h5>Waiting</h5></td><td>" + jvm['jvm.thread-states.waiting.count'].value + "</td></tr>"
				+ "<tr><td><h5>Runnable</h5></td><td>" + jvm['jvm.thread-states.runnable.count'].value + "</td></tr>"
				+ "<tr><td><h5>New</h5></td><td>" + jvm['jvm.thread-states.new.count'].value + "</td></tr>"
				+ "</table></div></div>";

		vmDiv.html(html);
	};

	/*
	 * Web Server methods
	 */
	function drawWeb(webInfo) {
		var parentDiv = $("#" + webInfo.divId);
		var html = "<div class='metricsWatcher web metricGraph col-md-12'>"
				+ "<fieldset><legend><div class='heading1 btn-link' data-toggle='collapse' data-target='#"+webInfo.divId+"Collapse'>" + webInfo.title + "</div></legend>"
				+ "<div class='webContainer col-md-12' id='"+webInfo.divId+"Collapse'>"
				+ "	<div id='" + webInfo.divId + "Web'></div>"
				+ "<table><tr>"
				+ "<td colspan='4' class='requestsGraph col-md-12'></td>"
				+ "</tr><tr>"
				+ "<td class='activeRequestsGraph col-md-3'></td>"
				+ "<td class='responseCodesOkGraph col-md-3'></td>"
				+ "<td class='responseCodesCreatedGraph col-md-3'></td>"
				+ "<td class='responseCodesOtherGraph col-md-3'></td>"
				+ "</tr><tr>"
				+ "<td class='responseCodesBadRequestGraph col-md-3'></td>"
				+ "<td class='responseCodesNoContentGraph col-md-3'></td>"
				+ "<td class='responseCodesNotFoundGraph col-md-3'></td>"
				+ "<td class='responseCodesServerErrorGraph col-md-3'></td>"
				+ "</tr></table>"
				+ "</div>"
				+ "</fieldset></div>";
		parentDiv.html(html);

		drawTimer(webInfo.components.requestsInfo);
		drawCounter(webInfo.components.activeRequestsInfo);

		var length = webInfo.components.meters.length;
		for (var i = 0; i < length; i++) {
			drawMeter(webInfo.components.meters[i]);
		}
	};

	function updateWeb(webInfo, json) {
		updateTimer(webInfo.components.requestsInfo, json);
		updateCounter(webInfo.components.activeRequestsInfo, json);

		var length = webInfo.components.meters.length;
		for (var i = 0; i < length; i++) {
			updateMeter(webInfo.components.meters[i], json);
		}
	};

	/*
	 * Log4j events stream  methods
	 */
	function drawLog4j(log4jInfo) {
		var parentDiv = $("#" + log4jInfo.divId);
		var html = "<div class='metricsWatcher log4j metricGraph col-md-12'>"
				+ "<fieldset><legend><div class='heading1 btn-link' data-toggle='collapse' data-target='#"+log4jInfo.divId+"Collapse'>" + log4jInfo.title + "</div></legend>"
				+ "<div class='log4jContainer col-md-12' id='"+log4jInfo.divId+"Collapse'>"
				+ "	<div id='" + log4jInfo.divId + "Log4j'></div>"
				+ "<table><tr>"
				+ "<td colspan='4' class='col-md-12'></td>"
				+ "</tr><tr>"
				+ "<td class='all col-md-3'></td>"
				+ "<td class='fatal col-md-3'></td>"
				+ "<td class='error col-md-3'></td>"
				+ "<td class='warn col-md-3'></td>"
				+ "</tr><tr>"
				+ "<td class='info col-md-3'></td>"
				+ "<td class='debug col-md-3'></td>"
				+ "<td class='trace col-md-3'></td>"
				+ "</tr></table>"
				+ "</div>"
				+ "</fieldset></div>";
		parentDiv.html(html);

		var length = log4jInfo.components.meters.length;
		for (var i = 0; i < length; i++) {
			drawMeter(log4jInfo.components.meters[i]);
		}
	};

	function updateLog4j(log4jInfo, json) {
		var length = log4jInfo.components.meters.length;
		for (var i = 0; i < length; i++) {
			updateMeter(log4jInfo.components.meters[i], json);
		}
	};

}(window.metricsWatcher = window.metricsWatcher || {}, jQuery));
