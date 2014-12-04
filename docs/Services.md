## Services

When using hawtio with different back end services such as micro services there is a need to link to other web applications.

If hawtio is connected to a JVM then we tend to use [jolokia](http://jolokia.org/) to poll the available MBeans inside the JVM and show/hide plugins dynamically.

When using hawtio with [Kubernetes](http://kubernetes.io/) such as with [OpenShift V3](http://github.com/openshift/origin/), [Fabric8](http://fabric8.io/), RHEL Atomic or Google Container Engine (GKE) then we can discover services using the standard Kubernetes Service REST API. By default this is mapped to **/hawtio/service** inside the hawtio web application.

So you can view Kubernetes resources via:

* **/hawtio/service** views all services
* **/hawtio/pod** views all pods
* **/hawtio/service/cheese/foo.html** will view the **/foo.html** resource within the **cheese** service
* **/hawtio/pod/cheese/123/foo.html** will view the **/foo.html** resource within the **cheese** pod on port **123**

### Enabling/disabling tabs/buttons/menus

A common feature of hawtio is for the UI to update in real time based on the services running. When using Kubernetes this relates to services running in the entire Kubernetes cluster; not just whats inside the JVM which served up hawtio.

To do this we have a [few helper functions](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/service/js/serviceHelpers.ts#L11) in the Services plugin to be able to enable/disable nav bars, buttons and menus based on the presence of a service.

e.g. [here's how we can add the Kibana and Grafana links](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/kubernetes/js/kubernetesPlugin.ts#L98-98) to the Kubernetes console based on if their respective services are running in Kubernetes
