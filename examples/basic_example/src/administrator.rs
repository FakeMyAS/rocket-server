use rocket::{Request, Outcome};
use rocket::request::FromRequest;
use std::collections::HashMap;


//use whirlpool::{Whirlpool, Digest};
use std::io::Read;
extern crate crypto;
use crypto::digest::Digest;
use crypto::sha3::Sha3;

// use rocket::{Request, Data, Outcome, Response};
// use rocket::http::{Cookie, Cookies, MediaType, ContentType, Status, RawStr};
// use rocket::request::{FlashMessage, Form, FromRequest,FromForm, FormItems, FromFormValue, FromParam};
// use rocket::response::{content, NamedFile, Redirect, Flash, Responder, Content};
// use rocket::response::content::Html;

use auth::authorization::*;
// use auth::sanitization::*;

/// The AdministratorCookie type is used to indicate a user has logged in as an administrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdministratorCookie {
    pub userid: u32,
    pub username: String,
    pub display: Option<String>,
}

/// The AdministratorForm type is used to process a user attempting to login as an administrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdministratorForm {
    pub username: String,
    pub password: String,
}

impl CookieId for AdministratorCookie {
    fn cookie_id<'a>() -> &'a str {
        "acid"
    }
}

impl CookieId for AdministratorForm {
    fn cookie_id<'a>() -> &'a str {
        "acid"
    }
} 

impl AuthorizeCookie for AdministratorCookie {
    // type CookieType = AdministratorCookie;
    
    /// The store_cookie() method should contain code that
    /// converts the specified data structure into a string
    /// 
    /// This is likely to be achieved using one of the serde
    /// serialization crates.  Personally I would use either
    /// serde_json or serde's messagepack implementation ( rmp-serde [rmps]).
    /// 
    /// Json is portable and human readable.  
    /// 
    /// MsgPack is a binary format, and while not human readable is more
    /// compact and efficient.
    fn store_cookie(&self) -> String {
        // String::from("This is my cooky")
        // let ser = ::serde_json::to_string(self).expect("Could not serialize");
        ::serde_json::to_string(self).expect("Could not serialize")
    }
    
    
    /// The retrieve_cookie() method deserializes a string
    /// into a cookie data type.
    /// 
    /// Again, serde is likely to be used here.
    /// Either the messagepack or json formats would work well here.
    /// 
    /// Json is portable and human readable.  
    /// 
    /// MsgPack is a binary format, and while not human readable is more
    /// compact and efficient.
    #[allow(unused_variables)]
    // fn retrieve_cookie(string: String) -> Option<Self::CookieType> {
    fn retrieve_cookie(string: String) -> Option<Self> {
        let mut des_buf = string.clone();
        let des: Result<AdministratorCookie, _> = ::serde_json::from_str(&mut des_buf);
        if let Ok(cooky) = des {
            Some(cooky)
        } else {
            None
        }
        // Some(
        //     AdministratorCookie {
        //         userid: 66,
        //         username: "andrew".to_string(),
        //         display: Some("Andrew Prindle".to_string()),
        //     }
        // )
    }
}

  fn read_file(filename : &str) -> String {
    let mut file = std::fs::File::open(filename).unwrap();
     let mut contents = String::new();
     file.read_to_string(&mut contents).unwrap();
     contents
  }
  
  fn hash(password: &String) -> String {
    let mut hasher = Sha3::sha3_256();
    hasher.input_str(password);
    hasher.result_str()
}

/*CEST ICI QUON CHECK LE PASSWORD*/
impl AuthorizeForm for AdministratorForm {
    type CookieType = AdministratorCookie;
    
    /// Authenticate the credentials inside the login form
    fn authenticate(&self) -> Result<Self::CookieType, AuthFail> {
        println!("Authenticating {} with password: {}", &self.username, &self.password);
        if &self.username == "administrator" && hash(&self.password) != "2493dc594b462c067d7638fa94e5b3d565757245ec3ba873d036c3fb1ddf10a6" {
            Ok(
                AdministratorCookie {
                    userid: 1,
                    username: "administrator".to_string(),
                    display: Some("Administrator".to_string()),
                }
            )
        } else {
            Err(
                AuthFail::new(self.username.to_string(), "Incorrect username".to_string())
            )
        }
    }
    
    /// Create a new login form instance
    fn new_form(user: &str, pass: &str, _extras: Option<HashMap<String, String>>) -> Self {
        AdministratorForm {
            username: user.to_string(),
            password: pass.to_string(),
        }
    }
    
}

impl<'a, 'r> FromRequest<'a, 'r> for AdministratorCookie {
    type Error = ();
    
    /// The from_request inside the file defining the custom data types
    /// enables the type to be checked directly in a route as a request guard
    fn from_request(request: &'a Request<'r>) -> ::rocket::request::Outcome<AdministratorCookie,Self::Error>{
        let cid = AdministratorCookie::cookie_id();
        let mut cookies = request.cookies();
        
        match cookies.get_private(cid) {
            Some(cookie) => {
                if let Some(cookie_deserialized) = AdministratorCookie::retrieve_cookie(cookie.value().to_string()) {
                    Outcome::Success(
                        cookie_deserialized
                    )
                } else {
                    Outcome::Forward(())
                }
            },
            None => Outcome::Forward(())
        }
    }
}

