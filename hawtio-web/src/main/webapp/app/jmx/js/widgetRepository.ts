module Jmx {

  export function createDashboardLink(widgetType, widget) {
    var href = "#" + widgetType.route;
    var routeParams = angular.toJson(widget);
    var title = widget.title;
    var size = angular.toJson({
      size_x: widgetType.size_x,
      size_y: widgetType.size_y
    });

    return "/dashboard/add?tab=dashboard" +
        "&href=" + encodeURIComponent(href) +
        "&size=" + encodeURIComponent(size) +
        "&title=" + encodeURIComponent(title) +
        "&routeParams=" + encodeURIComponent(routeParams);
  }

  export function getWidgetType(widget) {
    return jmxWidgetTypes.find((type) => {
      return type.type === widget.type;
    });
  }

  export var jmxWidgetTypes = [
    {
      type: "donut",
      icon: "icon-smile",
      route: "/jmx/widget/donut",
      size_x: 1,
      size_y: 1,
      title: "Add Donut chart to Dashboard"
    }
  ];

  export var jmxWidgets = [
    {
      type: "donut",
      title: "Java Heap Memory",
      mbean: "java.lang:type=Memory",
      attribute: "HeapMemoryUsage",
      total: "Max",
      terms: "Used",
      remaining: "Free"
    },
    {
      type: "donut",
      title: "Java Non Heap Memory",
      mbean: "java.lang:type=Memory",
      attribute: "NonHeapMemoryUsage",
      total: "Max",
      terms: "Used",
      remaining: "Free"
    },
    {
      type: "donut",
      title: "File Descriptor Usage",
      mbean: "java.lang:type=OperatingSystem",
      total: "MaxFileDescriptorCount",
      terms: "OpenFileDescriptorCount",
      remaining: "Free"
    },
    {
      type: "donut",
      title: "Loaded Clases",
      mbean: "java.lang:type=ClassLoading",
      total: "TotalLoadedClassCount",
      terms: "LoadedClassCount,UnloadedClassCount",
      remaining: "-"
    },
    {
      type: "donut",
      title: "Swap Size",
      mbean: "java.lang:type=OperatingSystem",
      total: "TotalSwapSpaceSize",
      terms: "FreeSwapSpaceSize",
      remaining: "Used Swap"
    }
  ];


}
