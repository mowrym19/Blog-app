var express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer");

//console.log(process.env.DBURL);

var url = process.env.DBURL || "mongodb://localhost/blog_app";
mongoose.connect(url, {useNewUrlParser: true});

//mongodb+srv://mowrym19:<password>@cluster0-b1no8.mongodb.net/blogapp?retryWrites=true
mongoose.connect(process.env.DBURL, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res){
	res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
}		else {
			res.render("index", {blogs: blogs});
}
});
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

//Create Route
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
}		else {
			res.redirect("/blogs");
}
});	
});

app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
}		else {
			res.render("show", {blog: foundBlog});
}
});
});

app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
} 		else {
			res.render("edit", {blog: foundBlog});
}
});
});

//Update route
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
}		else {
			res.redirect("/blogs/" + req.params.id);
}
});
});

app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
}		else {
			res.redirect("/blogs");
}
});
});

//added var to ensure Heroku can find port
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log('BlogApp activated');
});
	