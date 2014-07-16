/// <reference path="fabricGlobals.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module Fabric {

  export function doAction(action, jolokia, arguments, success, error = Core.defaultJolokiaErrorHandler) {
    jolokia.request(
        {
          type: 'exec', mbean: managerMBean,
          operation: action,
          arguments: arguments
        },
        {
          method: 'POST',
          success: success,
          error: error
        });
  }

  export function applyPatches(jolokia, files, targetVersion, newVersionName, proxyUser, proxyPass, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('applyPatches(java.util.List,java.lang.String,java.lang.String,java.lang.String,java.lang.String)', jolokia, [files, targetVersion, newVersionName, proxyUser, proxyPass], success, error);
  }

  export function setContainerProperty(jolokia, containerId, property, value, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('setContainerProperty(java.lang.String, java.lang.String, java.lang.Object)', jolokia, [containerId, property, value], success, error);
  }

  export function deleteConfigFile(jolokia, version, profile, pid, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('deleteConfigurationFile(java.lang.String, java.lang.String, java.lang.String)', jolokia, [version, profile, pid], success, error);
  }

  export function newConfigFile(jolokia, version, profile, pid, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('setConfigurationFile(java.lang.String, java.lang.String, java.lang.String, java.lang.String)', jolokia, [version, profile, pid, ''], success, error);
  }

  export function saveConfigFile(jolokia, version, profile, pid, data, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('setConfigurationFile(java.lang.String, java.lang.String, java.lang.String, java.lang.String)', jolokia, [version, profile, pid, data], success, error);
  }

  export function addProfilesToContainer(jolokia, container, profiles, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('addProfilesToContainer(java.lang.String, java.util.List)', jolokia, [container, profiles], success, error);
  }

  export function removeProfilesFromContainer(jolokia, container, profiles, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('removeProfilesFromContainer(java.lang.String, java.util.List)', jolokia, [container, profiles], success, error);
  }

  export function applyProfiles(jolokia, version, profiles, containers, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('applyProfilesToContainers(java.lang.String, java.util.List, java.util.List)', jolokia, [version, profiles, containers], success, error);
  }

  export function migrateContainers(jolokia, version, containers, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('applyVersionToContainers(java.lang.String, java.util.List)', jolokia, [version, containers], success, error);
  }

  export function changeProfileParents(jolokia, version, id, parents, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('changeProfileParents(java.lang.String, java.lang.String, java.util.List)', jolokia, [version, id, parents], success, error);
  }

  export function createProfile(jolokia, version, id, parents, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('createProfile(java.lang.String, java.lang.String, java.util.List)', jolokia, [version, id, parents], success, error);
  }

  export function copyProfile(jolokia, version, sourceName, targetName, force, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('copyProfile(java.lang.String, java.lang.String, java.lang.String, boolean)', jolokia, [version, sourceName, targetName, force], success, error);
  }

  export function createVersionWithParentAndId(jolokia, base, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('createVersion(java.lang.String, java.lang.String)', jolokia, [base, id], success, error);
  }

  export function createVersionWithId(jolokia, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('createVersion(java.lang.String)', jolokia, [id], success, error);
  }

  export function createVersion(jolokia, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('createVersion()', jolokia, [], success, error);
  }

  export function deleteVersion(jolokia, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('deleteVersion(java.lang.String)', jolokia, [id], success, error);
  }

  export function getContainerIdsForProfile(jolokia, version, profileId) {
    return jolokia.execute(Fabric.managerMBean, "containerIdsForProfile", version, profileId, { method: 'POST' });
  }

  export function deleteProfile(jolokia, version, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('deleteProfile(java.lang.String, java.lang.String)', jolokia, [version, id], success, error);
  }

  export function profileWebAppURL(jolokia, webAppId, profileId, versionId, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('profileWebAppURL', jolokia, [webAppId, profileId, versionId], success, error);
  }

  export function restApiUrl(jolokia, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('restApiUrl', jolokia, [], success, error);
  }
  
  export function stopContainer(jolokia, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('stopContainer(java.lang.String)', jolokia, [id], success, error);
  }

  export function destroyContainer(jolokia, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('destroyContainer(java.lang.String)', jolokia, [id], success, error);
  }

  export function startContainer(jolokia, id, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('startContainer(java.lang.String)', jolokia, [id], success, error);
  }

  export function containerWebAppURL(jolokia, webAppId, containerId, success, error = Core.defaultJolokiaErrorHandler) {
    doAction('containerWebAppURL', jolokia, [webAppId, containerId], success, error);
  }

  export function getDefaultVersionIdAsync(jolokia, callback:(defaultVersion:string) => void) {
    doAction('defaultVersion', jolokia, [], (response) => {
      callback(response.value['id']);
    });
  }

}
