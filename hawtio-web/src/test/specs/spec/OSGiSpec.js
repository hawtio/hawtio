describe("OSGi", function() {
    it("helpers.toCollection()", function() {
        var array = [1, 2, 3];
        expect(Osgi.toCollection(array)).toEqual(array);

        var array2 = [42];
        expect(Osgi.toCollection(42)).toEqual(array2);
    });

    it("helpers.parseExportPackageHeaders1", function() {
        var value = {};
        value["Value"] = "org.foo.bar";
        var headers = {};
        headers["Export-Package"] = value;
        var result = Osgi.parseExportPackageHeaders(headers);

        expect(Object.keys(result).length).toEqual(1);
        expect(result["org.foo.bar"]).toEqual({});
        expect(result["org.foo.xxx"]).toEqual(undefined);
    });

    it("helpers.parseExportPackageHeaders2", function() {
        var value = {};
        value["Value"] = "org.foo.bar;version=1.2.3";
        var headers = {};
        headers["Export-Package"] = value;
        var result = Osgi.parseExportPackageHeaders(headers);

        expect(Object.keys(result).length).toEqual(1);
        var expected = {Aversion: "1.2.3"};
        expect(result["org.foo.bar"]).toEqual(expected);
    });

    it("helpers.parseExportPackageHeaders3", function() {
        var value = {};
        value["Value"] = "org.boo.far,org.foo.bar;version=1.2.3";
        var headers = {};
        headers["Export-Package"] = value;
        var result = Osgi.parseExportPackageHeaders(headers);

        expect(Object.keys(result).length).toEqual(2);
        var expected = {Aversion: "1.2.3"};
        expect(result["org.foo.bar"]).toEqual(expected);
        expect(result["org.boo.far"]).toEqual({});
    });

    it("helpers.parseExportPackageHeaders4", function() {
        var value = {};
        value["Value"] = "org.boo.far;attr=a;dir:=d";
        var headers = {};
        headers["Export-Package"] = value;
        var result = Osgi.parseExportPackageHeaders(headers);

        expect(Object.keys(result).length).toEqual(1);
        var expected = {Aattr: "a", Ddir: "d"};
        expect(result["org.boo.far"]).toEqual(expected);
    });

    it("helpers.handleExportedPackages1", function() {
        var result = Osgi.handleExportedPackages(["org.foo.bar;1.0.0"]);

        expect(Object.keys(result).length).toEqual(1);
        var expected = {ReportedVersion: "1.0.0"};
        expect(result["org.foo.bar"]).toEqual(expected);
    });
})