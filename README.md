% Rocket-auth-login - Authentication and Login library for Rust's Rocket Framework



### Requires Nightly Rust

Tested using nightly-2017-11-22-x86_64-pc-windows-msvc
To install using rustup in windows and set as default use:

```
rustup toolchain install nightly-2017-11-22-x86_64-pc-windows-msvc
rustup default nightly-2017-11-22-x86_64-pc-windows-msvc
```

Or on linux:

```
rustup toolchain install nightly-2017-11-22-x86_64-unknown-linux-gnu
rustup default nightly-2017-11-22-x86_64-unknown-linux-gnu
```



# Cargo.toml

In the cargo.toml add:

```
    rocket-auth-login = "0.5.*"
```

# Import and Use Statements
```

    extern crate rocket_auth_login as auth;
    use auth::authorization;
    
```

# Description
Rocket-auth-login is a library written in Rust for authentication and login processing.

### Library
This crate provides traits that you will implement on two different custom types that you define in your program.  These traits contain helpful methods to process login form data as well as store and retrieve cookies.  The two custom structures that you will define will do the following:

* ## Store the contents of your login form
    * This is used to authenticate users' credentials
* ## Store the contents of the cookie
    * When authentication is successful this structure will be serialized into a `String` that is stored in a [private cookie](https://api.rocket.rs/rocket/http/enum.Cookies.html#private-cookies)
    * The cookie data structure can be retrieved through a request guard for the specified user type

## Version Note
The Version 2.0 passes ownership of any cookies passed into the redirection methods which is not very convenient.  Version 2.1 uses a mutable reference to the cookies allowing them to be modified after calling the redirect methods (the redirect structure can be held in a variable and returned when needed).

# Data Structures
In your application define two custom data structures that will:

## Login Form Data Structure

```

    #[derive(Debug, Clone, Serialize, Deserialize)]    
    pub struct AdministratorForm {
        pub username: String,
        pub password: String,
    }
```

## Cookie Data Structure

```

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct AdministratorCookie {
        pub userid: u32,
        pub username: String,
        pub display: Option<String>,
    }
```

# Trait Implementations
The trait `CookieId` is implemented by both data structures. the `AuthorizeForm` trait is implemented by only the login data structure while the `AuthorizeCookie` trait is implemented by the cookie data structure.  For a more thorough example look at the `administrator.rs` file in any of the examples.

## CookieId
**Each** data structure will must implement the `CookieId` trait.  The `cookie_id()` implementation should be the same for both data structures since the two will have the same cookie identifier (the login form data structure will create the cookie with the specified cookie identifier while the cookie data structure will read the cookie associated with the specified identifier).  It is a simple trait with only a single method.  The implementation for  `cookide_id()` method looks like:

```

    // Both structures will use the same code for the `CookieId`
    impl CookieId for {StructNameHere} {
        fn cookie_id<'a>() -> &'a str {
            "acid"
        }
    }
```

## AuthorizeCookie
The `AuthorizeCookie` trait defines methods for the cookie data structure.  There are two functions you must implement on the cookie data structure, as well as a thrid function `delete_cookie()` which has a default implementation that deletes the private cookie with the name specified by `CookieId::cookie_id()`.  The functions you must implement on the cookie data structure are:

* `store_cookie(&self) -> String`
    * Serialized a cookie data structure into a string to be stored in the private cookie
* `retrieve_cookie(String) -> Self`
    * Deserializes a cookie data structure from a string that the cookie contained

## AuthorizeForm
The `AuthorizeForm` trait defines several methods which are implemented on the login form data structure, only two of which must be implemented in your code.  The rest are optional.  Also the associated type `CookieType` should be set to the cookie data structure type

```

    impl AuthorizeForm for AdministratorForm {
        type CookieType = AdministratorCookie;
```

Required: 

* ### `fn authenticate(&self) -> Result<Self::CookieType, AuthFail>`
    * Takes a login form data structure via the `&self` parameter
    * Returns either
        * `Ok( CookieType )` where `CookieType` is replaced by the cookie data structure
        * Err( AuthFail::new(attempted_username.to_string(), reason_auth_failed.to_string()) )
* ### `fn new_form(&str, &str, Option<HashMap<String, String>>) -> Self`
    * Creates a new instance of the login form data structure from the submitted form data.  This method is called from the `FromForm` implementation on the `LoginCont` structure (which the container used to store the login form data structure, see the Routes example below).  The parameters are:
        1. Username - comes from an input field named `username`
        2. Password - comes from an input field named `password`
        3. Extras - An Option<HashMap<String, String>> which contains every form field other than `username` and `password`.  This is used when the username and password fields have different names (then `authenticate()` can look at the fields in the extras hashmap instead of the regular username and password fields) or when other fields are needed in the login form.

Optional (can be overridden): 

* `fn flash_redirect(&self, ok_redir: &str, err_redir: &str, cookies: &mut Cookies) -> Result<Redirect, Flash<Redirect>>`
    * Call the `authenticate()` method and if successful creates the private cookie to log the user in.  Redirects the user to the `ok_redir` page on successful authentication.  If authentication fails it calls the fail_url() to build a query string which is appended to `err_redir` (this allows the username to persist and be filled in inside the login form) and also sets a [FlashMessage](https://api.rocket.rs/rocket/response/struct.Flash.html) (a cookie that is deleted once read) indicating why the form failed
* `fn redirect(&self, ok_redir: &str, err_redir: &str, cookies: &mut Cookies) -> Result<Redirect, Redirect>`
    * Same as `flash_redirect()` except it does not set a Flashmessage, it only redirects to either the ok_redir page or err_redir page (with the query string returned by `fail_url()` appended)
* `fn fail_url(user: &str) -> String`
    * Creates a query string that is appended to the url to indicate the username the user attempted to login with.  The default implementation creates the following string: "?user={username}" where {username} is the specified username
* `fn clean_username(string: &str) -> String`
    * Sanitizes the username.  By default it uses the `sanitize()` method from the `sanitization` module (sanitization.rs)
* `fn clean_password(string: &str) -> String`
    * Sanitizes the password.  By default it uses the `sanitize_password()` method from the `sanitization` module (sanitization.rs)
* `fn clean_extras(string: &str) -> String`
     Sanitizes the any extra fields.  By default it uses the `sanitize()` method from the `sanitization` module (sanitization.rs)



# Multiple User Types
It is possible and fairly simple to add multiple user types, like an administartor and a regular user type.
To accomplish this simply two data structures for each type (a login form data structure and a cookie data structure) and define different cookie identifiers for each user type (the admin type may have `cookie_id()` return something like `"aid"` while the user type may return something similar to `"uid"`).

# Routes
In your routes you will use the cookie data type as a request guard (ensuring that the user viewing the page is logged in as the specified user type).  A route that uses the `AdministratorCookie` type looks like:

```

    #[get("/login", rank = 1)]
    fn logged_in(_user: AuthCont<AdministratorCookie>) -> Html<String> {
        let admin: AdministratorCookie = _user.cookie;
        Html( format!("Welcome {}, you are logged in as an administrator.", admin.username) )
    }
    // OR to use the type directly
    fn logged_in(admin: AdministratorCookie

```


# Login Form Processing
The login processing route will be a `post` route that 

```

    #[allow(unused_mut)]
    #[post("/login", data = "<form>")]
    fn process_login(form: Form<LoginCont<AdministratorForm>>, mut cookies: Cookies) -> Result<Redirect, Flash<Redirect>> {
        let inner = form.into_inner();
        let login = inner.form;
        login.flash_redirect("/login", "/login", cookies)
    }

```

# Security
The library will send passwords in plaintext.  It is highly recommended that you use TLS.  There is even an example showing how to use tls with this crate.  The changes are minimal.  If you absolutely need to hash a password before the password is sent the examples all include a sha256.js file from [http://www.movable-type.co.uk/scripts/sha256.html]([http://www.movable-type.co.uk/scripts/sha256.html](http://www.movable-type.co.uk/scripts/sha256.html)) which can be used for that very purpose.  Also the login.js file contains commented out code around line 15 that can be used to hash the password before sending it using the sha256.js file.  This method is extremely discouraged.  Sha hashes are fast, and thus very susceptible to rainbow table attacks.  Without using TLS the security is almost the same as plaintext when using just a hashed password. Use TLS.  [Let's Encrypt](https://letsencrypt.org/)) offers free certificates so there's no reason not to use https for production purposes.

## License
Copyright &copy; 2021-2022 FakeMyAS

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg