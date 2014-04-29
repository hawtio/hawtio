/**
 * @module Wiki
 */
 module Wiki {
  export function GitPreferences($scope, localStorage, userDetails) {
    Core.initPreferenceScope($scope, localStorage, {
      'gitUserName': {
        'value': userDetails.username
      },
      'gitUserEmail': {
        'value': ''
      }  
    });

  }
 }