module Core {

  /**
   * Provides an abstraction for stepping through a table in a detail view with next/previous/first/last options
   */
  export class TableDetailDialog extends Dialog {
    constructor(public $scope, public gridOptions) {
      super();
    }

    public first() {
      this.goToIndex(0);
    }

    public last() {
      this.goToIndex(this.tableLength() - 1);
    }

    public previous() {
      this.goToIndex(this.rowIndex() - 1);
    }

    public next() {
      this.goToIndex(this.rowIndex() + 1);
    }

    public isEmptyOrFirst() {
      var idx = this.rowIndex();
      var length = this.tableLength();
      return length <= 0 || idx <= 0;
    }

    public isEmptyOrLast() {
      var idx = this.rowIndex();
      var length = this.tableLength();
      return length < 1 || idx + 1 >= length;
    }

    public rowIndex() {
      return this.$scope.rowIndex;
    }

    public tableLength() {
      var name = this.gridOptions.data;
      if (name) {
        return Core.pathGet(this.$scope, [name, "length"]);
      }
      return 0;
    }

    public tableData() {
      var name = this.gridOptions.data;
      if (name) {
        return Core.pathGet(this.$scope, [name]);
      }
      return null;
    }

    public goToIndex(idx:number) {
      if (idx >= 0 && idx < this.tableLength()) {
        var data = this.tableData();
        var scope = this.$scope;
        if (data && idx < data.length) {
          //console.log("Navigating to index: " + idx);
          scope.row = data[idx];
          scope.rowIndex = idx;
        } else {
          console.log("No data for idx: " + idx);
        }
      } else {
        console.log("Ignoring idx out of range: " + idx);
      }
    }
  }
}