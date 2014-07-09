/// <reference path="../lib/utils/testHelpers.ts"/>
/// <reference path="../../../main/webapp/app/helpers/js/selectionHelpers.ts"/>
describe("SelectionHelpers", () => {

  var GroupOfObjects = [{
    key: "one",
    selected: false
  }, {
    key: "two",
    selected: false
  }, {
    key: "three",
    selected: false
  }];


  var GroupOfStrings = ["one", "two", "three"];
  var SelectedStrings = [];

  beforeEach(() => {
    SelectionHelpers.selectNone(GroupOfObjects);
  });

  it("Should select every item in the group", () => {
    SelectionHelpers.selectAll(GroupOfObjects);
    expect(GroupOfObjects.all((o) => { return o.selected; })).toBeTruthy();
  });

  it("Should deselect every item in the group", () => {
    GroupOfObjects.forEach((o) => { o.selected = true });
    expect(GroupOfObjects.all((o) => { return o.selected; })).toBeTruthy();
    SelectionHelpers.selectNone(GroupOfObjects);
    expect(GroupOfObjects.all((o) => { return !o.selected; })).toBeTruthy();
  });

  it("Should make this guy selected", () => {
    SelectionHelpers.toggleSelection(GroupOfObjects.last());
    expect(GroupOfObjects.last()['selected']).toBeTruthy();
  });

  it("Should deselect the last and only select the first", () => {
    SelectionHelpers.select(GroupOfObjects, GroupOfObjects.first(), {});
    expect(GroupOfObjects.last()['selected']).toBeFalsy();
    expect(GroupOfObjects.first()['selected']).toBeTruthy();
  });

  var GroupWithArrays = [{
    id: 'one',
    tags: ['one', 'two', 'three']
  }, {
    id: 'two',
    tags: ['two']
  }, {
    id: 'three',
    tags: ['two', 'three']
  }];

  var selectedTags = ['two', 'three'];

  it("Should select the first and last element from this array", () => {
    var filtered = GroupWithArrays.filter((o) => {
      return SelectionHelpers.filterByGroup(selectedTags, o['tags']);
    });
    expect(filtered.length).toEqual(2);
  });

  it("Should select only the first element if we add this other tag", () => {
    SelectionHelpers.toggleSelectionFromGroup(selectedTags, 'one');
    var filtered = GroupWithArrays.filter((o) => {
      return SelectionHelpers.filterByGroup(selectedTags, o['tags']);
    });
    expect(filtered.length).toEqual(1);
    SelectionHelpers.toggleSelectionFromGroup(selectedTags, 'one');
    filtered = GroupWithArrays.filter((o) => {
      return SelectionHelpers.filterByGroup(selectedTags, o['tags']);
    });
    expect(filtered.length).toEqual(2);
  })


});
