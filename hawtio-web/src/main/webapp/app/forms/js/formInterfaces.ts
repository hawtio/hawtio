/// <reference path="../../baseIncludes.ts"/>
module Forms {

  // add some type interfaces for hawtio-form's config

  /**
   * Map of name/value pairs that get mapped to element attributes
   */
  export interface AttributeMap {
    [key:string]: String;
  }

  /**
   * Element in a FormConfiguration's 'properties' attribute
   */
  export interface FormElement {
    type: String;
    label?: String;
    hidden?: boolean;
    'input-attributes'?: AttributeMap;
    'control-group-attributes'?: AttributeMap;
    'formTemplate': String;
  }

  /**
   * Factory method to create a FormElement object
   * @returns {FormElement}
   */
  export function createFormElement():FormElement {
    return <FormElement> {
      type: undefined
    };
  }

  /**
   * Type for the FormConfiguration's 'properties' attribute
   */
  export interface FormProperties {
    [name:string]: FormElement;
  }

  /**
   * Type for the FormConfiguration's 'tabs' attribute
   */
  export interface FormTabs {
    [name:string]: Array<String>;
  }

  /**
   * Factory method to create a FormTabs object
   * @returns {FormTabs}
   */
  export function createFormTabs():FormTabs {
    return <FormTabs> {};
  }

  /**
   * Interface that describes the configuration object for hawtio forms
   */
  export interface FormConfiguration {
    id?: String;
    type?: String;
    disableHumanizeLabel?: boolean
    ignorePrefixInLabel?: boolean
    properties: FormProperties;
    tabs?: FormTabs;
  }

  /**
   * Factory method to create a FormConfiguration object
   * @returns {FormConfiguration}
   */
  export function createFormConfiguration():FormConfiguration {
    return <FormConfiguration> {
      properties: <FormProperties> {}
    }
  }

  export interface FormGridElement extends FormElement {
    key?: String;
    headerTemplate: String;
    template: String;
  }

  export interface FormGridProperties {
    [name:string]: FormGridElement;
  }

  export interface FormGridRowConfiguration extends FormConfiguration {
    properties: FormGridProperties;
    columnOrder: Array<String>;
  }

  export interface FormGridConfiguration {
    heading?: boolean;
    rowName?: String;
    rowSchema: FormGridRowConfiguration;
    rows: Array<any>;
    onAdd: () => any;
    noDataTemplate: String;
  }

  export function createFormGridConfiguration():FormGridConfiguration {
    return <FormGridConfiguration> {
      rowSchema: <FormGridRowConfiguration> {},
      rows: <Array<any>> []
    };
  }


}
