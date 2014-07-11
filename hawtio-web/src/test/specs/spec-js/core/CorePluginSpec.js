
describe("hawtioCore module definition", function() {

  beforeEach(module("hawtioCore"));

  it("Checks the Jolokia URL", function() {
    console.info(Core.jolokiaUrl);
  });

  it("Get hawtioCore module injected", inject(function($window, layoutTree) {
    spyOn($window, "alert").andCallFake(function(arg) {console.info(arg)});
    $window.alert("ASD");
    console.info("$window: " + $window);
    console.info("layoutTree: " + layoutTree);
  }));

});
