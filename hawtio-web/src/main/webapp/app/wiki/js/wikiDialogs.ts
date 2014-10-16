module Wiki {

  export interface WikiDialog {
    open: () => {};
    close: () => {};
  }

  export interface RenameDialogOptions {
    rename: () => {};
    fileExists: () => {};
    fileName: () => String;
    callbacks: () => String;
  }

  export function getRenameDialog($dialog, $scope:RenameDialogOptions):Wiki.WikiDialog {
    return $dialog.dialog({
      resolve: $scope,
      templateUrl: 'app/wiki/html/modal/renameDialog.html',
      controller: ["$scope", "dialog",  "callbacks", "rename", "fileExists", "fileName", ($scope, dialog, callbacks, rename, fileExists, fileName) => {
        $scope.rename  = rename;
        $scope.fileExists  = fileExists;
        $scope.fileName  = fileName;

        $scope.close = (result) => {
          dialog.close();
        };

        $scope.renameAndCloseDialog = callbacks;

      }]
    });
  }

  export interface MoveDialogOptions {
    move: () => {};
    folderNames: () => {};
    callbacks: () => String;
  }


  export function getMoveDialog($dialog, $scope:MoveDialogOptions):Wiki.WikiDialog {
    return $dialog.dialog({
      resolve: $scope,
      templateUrl: 'app/wiki/html/modal/moveDialog.html',
      controller: ["$scope", "dialog",  "callbacks", "move", "folderNames", ($scope, dialog, callbacks, move, folderNames) => {
        $scope.move  = move;
        $scope.folderNames  = folderNames;

        $scope.close = (result) => {
          dialog.close();
        };

        $scope.moveAndCloseDialog = callbacks;

      }]
    });
  }


  export interface DeleteDialogOptions {
    callbacks: () => String;
    selectedFileHtml: () => String;
  }


  export function getDeleteDialog($dialog, $scope:DeleteDialogOptions):Wiki.WikiDialog {
    return $dialog.dialog({
      resolve: $scope,
      templateUrl: 'app/wiki/html/modal/deleteDialog.html',
      controller: ["$scope", "dialog",  "callbacks", "selectedFileHtml", ($scope, dialog, callbacks, selectedFileHtml) => {

        $scope.selectedFileHtml = selectedFileHtml;

        $scope.close = (result) => {
          dialog.close();
        };

        $scope.deleteAndCloseDialog = callbacks;

      }]
    });
  }





}