<!DOCTYPE html>
<html class="login-pf">
<head>
  <title>hawtio console</title>
  <base href='/hawtio/'></base>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="libs/patternfly/dist/css/patternfly.min.css">
  <link rel="stylesheet" href="libs/patternfly/dist/css/patternfly-additions.min.css">
</head>
<body>
  <span id="badge">
    <img src="<%= request.getAttribute("logoUrl") %>" alt="logo">
  </span>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div id="brand">
          <img src="<%= request.getAttribute("brandUrl") %>" alt="<%= request.getAttribute("brandName") %>">
        </div><!--/#brand-->
        <% if (((Boolean) request.getAttribute("wrong_password")).booleanValue()) { %>
        <div class="alert alert-danger">
          <span class="pficon pficon-error-circle-o"></span>
          Incorrect username or password
        </div>
        <% } %>
      </div><!--/.col-*-->
      <div class="col-sm-7 col-md-6 col-lg-5 login">
        <form class="form-horizontal" role="form" method="POST">
          <div class="form-group">
            <label for="username" class="col-sm-2 col-md-2 control-label">Username</label>
            <div class="col-sm-10 col-md-10">
              <input type="text" class="form-control" id="username" name="username"
                     value='<%= request.getAttribute("username") %>' tabindex="1" autofocus>
            </div>
          </div>
          <div class="form-group">
            <label for="password" class="col-sm-2 col-md-2 control-label">Password</label>
            <div class="col-sm-10 col-md-10">
              <input type="password" class="form-control" id="password" name="password" tabindex="2">
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12 col-sm-12 col-md-12 submit">
              <button type="submit" class="btn btn-primary btn-lg" tabindex="4">Log In</button>
            </div>
          </div>
        </form>
      </div><!--/.col-*-->
      <div class="col-sm-5 col-md-6 col-lg-7 details">
      </div><!--/.col-*-->
    </div><!--/.row-->
  </div><!--/.container-->
</body>
</html>
