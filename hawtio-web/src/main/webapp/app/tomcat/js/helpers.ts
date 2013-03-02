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

}