module Tomcat {

    export function filerTomcatOrCatalina(response) {
        if (response) {
            // Tomcat can have mbean server names with Catalina or Tomcat
            response = response.filter(name => {
                return name.startsWith("Catalina") || name.startsWith("Tomcat")
            })
        }
        return response
    };

    export function iconClass(state:string) {
      if (state) {
        switch (state.toString().toLowerCase()) {
          case '1':
            return "green icon-play";
          case 'started':
            return "green icon-play";
          case '0':
            return "red icon-stop";
          case 'stopped':
            return "red icon-stop";
        }
      }

      // Tomcat 5 uses 0 for stopped
      if (angular.isNumber(state)) {
        if (state.toString() === '0') {
          return "red icon-stop";
        }
      }

      return "icon-question-sign";
    }

    export function millisToDateFormat(time) {
      if (time) {
        var date = new Date(time);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      } else {
        return "";
      }
    }

    export function isTomcat5(name) {
      return name.toString().indexOf("Apache Tomcat/5") !== -1
    }

    export function isTomcat6(name) {
      return name.toString().indexOf("Apache Tomcat/6") !== -1
    }

}