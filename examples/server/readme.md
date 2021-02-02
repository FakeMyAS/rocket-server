% Rocket-Server application: Project FakeMyAs 
# Purpose
The purpose of this project is to show an example of how to we can use a HackRF One card and a Raspberry Pi to generate a webpage to authentificate a user and allow him to check his position (1st part) and to spoof another GPS position (2nd part).

# Authentication
Authentication in this project checks to see that the user entered "admin" as the username and that the password entered, once hashed and salted, have the same signature than what we set beforehand.

# Login Redirection
Upon successful authentication of the credentials in the login form data structure (`AdministratorForm` in this example) the user's browser will receive a cookies that will allows him to navigate toward otherwise restricted area (use of "rank=[value]" on the restricted page's route).  When authentication fails the page is refreshed and the user. 

# Using The Project
The example is setup with different routes:

* **/** - Redirect to the login page [http://192.168.4.1:8000/login](http://192.168.4.1:8000/login). Then either display to a login form (or a retry login form) or once logged in displays a choice between "position display" and "spoofing". Can be accessed at [http://192.168.4.1:8000](http://192.168.4.1:8000)
* **/logout** - if the user is logged in it removes the private cookie and returns to the login page.  It can be accessed at [http://192.168.4.1:8000/logout](http://192.168.4.1:8000/logout)
* **/map** - If the user has corresponding authorization access : Display the map with our marker for the position at [http://192.168.4.1:8000/map](http://192.168.4.1:8000/map) otherwise, redirect to the login page to give the user the possibility to authenticate himself.

* **/spoofing** - Similar to the **/map page : If the user has corresponding authorization access : Display the menu to choose which position should the device spoof [http://192.168.4.1:8000/spoofing](http://192.168.4.1:8000/spoofing) otherwise, redirect to the login page to give the user the possibility to authenticate himself.

`192.168.4.1` is the ip address of our Raspberry Pi which is configured as an hotspot. Consequently, to have access to this server, we have to be connected to its network called `FakeMyAs` with the good password.



**Copyright Note**: 
The Rocket-auth-login crate and Rust code examples are licensed under the Apache 2.0 license.
