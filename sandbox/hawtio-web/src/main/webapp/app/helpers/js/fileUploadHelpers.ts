/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module FileUpload {

  export interface IFileItem {
    url:string;
    alias?: string;
    headers: any;
    formData: Array<any>;
    method: string;
    withCredentials: boolean;
    removeAfterUpload: boolean;
    index: number;
    progress: number;
    isReady: boolean;
    isUploading: boolean;
    isUploaded: boolean;
    isSuccess: boolean;
    isCancel: boolean;
    isError: boolean;
    uploader: FileUploader;

    // added this so we can access the json when we co-opt the uploader's tranpsort
    json?:string;

    // methods
    remove: () => void;
    upload: () => void;
    cancel: () => void;

    // callbacks
    onBeforeUpload: () => void;
    onProgress: (progress:number) => void;
    onSuccess: (response: any, status: number, headers: any) => void;
    onError: (response: any, status: number, headers: any) => void;
    onCancel: (response: any, status: number, headers: any) => void;
    onComplete: (response: any, status: number, headers: any) => void;

  }

  export interface IFilter {
    name: String;
    fn: (item:IFileItem) => boolean;
  }

  export interface IOptions {
    url: String;
    alias?: String;
    headers?: any;
    queue?: Array<IFileItem>;
    progress?: number;
    autoUpload?: boolean;
    removeAfterUpload?: boolean;
    method?: String;
    filters?: Array<IFilter>;
    formData?: Array<any>;
    queueLimit?: number;
    withCredentials?: boolean;
  }

  export interface FileUploader {
    // properties
    url: String;
    alias?: String;
    headers?: any;
    queue?: Array<any>;
    progress?: number;
    autoUpload?: boolean;
    removeAfterUpload?: boolean;
    method?: String;
    filters?: Array<IFilter>;
    formData?: Array<any>;
    queueLimit?: number;
    withCredentials?: boolean;

    // methods
    addToQueue: (files:FileList, options:any, filters: String) => void;
    removeFromQueue: (item:IFileItem) => void;
    clearQueue: () => void;
    uploadItem: (item:any) => void;
    cancelItem: (item:any) => void;
    uploadAll: () => void;
    cancelAll: () => void;
    destroy: () => void;
    isFile: (value:any) => boolean;
    isFileLikeObject: (value:any) => boolean;
    getIndexOfItem: (item:IFileItem) => number;
    getReadyItems: () => Array<IFileItem>;
    getNotUploadedItems: () => Array<IFileItem>;

    // callbacks
    onAfterAddingFile: (item:IFileItem) => void;
    onWhenAddingFileFailed: (item:IFileItem, filter:IFilter, options:any) => void;
    onAfterAddingAll: (addedItems:Array<IFileItem>) => void;
    onBeforeUploadItem: (item:IFileItem) => void;
    onProgressItem: (item:IFileItem, progress:number) => void;
    onSuccessItem: (item:IFileItem, response:any, status:number, headers:any) => void;
    onErrorItem: (item:IFileItem, response:any, status:number, headers:any) => void;
    onCancelItem: (item:IFileItem, response:any, status:number, headers:any) => void;
    onCompleteItem: (item:IFileItem, response:any, status:number, headers:any) => void;
    onProgressAll: (progress:number) => void;
    onCompleteAll: () => void;
  }

  interface FileUploaderInternal extends FileUploader {
    _xhrTransport:any;
    _onSuccessItem: (item:IFileItem, response:any, status:number, headers:any) => void;
    _onErrorItem: (item:IFileItem, response:any, status:number, headers:any) => void;
    _onCompleteItem: (item:IFileItem, response:any, status:number, headers:any) => void;
  }

  export interface RequestParameters {
    type:String;
    mbean:String;
    operation:String;
    arguments:Array<any>;
  }

  export function useJolokiaTransport(uploader:FileUploader, jolokia:any, onLoad:(json:string) => RequestParameters) {

    // cast the uploader to one that lets us fiddle with it's goodies
    var uploaderInternal = <FileUploaderInternal>uploader;
    var $rootScope = Core.injector.get("$rootScope");

    // replace the uploader's transport with one that can post a
    // jolokia request
    uploaderInternal._xhrTransport = (item) => {
      var reader = new FileReader();
      reader.onload = () => {
        // should be FileReader.DONE, but tsc didn't like that
        if (reader.readyState === 2) {
          var parameters = onLoad(reader.result);
          jolokia.request(parameters, onSuccess((response) => {
            item.json = reader.result;
            uploaderInternal._onSuccessItem(item, response, response.status, {});
            uploaderInternal._onCompleteItem(item, response, response.status, {});
            Core.$apply($rootScope);
          }, {
            error: (response) => {
              uploaderInternal._onErrorItem(item, response, response.status, {});
              uploaderInternal._onCompleteItem(item, response, response.status, {});
              Core.$apply($rootScope);
            }
          }));
        }
      };
      reader.readAsText(item._file);
    };
  }
}

