/// <reference path="../../baseIncludes.ts"/>
module Forms {

  // add some type interfaces for hawtio-form's config

  /**
   * Map of name/value pairs that get mapped to element attributes
   */
  export interface AttributeMap {
    [key:string]: string;
  }

  /**
   * Element in a FormConfiguration's 'properties' attribute
   */
  export interface FormElement {
    type: string;
    tooltip?: string;
    label?: string;
    hidden?: boolean;
    'input-attributes'?: AttributeMap;
    'control-group-attributes'?: AttributeMap;
    formTemplate?: string;
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
    [name:string]: Array<string>;
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
    id?: string;
    type?: string;
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
    key?: string;
    headerTemplate: string;
    template: string;
  }

  export interface FormGridProperties {
    [name:string]: FormGridElement;
  }

  export interface FormGridRowConfiguration extends FormConfiguration {
    properties: FormGridProperties;
    columnOrder: Array<string>;
  }

  export interface FormGridConfiguration {
    heading?: boolean;
    rowName?: string;
    rowSchema: FormGridRowConfiguration;
    rows: Array<any>;
    onAdd: () => any;
    noDataTemplate: string;
  }

  export function createFormGridConfiguration():FormGridConfiguration {
    return <FormGridConfiguration> {
      rowSchema: <FormGridRowConfiguration> {},
      rows: <Array<any>> []
    };
  }


}
