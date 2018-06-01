var express 							= require("express"),
		app 									= express(),
		User									= require("./models/user"),
		mongoose							= require("mongoose"),
		passport							= require("passport"),
		bodyParser						= require("body-parser"),
		LocalStrategy 				= require("passport-local"),
		expressSession				= require("express-session"),
		passportLocalMongoose	= require("passport-local-mongoose")


mongoose.connect("mongodb://localhost/auth_demo_app");

app.set("view engine", "ejs");
app.use(expressSession({
	secret: "jeg elsker hotdogs",
	resave: false,
	saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));

//Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ROUTES

app.get("/", function(req, res){
	res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
	res.render("secret");
});

// =============
// AUTH ROUTES
// =============

// REGISTER ROUTES

// Show signup form
app.get("/register", function(req, res) {
   res.render("register"); 
});

// Handling user sign up
app.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
			passport.authenticate("local")(req, res, function(){
				res.redirect("/secret");
			});
	});
});

// LOGIN ROUTES

// Render login form
app.get("/login", function(req, res) {
   res.render("login"); 
});

// Login logic
app.post("/login", passport.authenticate("local", { //middleware - methods/functions that run before the callback function
	successRedirect: "/secret",
	failureRedirect: "/login"
}) , function(req, res){
});

// Logout
app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/");
});

// Middleware function to check if user is logged in
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("Server has started");
});