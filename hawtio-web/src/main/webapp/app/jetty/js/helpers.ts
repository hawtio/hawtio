module Jetty {

    export function iconClass(state:string) {
      if (state) {
        switch (state.toString().toLowerCase()) {
          case 'started':
            return "green icon-play";
          case 'true':
            return "green icon-play";
        }
      }
      return "red icon-stop";
    }

}