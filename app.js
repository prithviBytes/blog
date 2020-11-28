var mongoose = require("mongoose");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var expressSanitizer = require("express-sanitizer");
var express = require("express");
var app = express();
require('dotenv').config();

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"))


mongoose.connect(process.env.DATABASEURL,
{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body  : String,
	created : {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);


app.get("/",function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index",{blogs:blogs});
		}
	})
});

app.get("/blogs/new",function(req,res){
		res.render("new");
	});

app.post("/blogs",function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.create(req.body.blog,function(err,blog){
		if(err){
			console.log(err);
		}else{
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,blog){
		if(err){
			console.log(err);
		}else{
			res.render("show",{blog:blog});
		}
	});
});

app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/");
		}else{
			res.render("edit",{blog:foundBlog})
		}
	})
});

app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function( err, blog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect("/blogs");
		}
	})
})

app.listen(process.env.PORT,function(){
	console.log("Blog Started");
})