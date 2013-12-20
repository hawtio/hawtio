### Datatable

This plugin provides a programming API similar to [ng-grid](http://angular-ui.github.com/ng-grid/) for writing table/grids in angularjs but uses [jQuery DataTables](http://datatables.net/) as the underlying implementation.

For example if you are using ng-grid in some HTML:

    <div class="gridStyle" ng-grid="gridOptions"></div>

You can switch to jQuery DataTables using:

    <div class="gridStyle" hawtio-datatable="gridOptions"></div>

It supports most things we use in ng-grid like cellTemplate / cellFilter / width etc (though width's with values starting with "*" are ignored). We also support specifying external search text field & keeping track of selected items etc. To see it in action try the [log plugin](http://hawt.io/plugins/logs/) or check its [HTML](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/log/html/logs.html#L47) or [column definitions](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/log/js/logs.ts#L64)

### Simple Table

In addition, for cases where you don't want a fixed sized table but want a simple HTML table populated with the same JSON model as ng-grid or hawtio-datatable there is the simple table:

    <table class="table table-striped" hawtio-simple-table="mygrid"></table>

This lets you create a regular table element with whatever metadata you like and the &lt;thead&gt; and &lt;tbody&gt; will be generated from the column definitions to render the table dynamically; using the same kind of JSON configuration.

This means you can switch between ng-grid, hawtio-datatable and hawtio-simple-table based on your requirements and tradeoffs (layout versus performance versus dynamic, user configurable views etc).