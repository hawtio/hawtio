module Fabric {

  export interface JolokiaCallbacks {
    success: (response:any) => void;
    error: (response:any) => void;
  }

  // It's nicer to have type info, maybe we should start auto
  // generating these...

  export interface HostScalingRequirements {
    hostPatterns:Array<String>;
    hostTags:Array<String>;
  }

  export interface ChildScalingRequirements {
    rootcontainerPatterns:Array<String>;
  }

  export interface SshScalingRequirements extends HostScalingRequirements {
    
  }

  export interface DockerScalingRequirements extends HostScalingRequirements {

  }

  export interface OpenShiftScalingRequirements {

  }

  export interface ProfileRequirements {
    profile:String;
    minimumInstances:number;
    maximumInstances:number;
    dependentProfiles:Array<string>;
    maximumInstancesPerHost:number;
    childScalingRequirements:ChildScalingRequirements;
    sshScalingRequirements:SshScalingRequirements;
    dockerScalingRequirements:DockerScalingRequirements;
    openShiftScalingRequirements:OpenShiftScalingRequirements;
  }

  export interface HostConfiguration {
    hostname:String;
    port:Number;
    username:String;
    password:String;
    maximumContainerCount:Number;
    tags:Array<String>;
  }

  export interface SshHostConfiguration extends HostConfiguration {
    path:String;
    passPhrase:String;
    privateKeyFile:String;
    preferredAddress:String
  }

  export interface SshConfiguration {
    hosts:Array<SshHostConfiguration>;
    defaultPath:String;
    defaultPort:Number;
    defaultUsername:String;
    defaultPassword:String;
    fallbackRepositories:Array<String>;
    defaultPassPhrase:String;                         
    defaultPrivateKeyFile:String;
  }

  export interface DockerHostConfiguration extends HostConfiguration {
    path:String;
    passPhrase:String;
    privateKeyFile:String;
    preferredAddress:String
  }

  export interface DockerConfiguration {
    hosts:Array<DockerHostConfiguration>;
  }

  export interface FabricRequirements {
    profileRequirements:Array<ProfileRequirements>
    sshConfiguration:SshConfiguration;
    dockerConfiguration:DockerConfiguration;
    version:string
  }

  export interface Version {
    name?: string;
    id?: string;
    _default?: boolean;
  }

  export interface Profile {
    id?: string;
    name?: string;
    tags?: string[];
    versionId?: string;
    summary?: string;
    iconURL?: string;

    abstract?: boolean;
    hidden?: boolean;
    overlay?: boolean;
    containerCount?: number;
    // is really a map
    attributes?: any;
    // think this is an array
    associatedContainers?: any;
    // an array
    fileConfigurations?: any;

    bundles?: string[];
    configurationFileNames?: string[];
    configurations?: any;
    containerConfiguration?: any;
    endorsedLibraries?: any;
    extensionLibraries?: any;
    fabs?: string[];
    features?: string[];
    libraries?: string[];
    locked?: boolean
    optionals?: any
    overrides?: any
    parents?: string[]
    profileHash?: any
    repositories?: string[]
    summaryMarkdown?: string;
    version?: any
    parentIds?: string[];
    childIds?: string[]
    containers?: Container[]
  };
  
  export interface Container {
    alive?: boolean
    aliveAndOK?: boolean
    children?: string[]
    debugPort?: number
    ensembleServer?: boolean
    geoLocation?: string
    httpUrl?: string
    id?: string
    ip?: string
    jmxDomains?: string[]
    jmxUrl?: string
    jolokiaUrl?: string
    localHostname?: string
    localIp?: string
    location?: string
    managed?: boolean
    manualIp?: string
    maximumPort?: number
    metadata?: any
    minimumPort?: number
    overlayProfile?: Profile
    parent?: string
    processId?: string
    profiles?: Profile[]
    provisionChecksums?: string
    provisionException?: any
    provisionList?: string[]
    provisionResult?: string
    provisionStatus?: string
    provisionStatusMap?: any
    provisioningComplete?: boolean
    provisioningPending?: boolean
    publicHostname?: string
    publicIp?: string
    resolver?: string
    root?: boolean
    sshUrl?: string
    type?: string
    version?: string
    parentId?: string
    versionId?: string
    profileIds?: string[]
    childrenIds?: string[]
  };


}
