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
        switch (state.toLowerCase()) {
          case 'started':
            return "green icon-play";
        }
      }
      return "red icon-stop";
    }

    export function millisToDateFormat(time) {
      if (time) {
        var date = new Date(time);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      } else {
        return "";
      }
    }

}