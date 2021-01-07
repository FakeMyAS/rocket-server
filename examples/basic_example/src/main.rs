#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

#[macro_use] extern crate serde;
extern crate rmp_serde as rmps;
extern crate regex;
extern crate time;
extern crate titlecase;
extern crate htmlescape;
#[allow(unused_imports)] #[macro_use] extern crate serde_json;

extern crate rocket_auth_login as auth;
//For hash
extern crate crypto;

use auth::authorization::*;
use rocket::response::{NamedFile, Redirect, Flash};
use rocket::response::content::Html;
use rocket::request::{FlashMessage, Form};
use rocket::http::{Cookie, Cookies};
use std::path::{Path, PathBuf};

mod administrator;
mod layout;
use administrator::*;
use layout::*;

#[allow(dead_code)]
const URL: &'static str = "http://localhost:8000";
const LOGIN_URL: &'static str = "http://localhost:8000/login";

//Display the message when logged in, or display the form to log in
#[get("/login", rank = 1)]
fn logged_in(_user: AuthCont<AdministratorCookie>) -> Html<String> {
    layout("You are logged in.")
}
#[get("/login", rank = 2)]
fn login() -> Html<String> {
    layout(&layout_form(LOGIN_URL))
}

//Retrieve the user's information to post them and then redirect
#[allow(unused_mut)]
#[post("/login", data = "<form>")]
fn process_login(form: Form<LoginCont<AdministratorForm>>, mut cookies: Cookies) -> Result<Redirect, Flash<Redirect>> {
    let inner = form.into_inner();
    let login = inner.form;
    login.flash_redirect("/", "/", &mut cookies) // "/", "/" pour rediriger sur home
}

#[get("/logout")]
fn logout(admin: Option<AdministratorCookie>, mut cookies: Cookies) -> Result<Flash<Redirect>, Redirect> {
    if let Some(_) = admin {
        cookies.remove_private(Cookie::named(AdministratorCookie::cookie_id()));
        Ok(Flash::success(Redirect::to("/"), "Successfully logged out."))
    } else {
        Err(Redirect::to("/"))
    }
}

#[get("/map", rank = 1)]
fn map(_user: AuthCont<AdministratorCookie>) -> Html<String>  {
    layout("OK map")
}
//If not connected
#[get("/map", rank = 2)]
fn login_map() -> Html<String> {
    layout(&layout_form(LOGIN_URL))
}


#[get("/")]
fn index(admin_opt: Option<AdministratorCookie>, flash_msg_opt: Option<FlashMessage>) -> Html<String> {
    let mut contents = String::with_capacity(300);
    if let Some(flash) = flash_msg_opt {
        match flash.name() {
            "success" => contents.push_str(&alert_success(flash.msg())),
            "warning" => contents.push_str(&alert_warning(flash.msg())),
            "error" => contents.push_str(&alert_danger(flash.msg())),
            _ => contents.push_str(&alert_info(flash.msg())),
        }
    }
    if let Some(admin) = admin_opt {
        contents.push_str(r#"<a href="/map">Get my position</a><br></br>"#); //redirect to the home page with a spoofing and get my position bouton
        contents.push_str(r#"<a href="/spoofing">Spoofing</a>"#);
        layout(&contents)
    } else {
        layout(&layout_form(LOGIN_URL)) //put directly the form
    }
}


/// allows static files to be served easily
#[get("/<file..>", rank=10)]
fn static_files(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/").join(file)).ok()
}

fn main() {
        rocket::ignite()
        // using rocket_contrib's Templates
        // .attach(Template::fairing())
        .mount("/", routes![
            process_login,
            login,
            logout,
            index,
            map,
            login_map,
            static_files
        ])
        .launch();
}
