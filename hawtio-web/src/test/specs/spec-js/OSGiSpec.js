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

    it("helpers.labelBundleLinks", function() {
        var mockWorkSpace = {hash: function() {return "";}};
        var allValues = {39: {SymbolicName: "com.example.foo"},
            52: {SymbolicName: "org.acme.bar"}};

        var res = Osgi.labelBundleLinks(mockWorkSpace, "52", allValues);
        expect(res).toContain("#/osgi/bundle/52");
        expect(res).toContain("org.acme.bar");
        expect(res).not.toContain("#/osgi/bundle/39");
        expect(res).not.toContain("com.example.foo");

        var res2 = Osgi.labelBundleLinks(mockWorkSpace, "39", allValues);
        expect(res2).not.toContain("#/osgi/bundle/52");
        expect(res2).not.toContain("org.acme.bar");
        expect(res2).toContain("#/osgi/bundle/39");
        expect(res2).toContain("com.example.foo");
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

    it("bundle.formatServiceName", function() {
        expect(Osgi.formatServiceName("a.b.c.DDD")).toEqual("DDD");
        expect(Osgi.formatServiceName("NoPackage")).toEqual("NoPackage");
        expect(Osgi.formatServiceName(["org.osgi.service.log.LogService", "org.ops4j.pax.logging.PaxLoggingService", "org.knopflerfish.service.log.LogService", "org.osgi.service.cm.ManagedService"])).
            toEqual("LogService,ManagedService,PaxLoggingService");
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