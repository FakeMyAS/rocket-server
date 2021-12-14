//File used by main.rs to verify the user's info and allow him to navigate when logged in

use rocket::{Request, Outcome};
use rocket::response::{Redirect, Flash};
use rocket::request::{FromRequest, FromForm, FormItems, FormItem, FromFormValue};
use rocket::http::{Cookie, Cookies, RawStr};

use std::collections::HashMap;
use std::marker::Sized;
use sanitization::*;

#[derive(Debug, Clone)]
pub struct UserQuery {
    pub user: String,
}

#[derive(Debug, Clone)]
pub struct AuthCont<T: AuthorizeCookie> {
    pub cookie: T,
}

#[derive(Debug, Clone, FromForm)]
pub struct AuthFail {
    pub user: String,
    pub msg: String,
}

impl AuthFail {
    pub fn new(user: String, msg: String) -> AuthFail {
        AuthFail {
            user,
            msg,
        }
    }
}


#[derive(Debug, Clone)]
pub struct LoginCont<T: AuthorizeForm> {
    pub form: T,
}

impl<T: AuthorizeForm + Clone> LoginCont<T> {
    pub fn form(&self) -> T {
        self.form.clone()
    }
}


/// The CookieId trait contains a single method, `cookie_id()`.
/// The `cookie_id()` function returns the name or id of the cookie.
/// Note: if you have another cookie of the same name that is secured
/// that already exists (say created by running the tls_example then database_example)
/// if your cookies have the same name it will not work.  This is because
/// if the existing cookie is set to secured you attempt to login without
/// using tls the cookie will not work correctly and login will fail.
pub trait CookieId {
    /// Ensure `cookie_id()` does not conflict with other cookies that
    /// may be set using secured when not using tls.  Secured cookies
    /// will only work usnig tls and cookies of the same name could
    /// create problems.
    fn cookie_id<'a>() -> &'a str {
        "sid"
    }
}

//Implementation of the cookie trait
pub trait AuthorizeCookie : CookieId {
    /// Serialize the cookie data type - must be implemented by cookie data type
    fn store_cookie(&self) -> String;
    
    /// Deserialize the cookie data type - must be implemented by cookie data type
    fn retrieve_cookie(String) -> Option<Self> where Self: Sized;
    
    /// Deletes a cookie.  This does not need to be implemented, it defaults to removing
    /// the private key with the named specified by cookie_id() method.
    
    fn delete_cookie(cookies: &mut Cookies) {
        cookies.remove_private( 
           Cookie::named( Self::cookie_id() )
        );
    }
}

pub trait AuthorizeForm : CookieId {
    type CookieType: AuthorizeCookie;
    
    /// Determine whether the login form structure containts
    /// valid credentials, otherwise send back the username and
    /// a message indicating why it failed in the `AuthFail` struct
    /// 
    /// Must be implemented on the login form structure
    fn authenticate(&self) -> Result<Self::CookieType, AuthFail>;
    
    /// Create a new login form Structure with 
    /// the specified username and password.
    /// The first parameter is the username, then password,
    /// and then optionally a HashMap containing any extra fields.
    /// 
    /// Must be implemented on the login form structure
    ///
    // /// The password is a u8 slice, allowing passwords to be stored without
    // /// being converted to hex.  The slice is sufficient because new_form()
    // /// is called within the from_form() function, so when the password is
    // /// collected as a vector of bytes the reference to those bytes are sent
    // /// to the new_form() method.
    fn new_form(&str, &str, Option<HashMap<String, String>>) -> Self;
    
    /// The `fail_url()` method is used to create a url that the user is sent
    /// to when the authentication fails.  The default implementation
    /// redirects the user to the /page?user=<ateempted_username>
    /// which enables the form to display the username that was attempted
    /// and unlike FlashMessages it will persist across refreshes
    fn fail_url(user: &str) -> String {
        let mut output = String::with_capacity(user.len() + 10);
        output.push_str("?user=");
        output.push_str(user);
        output
    }
        
    /// Sanitizes the username before storing in the login form structure.
    /// The default implementation uses the `sanitize()` function in the
    /// `sanitization` module.  This can be overriden in your 
    /// `impl AuthorizeForm for {login structure}` implementation to
    /// customize how the text is cleaned/sanitized.
    fn clean_username(string: &str) -> String {
        sanitize(string)
    }
    /// Sanitizes the password before storing in the login form structure.
    /// The default implementation uses the `sanitize_oassword()` function in the
    /// `sanitization` module.  This can be overriden in your 
    /// `impl AuthorizeForm for {login structure}` implementation to
    /// customize how the text is cleaned/sanitized.
    fn clean_password(string: &str) -> String {
        sanitize_password(string)
    }
    /// Sanitizes any extra variables before storing in the login form structure.
    /// The default implementation uses the `sanitize()` function in the
    /// `sanitization` module.  This can be overriden in your 
    /// `impl AuthorizeForm for {login structure}` implementation to
    /// customize how the text is cleaned/sanitized.
    fn clean_extras(string: &str) -> String {
        sanitize(string)
    }
    
    /// Redirect the user to one page on successful authentication or
    /// another page (with a `FlashMessage` indicating why) if authentication fails.
    /// 
    /// `FlashMessage` is used to indicate why the authentication failed
    /// this is so that the user can see why it failed but when they refresh
    /// it will disappear, enabling a clean start, but with the user name
    /// from the url's query string (determined by `fail_url()`)
    fn flash_redirect(&self, ok_redir: impl Into<String>, err_redir: impl Into<String>, cookies: &mut Cookies) -> Result<Redirect, Flash<Redirect>> {
        match self.authenticate() {
            Ok(cooky) => {
                let cid = Self::cookie_id();
                let contents = cooky.store_cookie();
                cookies.add_private(Cookie::new(cid, contents));
                Ok(Redirect::to(ok_redir.into()))
            },
            Err(fail) => {
                let mut furl = err_redir.into();
                if &fail.user != "" {
                    let furl_qrystr = Self::fail_url(&fail.user);
                    furl.push_str(&furl_qrystr);
                }
                Err( Flash::error(Redirect::to(furl), &fail.msg) )
            },
        }
    }
    
    /*/// Redirect the user to one page on successful authentication or
    /// another page if authentication fails.
    fn redirect(&self, ok_redir: &str, err_redir: &str, cookies: &mut Cookies) -> Result<Redirect, Redirect> {
        match self.authenticate() {
            Ok(cooky) => {
                let cid = Self::cookie_id();
                let contents = cooky.store_cookie();
                cookies.add_private(Cookie::new(cid, contents));
                Ok(Redirect::to(ok_redir.to_string()))
            },
            Err(fail) => {
                let mut furl = String::from(err_redir);
                if &fail.user != "" {
                    let furl_qrystr = Self::fail_url(&fail.user);
                    furl.push_str(&furl_qrystr);
                }
                Err( Redirect::to(furl) )
            },
        }
    }*/
}

impl<T: AuthorizeCookie + Clone> AuthCont<T> {
    pub fn cookie_data(&self) -> T {
        // Todo: change the signature from &self to self
        //       and remove the .clone() method call
        self.cookie.clone()
    }
}


impl<'a, 'r, T: AuthorizeCookie> FromRequest<'a, 'r> for AuthCont<T> {
    type Error = ();
    
    fn from_request(request: &'a Request<'r>) -> ::rocket::request::Outcome<AuthCont<T>,Self::Error>{
        let cid = T::cookie_id();
        let mut cookies = request.cookies();
        
        match cookies.get_private(cid) {
            Some(cookie) => {
                if let Some(cookie_deserialized) = T::retrieve_cookie(cookie.value().to_string()) {
                    Outcome::Success(
                        AuthCont {
                            cookie: cookie_deserialized,
                        }
                    )
                } else {
                    Outcome::Forward(())
                }
            },
            None => Outcome::Forward(())
        }
    }
}


/// #Collecting Login Form Data
/// If your login form requires more than just a username and password the
/// extras parameter, in `AuthorizeForm::new_form(user, pass, extras)`, holds
/// all other fields in a `HashMap<String, String>` to allow processing any 
/// field that was submitted.  The username and password are separate because
/// those are universal fields.
///
/// ## Custom Username/Password Field Names
/// By default the function will look for a username and a password field.
/// If your form does not use those particular names you can always use the
/// extras `HashMap` to retrieve the username and password when using different
/// input box names.  The function will return `Ok()` even if no username or
/// password was entered, this is to allow custom field names to be accessed
/// and authenticated by the `authenticate()` method.
impl<'f, A: AuthorizeForm> FromForm<'f> for LoginCont<A> {
    type Error = &'static str;
    
    fn from_form(form_items: &mut FormItems<'f>, _strict: bool) -> Result<Self, Self::Error> {
        let mut user: String = String::new();
        let mut pass: String = String::new();
        let mut extras: HashMap<String, String> = HashMap::new();
        
        for FormItem { key, value, .. } in form_items {
            match key.as_str(){
                "username" => {
                    user = A::clean_username(&value.url_decode().unwrap_or(String::new()));
                },
                "password" => {
                    pass = A::clean_password(&value.url_decode().unwrap_or(String::new()));
                },
                // _ => {},
                a => {
                    // extras.insert( a.to_string(), A::clean_extras( &value.url_decode().unwrap_or(String::new()) ) );
                    extras.insert( a.to_string(), value.url_decode().unwrap_or(String::new()) );
                },
            }
        }
        
        // Do not need to check for username / password here,
        // if the authentication method requires them it will
        // fail at that point.
        Ok(
            LoginCont {
                form: if extras.len() == 0 {
                          A::new_form(&user, &pass, None)
                       } else {
                           A::new_form(&user, &pass, Some(extras))
                       },
            }
        )
    }
}

impl<'f> FromForm<'f> for UserQuery {
    type Error = &'static str;
    
    fn from_form(form_items: &mut FormItems<'f>, _strict: bool) -> Result<UserQuery, Self::Error> {
        let mut name: String = String::new();
        for FormItem { key, value, .. } in form_items {
            match key.as_str() {
                "user" => { name = sanitize( &value.url_decode().unwrap_or(String::new()) ); },
                _ => {},
            }
        }
        Ok(UserQuery { user: name })
    }
}

impl<'f> FromFormValue<'f> for UserQuery {
    type Error = &'static str;
    
    fn from_form_value(form_value: &'f RawStr) -> Result<Self, Self::Error> {
        Ok(UserQuery { user: sanitize(&form_value.url_decode().unwrap_or(String::new())) })
    }
}