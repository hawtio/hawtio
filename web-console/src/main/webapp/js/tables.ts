class TableWidget {
  private ignoreColumnHash = {};
  private flattenColumnHash = {};
  private bodyFormat: string;
  private openMessages = [];

  constructor(public scope, public workspace:Workspace, public dataTableColumns, public config:TableWidgetConfig = {}) {
    angular.forEach(config.ignoreColumns, (name) => {
      this.ignoreColumnHash[name] = true;
    });
    angular.forEach(config.flattenColumns, (name) => {
      this.flattenColumnHash[name] = true;
    });
  }

  public populateTable(data) {
    var $scope = this.scope;
    if (!data) {
      $scope.messages = [];
    } else {
      $scope.messages = data;

      var formatMessageDetails = (dataTable, parentRow) => {
        var oData = dataTable.fnGetData(parentRow);
        return this.generateDetailHtml(oData);
      };

      var array = data;
      if (angular.isArray(data)) {
      } else if (angular.isObject(data)) {
        array = [];
        angular.forEach(data, (object) => array.push(object));
      }

      var tableElement = $('#grid');
      var tableTr = $(tableElement).find("tr");
      var ths = $(tableTr).find("th");

      // lets add new columns based on the data...
      var columns = this.dataTableColumns.slice();

      var addColumn = (key, title) => {
        columns.push({
          mDataProp: key
        });

        // lets see if we need to add another <th>
        if (tableTr) {
          $("<th>" + title + "</th>").appendTo(tableTr);
        }
      };

      var checkForNewColumn = (value, key, prefix) => {
        // lets check if we have a column data for it (if its not ignored)
        var found = this.ignoreColumnHash[key] || columns.any({mDataProp: key});
        if (!found) {
          // lets check if its a flatten column
          if (this.flattenColumnHash[key]) {
            // TODO so this only works on the first row - sucks! :)
            if (angular.isObject(value)) {
              var childPrefix = prefix + key + ".";
              angular.forEach(value, (value, key) => checkForNewColumn(value, key, childPrefix));
            }
          } else {
            addColumn(prefix + key, humanizeValue(key))
          }
        }
      };

      if (!this.config.disableAddColumns && angular.isArray(array) && array.length > 0) {
        var first = array[0];
        if (angular.isObject(first)) {
          angular.forEach(first, (value, key) => checkForNewColumn(value, key, ""));
        }
      }

      var config = {
        bPaginate: false,
        sDom: 'Rlfrtip',
        bDestroy: true,
        aaData: array,
        aoColumns: columns
      };
      $scope.dataTable = tableElement.dataTable(config);

      var widget = this;

      $('#grid td.control').click(function () {
        var dataTable = $scope.dataTable;
        var parentRow = this.parentNode;
        var i = $.inArray(parentRow, openMessages);
        var openMessages = widget.openMessages;

        var element = $('i', this);
        if (i === -1) {
          element.removeClass('icon-plus');
          element.addClass('icon-minus');
          var dataDiv = formatMessageDetails(dataTable, parentRow);
          var detailsRow = dataTable.fnOpen(parentRow, dataDiv, 'details');
          $('div.innerDetails', detailsRow).slideDown();
          openMessages.push(parentRow);
          var textAreas = $(detailsRow).find("textarea.messageDetail");
          var textArea = textAreas[0];
          if (textArea) {
            var format = widget.bodyFormat;
            var editorSettings = createEditorSettings(this.workspace, format, {
              readOnly: true
            });
            var editor = CodeMirror.fromTextArea(textArea, editorSettings);
            // TODO make this editable preference!
            var autoFormat = true;
            if (autoFormat) {
              autoFormatEditor(editor);
            }
          }
        } else {
          element.removeClass('icon-minus');
          element.addClass('icon-plus');
          dataTable.fnClose(parentRow);
          openMessages.splice(i, 1);
        }
      });
    }
    $scope.$apply();
  }

  generateDetailHtml(oData) {
    var body = oData["Text"];
    if (!body) {
      var bodyValue = oData["body"];
      if (angular.isObject(bodyValue)) {
        body = bodyValue["text"];
      } else {
        body = bodyValue;
      }
    }
    if (!body) body = "";

    // lets guess the payload format
    this.bodyFormat = "javascript";
    var trimmed = body.trimLeft().trimRight();
    if (trimmed && trimmed.first() === '<' && trimmed.last() === '>') {
      this.bodyFormat = "xml";
    }
    var rows = 1;
    body.each(/\n/, () => rows++);
    var answer = '<div class="innerDetails span12" title="Message payload">' +
            '<textarea readonly class="messageDetail" class="input-xlarge" rows="' + rows + '">' +
            body +
            '</textarea>' +
            '</div>';
    return answer;
  }
}

interface TableWidgetConfig {
  ignoreColumns?:string[];
  flattenColumns?:string[];
  disableAddColumns?:Boolean;
}