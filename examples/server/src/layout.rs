
//! Note this layout module is not a very good strategy
//! using the rocket_contrib Templates is heavily recommended
//! for anything besides simple applications.
//! 
//! For instance, if you later decide to add any kind of privilege based
//! menu system or conditionally display information, like generation time
//! or even a custom title, Handlebars templates is a good solution. Try it.

use rocket::response::content::Html;

use auth::sanitization::*;
// use auth::authorization::*;

pub fn layout(contents: &str) -> Html<String> {
    // if padding should be added, add it here and change the contents variable name below
    let mut output = String::with_capacity(contents.len() + LAYOUT_HEADER.len() + LAYOUT_FOOTER.len() + 30);
    output.push_str(LAYOUT_HEADER);
    output.push_str(contents);
    output.push_str(LAYOUT_FOOTER);
    Html(output)
}

pub fn layoutSpoofing(contents: &str) -> Html<String> {
  let mut output = String::with_capacity(contents.len() + LAYOUT_HEADER.len() + LAYOUT_SIDEBAR.len() + LAYOUT_FOOTER.len() + 30);
    output.push_str(LAYOUT_HEADER);
    output.push_str(LAYOUT_SIDEBAR);
    output.push_str(contents);
    output.push_str(LAYOUT_FOOTER);
    Html(output)
}

pub fn layoutbis(contents: &str) -> Html<String> {
    let mut output = String::with_capacity(contents.len() + 30);
    output.push_str(contents);
    Html(output)
}

pub const LAYOUT_HEADER: &'static str = r##"
<!doctype html>
<html lang="en">
    <head>
        <title>FakeMyAs Server</title>
        
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        
        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="./bootstrap-4.5.3/css/bootstrap.min.css"/>
        
        <!-- Custom CSS -->
        <link id="css-stylesheet" type="text/css" href="css/blogr.css" rel="stylesheet" />
        <link id="css-stylesheet" type="text/css" href="css/adminlte.css" rel="stylesheet" />
        <link id="css-stylesheet" type="text/css" href="fonts/fontawesome-free/css/all.css" rel="stylesheet" />
        
        <!-- JavaScript -->
        <script src="sha256.js"></script>
        <script src="login.js"></script>
        <!--<script src="js/jquery/jquery.js"></script>
        <script src="js/adminlte.js"></script>
        <script src="bootstrap-4.5.3/js/bootstrap.bundle.js"></script>-->
        
        <!-- Leaflet -->
        <link rel="stylesheet" href="./leaflet/leaflet.css"/>

    </head>

    <!-- Preloader -->
    <!--<div class="preloader flex-column justify-content-center align-items-center">
      <img class="animation__shake" src="dist/img/AdminLTELogo.png" alt="AdminLTELogo" height="60" width="60">
    </div>-->

    <body class="sidebar-mini">
        <div id="mainWrapper" class="main-wrapper">
            
            <nav class="v-nav-bar sticky-top navbar navbar-expand-lg navbar-dark bg-dark" id="navbar">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <a class="blog-logo navbar-brand" id="logoNavbar" href="">FakeMyAs</a>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="v-nav navbar-nav mr-auto">
                        <!-- <li class="v-nav-item nav-item active"><a class="nav-link" href="">Home <span class="sr-only">(current)</span></a></li> -->
                        <li class="nav-item" id="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
      </li>
                        <li class="v-nav-item nav-item active"><a class="nav-link" href="/">Home</a></li>
                        <li class="v-nav-item nav-item active"><a class="nav-link" href="/map">Map</a></li>
                        <li class="v-nav-item nav-item active"><a class="nav-link" href="/spoofing">Spoofing</a></li>
                        <li class="v-nav-item nav-item active"><a class="nav-link" href="/logout">Logout</a></li>
                                                  
                        <!-- <li class="v-nav-item nav-item"><a class="nav-link disabled" href="#">Disabled</a></li> -->
                    </ul>
                    
                </div>
            </nav>
                        
"##;

pub const LAYOUT_SIDEBAR: &'static str = r##"
<!-- Main Sidebar Container -->
  <aside class="main-sidebar sidebar-dark-primary elevation-4" id="sidebar" style="z-index: 1019; margin-top: 55px;">
  <!-- Sidebar -->
    <div class="sidebar">
      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
          <!-- Add icons to the links using the .nav-icon class
               with font-awesome or any other icon font library -->
          <li class="nav-item">
            <a href="#" id="real-time" class="nav-link active">
              <i class="nav-icon fas fa-map-marked-alt"></i>
              <p>
                Real Time
              </p>
            </a>
          </li>
          <li class="nav-header">FOR BOAT</li>
          <li class="nav-item">
            <a href="#" id="trajectory" class="nav-link">
              <i class="nav-icon fas fa-route"></i>
              <p>
                Trajectory Smoothing
                <span class="right badge badge-danger">New</span>
              </p>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" id="heading" class="nav-link">
              <i class="nav-icon fas fa-location-arrow"></i>
              <p>
                Heading Shift
                <span class="right badge badge-danger">New</span>
                <span class="badge badge-info right" style="margin-right: 25px;">5°</span>
              </p>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" id="time-shift" class="nav-link">
              <i class="nav-icon fas fa-history"></i>
              <p>
                Time Shift
                <span class="right badge badge-danger">New</span>
              </p>
            </a>
          </li>
          <li class="nav-header">FOR CAR</li>
          <li class="nav-item">
            <a href="#" id="road-match" class="nav-link">
              <i class="nav-icon fas fa-road"></i>
              <p>
              Road Matching
              <span class="right badge badge-danger">New</span>
              </p>
            </a>
          </li>
        </ul>
      </nav>
      <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
  </aside>
  "##;

pub const LAYOUT_FOOTER: &'static str = r##"
                <div id="v-body">
                    <footer id="v-footer">
                        <div class="v-copyright"> GPS Spoofing as a Service | GPSSaaS</div>
                        <!-- <div class="v-generation-time">Generated in  seconds</div> -->
                        <!-- Design (c) 2020-2021 Maxime GAUTHIER - Léandre NGUYEN-MULLER - Adrien MIGNEROT - Hugo BRUNA - Thérèse FILI -->
                    </footer>
                </div>
            </div>
            
            
        <!-- </div> -->
        <!-- jQuery first, then Bootstrap JS -->
        <script src="./jquery-3.5.1.min.js"></script>
        <script src="./bootstrap-4.5.3/js/bootstrap.min.js"></script>
        
        <!-- Custom JavaScript -->
        <script>
        </script>
        
    </body>
</html>
"##;

pub fn layout_form(url: &str) -> String {
    format!(r##"
                <div id="v-body">
                    <div class="v-content">


                    <form id="needs-validation" action="{url}" name="login_form" method="post" novalidate>
                <div class="card-body">
                  <div class="form-group">
                    <label for="usernameField">Username</label>
                    <input type="text" name="username" class="form-control" id="usernameField" placeholder="Enter username" required>
                    <div class="invalid-feedback">
                                        Please specify a username
                                    </div>
                  </div>
                  <div class="form-group">
                    <label for="passwordField">Password</label>
                    <input type="password" name="password" class="form-control" id="passwordField" placeholder="Enter password" required>
                    <div class="invalid-feedback">
                                        A password is requierd.
                                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <button type="submit" class="btn btn-primary" id="submit-button-id">Login</button>
                </div>
              </form>




              <!-- <form id="needs-validation" action="{url}" name="login_form" method="post" novalidate>
                            <div class="form-group" id="userGroup">
                                <label for="usernameField">User Name</label>
                                <div class="col-md-9 mb-3">
                                    <input type="text" name="username" value="" class="form-control" id="usernameField" aria-describedby="idHelp" placeholder="Username" required>
                                    <div class="invalid-feedback">
                                        Please specify a username
                                    </div>
                                </div>
                            </div>
                            <div class="form-group" id="passGroup">
                                <label for="passwordField">Password</label>
                                <div class="col-md-9 mb-3">
                                    <input type="password" name="password" class="form-control" id="passwordField" placeholder="Password" required>
                                    <div class="invalid-feedback">
                                        A password is requierd.
                                    </div>
                                    <input type="password" id="passwordHidden" class="hidden-pass form-control">
                                </div>
                            </div>
                            <div class="v-submit">
                                <button type="submit" class="btn btn-primary" id="submit-button-id">Login</button>
                            </div>
                        </form> -->
                        </div>
"##, url=url)
}


pub fn layout_map() -> String {
    format!(r##"
    <!DOCTYPE html>
    <html>
        <head>
        <title>FakeMyAs Server</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!-- Nous chargeons les fichiers CDN de Leaflet. Le CSS AVANT le JS -->

            <!-- Custom CSS -->
            <link id="css-stylesheet" type="text/css" href="css/mapbis.css" rel="stylesheet" />
            <link rel="stylesheet" href="./leaflet/leaflet.css"/>

            <!-- JavaScript -->
            <script src="./jquery-3.5.1.min.js"></script>
            <script src="sha256.js"></script>
            <script src="login.js"></script>

        </head>
        <body>
            <div id="map">
            <!-- Ici s'affichera la carte -->
        </div>
        <!-- Fichiers Javascript -->
            <script src="./leaflet/leaflet.js"></script>
            <script src="/leaflet/map.js"></script>
        </body>
    </html>
    "##)
}

pub fn layout_spoof() -> String {
    format!(r##"
    <!DOCTYPE html>
    <html>
        <head>
        <title>FakeMyAs Server</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!-- Nous chargeons les fichiers CDN de Leaflet. Le CSS AVANT le JS -->

            <!-- Custom CSS -->
            <link id="css-stylesheet" type="text/css" href="css/mapbis.css" rel="stylesheet" />
            <link rel="stylesheet" href="./leaflet/leaflet.css"/>

            <!-- JavaScript -->
            <script src="./jquery-3.5.1.min.js"></script>
            <!-- <script src="sha256.js"></script> -->
            <script src="login.js"></script>

        </head>
        <body>
        <div id="map" style="position:fixed">
        <!--<div id="shutdown"><div id="shutdown-logo"></div></div>-->
        <div class="center-screen">
          <div id="speed"></div>
        </div>
        <!-- Ici s'affichera la carte --> 
      </div>
        
        <!-- Fichiers Javascript -->
            <script src="./leaflet/leaflet.js"></script>
            <script src="/leaflet/mapSpoof.js"></script>
            <!-- jQuery -->
<script src="plugins/jquery/jquery.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="plugins/jquery-ui/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
  $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- Bootstrap 4 -->
<script src="plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- ChartJS -->
<script src="plugins/chart.js/Chart.min.js"></script>
<!-- Sparkline -->
<script src="plugins/sparklines/sparkline.js"></script>
<!-- JQVMap -->
<script src="plugins/jqvmap/jquery.vmap.min.js"></script>
<script src="plugins/jqvmap/maps/jquery.vmap.usa.js"></script>
<!-- jQuery Knob Chart -->
<script src="plugins/jquery-knob/jquery.knob.min.js"></script>
<!-- daterangepicker -->
<script src="plugins/moment/moment.min.js"></script>
<script src="plugins/daterangepicker/daterangepicker.js"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js"></script>
<!-- Summernote -->
<script src="plugins/summernote/summernote-bs4.min.js"></script>
<!-- overlayScrollbars -->
<script src="plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.js"></script>
        </body>
    </html>
    "##)
}

pub fn layout_retry_form(url: &str, username: &str) -> String {
    format!(r##"
    <div id="v-body">
            <div class="v-content">
                        <form id="needs-validation" action="{url}" name="login_form" method="post" novalidate>
                            <div class="form-group" id="userGroup">
                                <label for="usernameField">Email Address</label>
                                <div class="col-md-9 mb-3">
                                    <input type="text" name="username" value="{username}" class="form-control" id="usernameField" aria-describedby="idHelp" placeholder="Username" required>
                                    <div class="invalid-feedback">
                                        Please specify a username
                                    </div>
                                </div>
                                <!-- <small id="idHelp" class="form-text text-muted">Your email address will not be shared with anyone else.</small> -->
                            </div>
                            <div class="form-group" id="passGroup">
                                <label for="passwordField">Password</label>
                                <div class="col-md-9 mb-3">
                                    <input type="password" name="password" class="form-control" id="passwordField" placeholder="Password" required>
                                    <div class="invalid-feedback">
                                        A password is requierd.
                                    </div>
                                    <input type="password" id="passwordHidden" class="hidden-pass form-control">
                                </div>
                            </div>
                            <div class="v-submit">
                                <button type="submit" class="btn btn-primary" id="submit-button-id">Login</button>
                            </div>
                        </form>
                    </div>
"##, url=url, username=sanitize(username))
}

#[allow(dead_code)]
pub fn alert_danger(msg: &str) -> String {
    format!(r##"
    <div id="v-body">
    <div class="v-content">
                        <div class="v-centered-msg alert alert-danger" role="alert">
                            {why}
                        </div>
"##, why=msg)
}
#[allow(dead_code)]
pub fn alert_success(msg: &str) -> String {
    format!(r##"
    <div id="v-body">
                    <div class="v-content">
                        <div class="v-centered-msg alert alert-success" role="alert">
                            {why}
                        </div>
"##, why=msg)
}
#[allow(dead_code)]
pub fn alert_info(msg: &str) -> String {
    format!(r##"
    <div id="v-body">
                    <div class="v-content">
                        <div class="v-centered-msg alert alert-info" role="alert">
                            {why}
                        </div>
"##, why=msg)
}
#[allow(dead_code)]
pub fn alert_warning(msg: &str) -> String {
    format!(r##"
    <div id="v-body">
                    <div class="v-content">
                        <div class="v-centered-msg alert alert-warning" role="alert">
                            {why}
                        </div>
"##, why=msg)
}
#[allow(dead_code)]
pub fn alert_primary(msg: &str) -> String {
    format!(r##"
    <div id="v-body">
                    <div class="v-content">
                        <div class="v-centered-msg alert alert-primary" role="alert">
                            {why}
                        </div>
"##, why=msg)
}
