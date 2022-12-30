require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set('strictQuery', true); // to avoid the depriciated warning
const app = express();  // to create a web app
app.set('view engine', 'ejs'); // mandatory line for using ejs

app.use(bodyParser.urlencoded({extended:true})); //mandatory line for using body parser
const mongoUri = "mongodb+srv://My-to-do-List:"+process.env.PASSWORD+"@my-to-do-list.zpbu9zb.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoUri,
	{useNewUrlParser:true}); // to connect mongoose to the database called to-do-list-DB

//var newTask = "";  // if we do this then the new item will overwrite the previous item, to overcoe from it, we need to cerete an array
// var Tasks = [];   // will store all the tasks entered. this and the above line is used when we were not using mongoose

app.use(express.static("public")); // it tells the express app to serve the static files stored in the public folder/directory

// create a schema for the tasks
const taskSchema = new mongoose.Schema({
	name:{
		type: String,
		required:true,
		unique:true
	}
});

// create a mongoose model
const task = mongoose.model("task",taskSchema);

//create the starting documents/ objects
const task1 = new task({
	name:"Finish mongoose tutorial"
});
const task2 = new task({
	name:"Submit the assignment"
});
//put the default tasks into an array
const defaultTasks = [task1,task2]; 

app.get("/",function(req,res){

	var today = new Date();
	var currentDay = today.getDay();
	var thisYear = today.getFullYear();
	var day ="";
 	
 	var options = {
 		weekday: "long",
 		day:"numeric",
 		month:"long"
 	};
 	var day = today.toLocaleDateString("en-US",options);

 	
 	// reading the values from our database
	task.find((err,foundTasks)=>{
		if(err){
			console.log(err);
		}else{

			//insert these tasks into the database to-do-list-DB only for the first time
			if(foundTasks.length === 0 ){
				task.insertMany(defaultTasks,(err)=>{
				if(err){
					console.log(err);
				}else{
					console.log("default tasks successfully submitted");
					}
				});
				res.redirect("/"); // if the length is = 0, then the if statement will get executed and at the end we redirect it to the home route so that now the length is not = 0 and now the else statement will execute.
			}else{
				res.render("list",{kindOfDay: day, nTask: foundTasks,complete: complete, thisYear: thisYear});
			}
		};
	});
	
}); 

app.post("/addTask",function(req,res){
	
  	const returnTask = req.body.newTask; // store the entered value by the user
  	if(returnTask == ""){
  		res.redirect("/");
  	}else{
	//create the new document for the returned value
	const newTask = new task({
		name: returnTask
	});
	//push the document into the database
	newTask.save();
     res.redirect('/');
	}
});


var complete = [];  //to store all the completed task

app.post("/removetask", function(req, res) {
     var completeTask = req.body.check;
     // console.log(completeTask);  // for debugging

if (typeof completeTask === "string") {
     complete.push(completeTask);
  // Tasks.splice(Tasks.indexOf(completeTask), 1); // this is used when we have not used mongodb

  // to delete the completed task if only one checkbox is checked
     task.deleteOne({name: completeTask},(err)=>{
     	if(err){
     		console.log("Sorry! There is an error in deleting one task");
     	}else{
     		console.log("Successfully deleted the task");
     	}
     });
  } 
  //if more than one task is checked as completed then delete each task one by one by using a for loop
  else if (typeof completeTask === "object") {
    for (var i = 0; i < completeTask.length; i++) {     
    	complete.push(completeTask[i]);
    // Tasks.splice(Tasks.indexOf(completeTask[i]), 1);
    	task.deleteOne({name: completeTask[i]},(err)=>{
     	if(err){
     		console.log("Sorry! There is an error in deleting the task");
     	}else{
     		console.log("Successfully deleted the tasks.");
     	}
     });
}
}
   res.redirect("/"); // it means go to the home route i.e. call the app.get() function
});

app.listen(process.env.PORT,function(){
	console.log("app is running at port 3000");
});