---
title: Make a simple login server in Rust with Warp and async/await
author: Joshua Cooper
date: 2019-11-26
slug: warp_login_server_tutorial
path: /posts/warp
---

First, create a new project using `cargo`.

```sh
cargo new login_server
cd login_server
```

Then add the `warp` dependency to `Cargo.toml`.
As of the writing of this post, [the latest release of warp on crates.io](https://crates.io/crates/warp) does not support the `async`/`await` syntax so we will use the [GitHub master branch](https://github.com/seanmonstar/warp) instead.

```toml
[dependencies]
warp = { git = "https://github.com/seanmonstar/warp" }
```

When using `async` Rust, we also need to use an executor to poll `Future`s, so let's add a dependency on `tokio` to do that for us.
`tokio` is already used by `warp` internally but we still need to explicity include it for our project.

```toml
[dependencies]
warp = { git = "https://github.com/seanmonstar/warp" }
tokio = "0.2.0-alpha.6"
```

Then edit `src/main.rs` and replace the hello world program with a `warp` hello world.

```rust
use warp::Filter;

#[tokio::main]
async fn main() {
    let routes = warp::any().map(|| "Hello, World!");
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
```

You can then run this with `cargo run` and open `127.0.0.1:3030` in your browser to see `"Hello, World!"`.

Already in the hello world program, you have been introduced to `Filter`s, the main concept in `warp`.
Each incoming request passes through a chain of `Filter`s which can either do something with that request, or `reject` it.
This is fundamentally very simple but still powerful enough to enable things like sophisticated routing and middleware, which we will explore soon.
In the hello world example, `warp::any()` is a `Filter` that will accept any request.

Let's look at how to handle the routing for our project using `warp` `Filter`s.
Replace `routes` in the hello world example with three different paths.

```rust
let register = warp::path("register").map(|| "Hello from register");
let login = warp::path("login").map(|| "Hello from login");
let logout = warp::path("logout").map(|| "Hello from logout");
let routes = register.or(login).or(logout);
```

Notice that instead of using the `warp::any()` `Filter`, we are using `warp::path()` which will accept any request to the path matching the given string, and `reject` any other request.
To combine all of the routes, we used `or`.
`or` will try another chain of `Filter`s after a rejection, so in our case, any request that is rejected by the `"register"` `Filter` will be sent down the next `Filter` chain, which is the `"login"` route.
This will carry on until one of the `Filter` chains yields a response, otherwise an error response is sent.
As well as `or`, there is also `and` which is used for chaining filters together when a request isn't rejected.
We can test this by putting all of our routes after an `"/api"` path.

```rust
let routes = register.or(login).or(logout);
let routes = warp::path("api").and(routes);
```

Here, if a request is accepted by the `"api"` `Filter`, i.e. any request to `"/api/*"`, `and` one of the paths defined before, it will yield a response.

One final concept to grasp before moving on is that `Filter`s can be used to share state throughout your project.
We will look at a simple example of a shared counter.

```rust
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::Filter;

#[tokio::main]
async fn main() {
    let db = Arc::new(Mutex::new(0));
    let db = warp::any().map(move || Arc::clone(&db));
    let routes = warp::path("counter").and(db.clone()).and_then(counter);
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}

async fn counter(db: Arc<Mutex<u8>>) -> Result<impl warp::Reply, warp::Rejection> {
    let mut counter = db.lock().await;
    *counter += 1;
    Ok(counter.to_string())
}
```

The things to notice here are that we define an initial state of `0` in `main` that is wrapped by a `tokio` `Mutex` and an `Arc` so that it can be shared and mutated asynchronously.
After that, we turn the counter into a `Filter` so that we can combine it with others.
In this example, our `routes` `Filter` chain accepts any request with the path `"counter"` then makes then adds `db` to the request, then finally passes it to the `counter` function.
Note that the final `and` is replaced with `and_then` for use with `async` an function.

## Implementing the login server

That's enough of the basics, now we can move on to implementing the login server.
First, we need to replace the counter with a databse of users.
For that we'll just use an in memory database, but it could easily be replaced later.

```rust
let db = Arc::new(Mutex::new(HashMap::<String, User>new()));
let db = warp::any().map(move || Arc::clone(&db));
```

Remember to include `HashMap` from the standard library.

```rust
use std::collections::HashMap;
```

Before we define the `User` struct, we should add a dependency called `serde` so that we can deserialize JSON data from requests.

```toml
[dependencies]
warp = { git = "https://github.com/seanmonstar/warp" }
tokio = "0.2.0-alpha.6"
serde = { version = "1.0", features = ["derive"] }
```

Then use `serde::Deserialize` in `main.rs` and define the `User` struct.

```rust
use serde::Deserialize;

#[derive(Deserialize)]
struct User {
    username: String,
    password: String,
}
```

Next we can make the functions that will be called at the end of each `Filter` chain.
In these, we will use HTTP status codes exported by `warp` for our replies, so we need to include them in `main.rs`.

```rust
use warp::http::StatusCode;
```

Now let's make the function for registering a user.

```rust
async fn register(
    new_user: User,
    db: Arc<Mutex<HashMap<String, User>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut users = db.lock().await;
    if users.contains_key(&new_user.username) {
        return Ok(StatusCode::BAD_REQUEST);
    }
    users.insert(new_user.username.clone(), new_user);
    Ok(StatusCode::CREATED)
}
```

This function takes a new user and the databse of users then adds the new user to the database if a user with that username doesn't already exist.
Note that this will store the password in plain text which you should never do, we will fix that later.

Now the function that handles logging in.

```rust
async fn login(
    credentials: User,
    db: Arc<Mutex<HashMap<String, User>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let users = db.lock().await;
    match users.get(&credentials.username) {
        None => Ok(StatusCode::BAD_REQUEST),
        Some(user) => {
            if credentials.password == user.password {
                Ok(StatusCode::OK)
            } else {
                Ok(StatusCode::UNAUTHORIZED)
            }
        }
    }
}
```

This function takes the given credentials and checks to see if there is a user with those credentials.
Our example just returns a 200 OK response on success, but you could return something like a cookie or JWT and handle sessions here too.

Finally, let's define the routes.

```rust
let register = warp::post()
    .and(warp::path("register"))
    .and(warp::body::json())
    .and(db.clone())
    .and_then(register);
let login = warp::post()
    .and(warp::path("login"))
    .and(warp::body::json())
    .and(db.clone())
    .and_then(login);

let routes = register.or(login);
warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
```

You can probably guess by now what the `warp::body::json()` `Filter` does.
Like our database `Filter`, it adds the request body to our request to by used by the rest of the `Filter` chain.
We also use the `warp::post()` `Filter` here to reject anything that isn't a HTTP POST request.

Now you can run the server and test it using something like `curl` or [HTTPie](https://httpie.org/).

# Storing password hashes

Remember how we are just storing the passwords in plain text in our database?
That is bad practice and instead we should be storing hashes of the passwords, so let's implement that now.
We will need to add some dependencies for password hashing.

```toml
[dependencies]
warp = { git = "https://github.com/seanmonstar/warp" }
tokio = "0.2.0-alpha.6"
serde = { version = "1.0", features = ["derive"] }
rand = "0.7.2"
rust-argon2 = "0.6.0"
```

For convenience, we will make some wrapper functions for hashing and verifying passwords.

```rust
use argon2::{self, Config};
use rand::Rng;

pub fn hash(password: &[u8]) -> String {
    let salt = rand::thread_rng().gen::<[u8; 32]>();
    let config = Config::default();
    argon2::hash_encoded(password, &salt, &config).unwrap()
}

pub fn verify(hash: &str, password: &[u8]) -> bool {
    argon2::verify_encoded(hash, password).unwrap_or(false)
}
```

The most important thing to notice here is that we are generating a random salt in the `hash` function.
It is best practice to generate random salts for each password as it protects against various attacks that an attacker might use.

Now we need to replace the `insert` in our `register` function.

```rust
let hashed_user = User {
    username: new_user.username,
    password: hash(new_user.password.as_bytes()),
};
users.insert(hashed_user.username.clone(), hashed_user);
```

And the `if` in our `login` function.

```rust
if verify(&user.password, credentials.password.as_bytes()) {
    Ok(StatusCode::OK)
} else {
    Ok(StatusCode::UNAUTHORIZED)
}
```

Much better.
That's all for now.
This is a very simple login server but I hope this post gave you the building blocks needed to expand it for your own needs.
I strongly recommend taking a look at the [`warp` documentation](https://docs.rs/warp) and if you need help, don't hesitate to ask me.
