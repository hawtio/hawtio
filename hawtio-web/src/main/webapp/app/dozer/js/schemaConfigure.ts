/**
 * @module Dozer
 */
module Dozer {

  /**
   * Configures the JSON schemas to improve the UI models
   * @method schemaConfigure
   */
  export function schemaConfigure() {
    io_hawt_dozer_schema_Field["tabs"] = {
      'Fields': ['a.value', 'b.value'],
      'From Field': ['a\\..*'],
      'To Field': ['b\\..*'],
      'Field Configuration': ['*']
    };
    io_hawt_dozer_schema_Mapping["tabs"] = {
      'Classes': ['class-a.value', 'class-b.value'],
      'From Class': ['class-a\\..*'],
      'To Class': ['class-b\\..*'],
      'Class Configuration': ['*']
    };

    // hide the fields table from the class configuration tab
    io_hawt_dozer_schema_Mapping.properties.fieldOrFieldExclude.hidden = true;

    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "a", "properties", "value", "label"], "From Field");
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "b", "properties", "value", "label"], "To Field");

    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-a", "properties", "value", "label"], "From Class");
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-b", "properties", "value", "label"], "To Class");

    // ignore prefixes in the generated labels
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "a", "ignorePrefixInLabel"], true);
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "b", "ignorePrefixInLabel"], true);
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-a", "ignorePrefixInLabel"], true);
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-b", "ignorePrefixInLabel"], true);

    // add custom widgets
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-a", "properties", "value", "formTemplate"], classNameWidget("class_a"));
    Core.pathSet(io_hawt_dozer_schema_Mapping, ["properties", "class-b", "properties", "value", "formTemplate"], classNameWidget("class_b"));

    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "a", "properties", "value", "formTemplate"],
            '<input type="text" ng-model="dozerEntity.a.value" ' +
                  'typeahead="title for title in fromFieldNames($viewValue) | filter:$viewValue" ' +
                'typeahead-editable="true"  title="The Java class name"/>');
    Core.pathSet(io_hawt_dozer_schema_Field, ["properties", "b", "properties", "value", "formTemplate"],
            '<input type="text" ng-model="dozerEntity.b.value" ' +
                  'typeahead="title for title in toFieldNames($viewValue) | filter:$viewValue" ' +
                'typeahead-editable="true"  title="The Java class name"/>');

    function classNameWidget(propertyName) {
      return '<input type="text" ng-model="dozerEntity.' + propertyName + '.value" ' +
              'typeahead="title for title in classNames($viewValue) | filter:$viewValue" ' +
            'typeahead-editable="true"  title="The Java class name"/>';
    }
  }
}
