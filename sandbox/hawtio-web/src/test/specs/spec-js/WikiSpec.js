describe("Wiki", function () {

  var fileNameParentData = [
    {
      path: "foo.xml",
      expectedName: "foo.xml",
      expectedPath: ""
    },
    {
      path: "/foo.xml",
      expectedName: "foo.xml",
      expectedPath: "/"
    },
    {
      path: "/foo/foo.xml",
      expectedName: "foo.xml",
      expectedPath: "/foo"
    },
    {
      path: "/foo/bar/foo.xml",
      expectedName: "foo.xml",
      expectedPath: "/foo/bar"
    }
  ];

  angular.forEach(fileNameParentData, function (sample) {
    var path = sample.path;
    var expectedName = sample.expectedName;
    var expectedParent = sample.expectedParent;

    it("file name and parent on path " + path), function () {
      expect(expectedName).toEqual(Wiki.fileName(path));
      expect(expectedParent).toEqual(Wiki.fileParent(path));
    };
  });

});