# Hawtio Test Overview
The following tests cover both Hawtio Online and Standalone. Hawtio Online specific tests has its own entry in this document, Standalone specific cases are also described. 

# Camel Plugin Functional Tests in Hawtio 

This suite checks that Camel-related pages in Hawtio correctly display and manage Camel contexts, endpoints, routes, and key operations.

---

## Context Page

- **Attributes Tab:**  
  Table isn't empty; key attributes like `CamelId: SampleCamel`, `State: Started` are present.

- **Operations Tab:**  
  Executing operations returns correct values:
  - `getCamelId()` → "SampleCamel"
  - `isLogMask()` → "false"
  - `getTotalRoutes()` → "6"

- **Charts:**  
  Metric watches can be edited; chart updates as expected.

- **Start/Suspend:**  
  State transitions work (`Started`/`Suspended`).

---

## Endpoints Page

- **Endpoints Table:**  
  Non-empty; expected URIs and their states are present.

- **Add Endpoint:**  
  Endpoints can be created via URI or form.

---

## Specific Endpoint Page

- **Attributes Table:**  
  Contains expected keys and values.

- **Sort/Details:**  
  Sorting works. Attribute details show correct data.

- **Operations:**  
  Calls like `getCamelId()` return correct values.

- **Messages:**  
  Messages can be sent, browsed, and forwarded between endpoints.

---

## Routes Page

- **Routes Table:**  
  Table columns (Name, State, etc.) populated with correct data.

- **Diagram:**  
  No overlay or duplicate nodes; diagram is shown.

- **Actions:**  
  Stop/start, delete route workflows function.

- **Groups:**  
  Grouped routes displayed as expected.

---

## Specific Route Page

- **Attributes/Sorting:**  
  Attribute table is populated and sortable.

- **Debug/Trace:**  
  Can start/stop debug/tracing, manage breakpoints.

- **Charts/Properties:**  
  Chart editing works; properties tab shows correct values.

---

## Camel Tree

- **Expand/Collapse/Filter:**  
  Tree navigation and filtering work as expected.

---

**Summary:**  
Tests confirm tables aren’t empty, data is accurate, actions (operational, CRUD, navigation) work, and advanced features (debug, trace) are functional.

# JMX Tree Functional Tests in Hawtio

These tests ensure that the JMX tree in Hawtio's JMX plugin responds correctly to user interactions for expanding, collapsing, and filtering.

---

## Scenarios

- **Expanding the Tree**
  - User expands the JMX tree.
  - All JMX tree nodes become expanded (visible).

- **Collapsing the Tree**
  - User collapses the JMX tree.
  - All JMX tree nodes become hidden (collapsed).

- **Filtering the Tree**
  - User filters the tree with the string "simple".
  - Only nodes matching "simple" are shown; others are filtered out.

---

**Summary:**  
These tests confirm that the JMX tree UI reliably supports expand/collapse actions and dynamic filtering.

# About Modal, Help Page, and Plugin Page Tests 
> **Note:**  
> Plugin Page Test is Hawtio Standalone specific.

## About Modal
- **Standalone:** Check "Hawtio Management Console" header and component (e.g., "Hawtio React") appear and modal closes.
- **Online:** Check "Red Hat build of HawtIO" header, components ("Hawtio React", "Hawtio Online") appear and modal closes.

## Help Page
- **Links:** Clicking Help links (Hawtio, contributing, GitHub) goes to correct URLs and allows returning.
- **Tabs:** Each tab (Home, Preferences, JMX, Camel, etc.) shows content.

## Plugin Page
- "Sample Plugin" page displays correct title and description.

---
**Summary:**  
Tests ensure About, Help, and Plugin pages show correct info, links, and content in Hawtio.

# Hawtio Online (on OpenShift) Test Coverage
> **Note:**  
> Hawtio Online specific.

This suite of integration and E2E tests ensures that Hawtio Online works reliably on OpenShift, with a focus on cluster discovery, resource management, UI behavior, operator-driven configuration, and correct handling of OpenShift workflows.

---

## ClusterDiscovery Test

- **Cluster Mode Setup:**  
  Starts an instance of cluster-scoped Hawtio, logs in, waits for cluster data to load.
- **Basic Discovery:**  
  Deploys a test app to a fresh namespace, validates that the app appears in the Hawtio “Discover” UI, cleans up all traces after the test.

---

## HawtioOnlineShell Test

- **OpenShift Console Links:**  
  Verifies links in the UI (deployment, pod, project) open the correct OpenShift Console views and content matches expectation.
- **Pod Display & Pod Status:**  
  Confirms all pod/replica counts and labels match k8s state and scale operations update UI as expected.
- **Search Functionality:**  
  Clicking labels in the Hawtio UI triggers correct OpenShift resource search.
- **Tab/window Handling:**  
  Ensures new browser windows/tabs are cleaned up and the login state is consistent before each test.

---

## HawtioOperator Test

- **Operator-Driven Features:**  
  Configuration of Hawtio instance via custom resource (CR):
  - **Disabled routes:** Disables entire UI plugins/routes and checks UI access.
  - **UI Customization:** Brand images, About box, logo, and titles can be customized via CR.
  - **Resource Requests:** Checks that pod containers get correct Kubernetes resources/limits.
  - **Project Selector:** Verifies only apps with specific labels/namespaces are discovered.
  - **Custom Console Link:** Sets a custom OpenShift Console link label via CR.
  - **Metadata Propagation:** Controls which labels/annotations are propagated to k8s resources.
  - **Custom Hostname / Route:** Verifies custom hostname routing works.
  - **NGINX resources:** Confirms nginx reverse-proxy configs are correctly applied in deployed pod config.
  - **RBAC:** Tests that user permissions (from ACL config) enable/disable specific UI and operations for different roles.
  - **Auth Config:** Validates setup for client TLS certificates and their automatic renewal via cronjob.

- **Robust Cleanup:**  
  Each operator test deploys, verifies, and then cleans up its Hawtio instance(s).

---

## NamespacedDiscoveryTest

- **Scaling:**  
  Tests that scaling a Deployment to multiple replicas is correctly reflected in the UI.
- **Multiple Deployments:**  
  Checks that apps deployed in the same namespace appear as expected in the discovery tab.
- **Namespace Restriction:**  
  Verifies Hawtio doesn’t display deployments from namespaces outside its configured scope.

---

**Summary:**  
These tests validate Hawtio Online's integration with OpenShift resource discovery, UI and pod management, operator-based configuration (including UI branding and advanced deployment options), access control, scaling, and correctness of resource metadata—all from an end-user perspective using real browser automation.

# Account Lockout (Throttling) Test 
> **Note:**  
> Hawtio Standalone specific.

This test checks that the login throttling (anti-brute-force) mechanism works and the user account is locked out after repeated failed logins.
