/**
 * @module Maven
 */
module Maven {

  export function PomXmlController($scope) {
    $scope.mavenPomXml = "\n" +
            "  <dependency>\n" +
            "    <groupId>" + orBlank($scope.row.groupId) + "</groupId>\n" +
            "    <artifactId>" + orBlank($scope.row.artifactId) + "</artifactId>\n" +
            "    <version>" + orBlank($scope.row.version) + "</version>\n" +
            "  </dependency>\n";

    function orBlank(text:string) {
      return text || "";
    }
  }
}
