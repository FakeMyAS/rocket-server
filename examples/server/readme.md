% Rocket-auth-login Basic Example

# Purpose
The purpose of this example is to show a more simplistic example of how to use the rocket-auth-login module and to demonstrate how to handle authentication when a database is not needed (like when using a hard coded list of usernames and passwords or checking against usernames/passwords loaded from a file).

# Authentication
Authentication in this example simply checks to see that the user entered "administrator" as the username and that a password is present, it does not check what the password is.  There is no database connected to this example.

# Login Redirection
Upon successful authentication of the credentials in the login form data structure (`AdministratorForm` in this example) the `flash_redirect` function is called to redirect the user to the page specified when authentication is successful.  When authentication fails the function will add a [FlashMessage](https://api.rocket.rs/rocket/response/struct.Flash.html) cookie (a cookie that is deleted once it is read, enabling messages to be passed but when refreshed the messages are not shown.  This works well for things like telling the user they have been logged out or telling why authentication failed) redirect the user to the page specified when authentication fails

# Using The Example
The example is setup with three main routes:

* **/** - The index page, can be accessed at [http://localhost:8000/](http://localhost:8000/)
* **/login** - either displays a login form (or a retry login form) or once logged in displays user information.  Can be accessed at [http://localhost:8000/login](http://localhost:8000/login)
* **/logout** - if the user is logged in it removes the private cookie and returns to the login page.  It can be accessed at [http://localhost:8000/logout](http://localhost:8000/logout)


**Copyright Note**: The Rocket-auth-login crate and Rust code examples are licensed under the Apache 2.0 license.  However the layout/design in the examples was created by me.  You can use it however if you put in at least an HTML comment inside the HTML output saying Design &copy; 2017 Andrew Prindle.
The rest of the application you may use without any kind of credit displayed to users but must follow the terms of the Apache 2.0 license.
