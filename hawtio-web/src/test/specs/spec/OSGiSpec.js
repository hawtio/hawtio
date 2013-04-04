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
        var result = Osgi.parseManifestHeader(headers, "Export-Package");

        expect(Object.keys(result).length).toEqual(1);
        expect(result["org.foo.bar"]).toEqual({});
        expect(result["org.foo.xxx"]).toEqual(undefined);
    });

    it("helpers.parseExportPackageHeaders2", function() {
        var value = {};
        value["Value"] = "org.foo.bar;version=1.2.3";
        var headers = {};
        headers["Export-Package"] = value;
        var result = Osgi.parseManifestHeader(headers, "Export-Package");

        expect(Object.keys(result).length).toEqual(1);
        var expected = {Aversion: "1.2.3"};
        expect(result["org.foo.bar"]).toEqual(expected);
    });

    it("helpers.parseExportPackageHeaders3", function() {
        var value = {};
        value["Value"] = "org.boo.far,org.foo.bar;version=1.2.3";
        var headers = {};
        headers["Export-Package"] = value;
        var result = Osgi.parseManifestHeader(headers, "Export-Package");

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
        var result = Osgi.parseManifestHeader(headers, "Export-Package");

        expect(Object.keys(result).length).toEqual(1);
        var expected = {Aattr: "a", Ddir: "d"};
        expect(result["org.boo.far"]).toEqual(expected);
    });

    it("helpers.parseImportPackageHeaders1", function() {
        var value = {};
        value["Value"] = 'org.boo.far,org.foo.bar;version="[1.2.3,2)";resolution:=optional';
        var headers = {};
        headers["Import-Package"] = value;
        var result = Osgi.parseManifestHeader(headers, "Import-Package");

        expect(Object.keys(result).length).toEqual(2);
        var expected = {Aversion: '[1.2.3,2)', Dresolution: 'optional'};
        expect(result["org.foo.bar"]).toEqual(expected);
        expect(result["org.boo.far"]).toEqual({});
    });

    it("helpers.handleActualPackages1", function() {
        var result = Osgi.parseActualPackages(["org.foo.bar;1.0.0"]);

        expect(Object.keys(result).length).toEqual(1);
        var expected = {ReportedVersion: "1.0.0"};
        expect(result["org.foo.bar"]).toEqual(expected);
    });

    it("bundle.readBSNHeader", function() {
        expect(Osgi.readBSNHeaderData("blah.blah")).toEqual("");
        expect(Osgi.readBSNHeaderData("blah.blah;foo=bar;zoo:=zar")).toEqual("foo=bar;zoo:=zar");
    });

    it("bundle.formatAttributesAndDirectivesForPopover", function() {
        var data = { Aa: "test", Dresolution: "required", Aversion: "1.2.3.blah", Ddirective: "1.2.3" };
        expect(stripTags(Osgi.formatAttributesAndDirectivesForPopover(data, true))).
            toEqual("a=testdirective:=1.2.3resolution:=required");
        expect(stripTags(Osgi.formatAttributesAndDirectivesForPopover(data, false))).
            toEqual("a=testversion=1.2.3.blahdirective:=1.2.3resolution:=required");
    });

    function stripTags(text) {
        var rv = "";
        var inTag = false;
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if (c === '<') {
                inTag = true;
                continue;
            }
            if (inTag) {
                if (c === '>') {
                    inTag = false;
                }
                continue;
            }
            rv += c;
        }
        return rv;
    }
})