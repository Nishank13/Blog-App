var express 	  = require("express"),
methodOverride    =require("method-override"),
expressSanitizer  = require("express-sanitizer"),
bodyParser  	  = require("body-parser"),
mongoose    	  = require("mongoose"),
app         	  = express();

//APP CONFIG
mongoose.connect("mongodb://localhost/BlogApp",{   useNewUrlParser: true, //if mongoose is not able to find yelpcamp db then it will create one
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true });

app.set("view engine", "ejs");//so that we can mention files with extension ejs in this file with name only

app.use(bodyParser.urlencoded({extended: true})); //used for extracting the data which sent in form of url while submitting form 
app.use(express.static("public"));
app.use(expressSanitizer());//should be written after the bodyParser
app.use(methodOverride("_method"));//this should come after bodyParser

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}//used to get date of submission
});

var Blog = mongoose.model("Blog", blogSchema);

//Blog.create({
//	title: "Test Blog",
//	image: "https://i.imgur.com/4zSAWJ5.jpg",
//	body: "A confused Dog!!!!"
//});
//RESTful ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});

//INDEX route
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blog){
		if(err) {
			console.log("ERROR!!!");
		} else {
			res.render("index", {blog : blog});
		}
	});
});

//NEW route
app.get("/blogs/new", function(req, res){
	res.render("new");
});

//CREATE route
app.post("/blogs", function(req, res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);//this is used to remove any scripts if the user has written inside any html element
	Blog.create(req.body.blog, function(err, newblog){
		if(err){
			res.render("new");
		} else{
			//the redirect to the index
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog}); //will show that blog whose id is matched...
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body); //this is used to remove any scripts if the user has written inside any html element
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			//redirect somewhere
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen(3000, function(){
	console.log("SERVER IS RUNNING!!!");
});

