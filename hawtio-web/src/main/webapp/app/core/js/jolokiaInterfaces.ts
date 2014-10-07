module Core {

  // interfaces that represent the response from 'list', 
  // TODO should maybe put this in jolokia-1.0.d.ts

  /**
   * Operation arguments are stored in a map of argument name -> type
   */
  export interface JMXOperationArgument {
    name: string;
    desc: string;
    type: string;
  }

  /**
   * Schema for a JMX operation object
   */
  export interface JMXOperation {
    args: Array<JMXOperationArgument>;
    desc: string;
    ret: string;
    canInvoke?: boolean;
  }

  /**
   * JMX operation object that's a map of the operation name to the operation schema
   */
  export interface JMXOperations {
    [methodName:string]: JMXOperation;
  }

  /**
   * JMX attribute object that contains the type, description and if it's read/write or not
   */
  export interface JMXAttribute {
    desc: string;
    rw: boolean;
    type: string;
    canInvoke?: boolean;
  }

  /**
   * JMX mbean attributes, attribute name is the key
   */
  export interface JMXAttributes {
    [attributeName:string]: JMXAttribute;
  }

  /**
   * JMX mbean object that contains the operations/attributes
   */
  export interface JMXMBean {
    op: JMXOperations;
    attr: JMXAttributes;
    desc: string;
  }

  /**
   * Individual JMX domain, mbean names are stored as keys
   */
  export interface JMXDomain {
    [mbeanName:string]: JMXMBean;
  }

  /**
   * The top level object returned from a 'list' operation
   */
  export interface JMXDomains {
    [domainName:string]: JMXDomain;
  }

  // helper functions
  export function operationToString(name:string, args:Array<JMXOperationArgument>) {
    if (!args || args.length === 0) {
      return name + '()';
    } else {
      return name + '(' + args.map((arg:JMXOperationArgument) => { return arg.type }).join(',') + ')';
    }
  }

}
