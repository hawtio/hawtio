describe("Dozer", function () {

  it("can parse and save a Dozer XML file", function () {
    var model = null;
    var resultXml = null;
    var savedXmlText = null;
    var expectedXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<mappings xmlns="http://dozer.sourceforge.net" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://dozer.sourceforge.net http://dozer.sourceforge.net/schema/beanmapping.xsd">\n' +
    '  <mapping map-id="1234">\n' +
    '    <class-a>org.dozer.vo.copybyreference.TestA</class-a>\n' +
    '    <class-b>org.dozer.vo.copybyreference.TestB</class-b>\n' +
    '    <field>\n' +
    '      <a>oneA</a>\n' +
    '      <b>oneB</b>\n' +
    '    </field>\n' +
    '    <field copy-by-reference="true">\n' +
    '      <a>testReference</a>\n' +
    '      <b>testReference</b>\n' +
    '    </field>\n' +
    '  </mapping>\n' +
    '</mappings>';

    model = Dozer.loadDozerModel(expectedXml, "foo.xml");

    savedXmlText = Dozer.saveToXmlText(model);

    expect(savedXmlText).toEqual(expectedXml);
  });

});