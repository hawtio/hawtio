function populateBrowseMessageTable($scope, workspace, dataTableColumns, data) {
  if (!data) {
    $scope.messages = [];
  } else {
    $scope.messages = data;

    var formatMessageDetails = (dataTable, parentRow) => {
      var oData = dataTable.fnGetData(parentRow);
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
      $scope.format = "javascript";
      var trimmed = body.trimLeft().trimRight();
      if (trimmed && trimmed.first() === '<' && trimmed.last() === '>') {
        $scope.format = "xml";
      }
      var rows = 1;
      body.each(/\n/, () => rows++);
      var answer = '<div class="innerDetails span12" title="Message payload">' +
              '<textarea readonly class="messageDetail" class="input-xlarge" rows="' + rows + '">' +
              body +
              '</textarea>' +
              '</div>';
      return answer;
    };

    $scope.dataTable = $('#grid').dataTable({
      bPaginate: false,
      sDom: 'Rlfrtip',
      bDestroy: true,
      aaData: data,
      aoColumns: dataTableColumns
    });


    $('#grid td.control').click(function () {
      var openMessages = $scope.openMessages;
      var dataTable = $scope.dataTable;
      var parentRow = this.parentNode;
      var i = $.inArray(parentRow, openMessages);

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
          var editorSettings = createEditorSettings(workspace, $scope.format, {
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