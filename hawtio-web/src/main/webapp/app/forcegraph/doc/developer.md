### ForceGraph

The force graph plugin adds a directive to hawtio that allows en easy and customizable way of displaying graph data as a D3 forced graph. The plugin has been inspired by the following D3 resources:

   * The [D3 homepage](http://d3js.org/) has a lot of examples and the force layout graphs is just one category.
   * The main work was inspired by [this blog entry](http://bl.ocks.org/mbostock/4062045).
   * The inspiration for zoom, pan and custom tooltips are coming [from here](http://bl.ocks.org/bentwonk/2514276).
   * Finally, [here](http://www.befundoo.com/university/tutorials/angularjs-directives-tutorial/) is a very good tutorial for writing Angular JS directives in general. 

#### Using the force graph directive 

Using the directive is straight forward and an example is within the OSGi plugin visualizing the dependencies:

```html
<div ng-controller="Osgi.ServiceDependencyController">
  <div ng-hide="inDashboard" class="add-link">
    <a ng-href="{{addToDashboardLink()}}" title="Add this view to a Dashboard"><i class="icon-share"></i></a>
  </div>

    <div id="pop-up">
        <div id="pop-up-title"></div>
        <div id="pop-up-content"></div>
    </div>

  <div class="row-fluid">
    <div class="span12 canvas">
      <div hawtio-force-graph graph="graph" link-distance="100" charge="-300" nodesize="10" style="min-height: 800px"></div>
    </div>
  </div>

</div>
```


