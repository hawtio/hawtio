/// <reference path="../../baseIncludes.ts"/>
module DockerRegistry {

  export interface DockerImageTag {
    [name:string]: string;
  }

  export interface DockerImageRepository {
    name: string;
    description: string;
    tags?: DockerImageTag;
  }
  
  export interface DockerImageRepositories {
    num_results: number
    query: string
    results: Array<DockerImageRepository>
  }

}
