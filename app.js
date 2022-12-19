//jshint esversion:6
//Basically what we do is we print 3 stuff if database is empty and everything else from database otherwise..in get(/)
//Another get is for the customised ones
//and we CREATE and redirect-post1(for both)
//and we DELETE and redirect-post2(for both)

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.  
connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true})
//.then(()=>console.log("DB Connected"))
//.catch((err)=>console.log("App has Erry",err));

//Schema
const itemSchema={
  name:String
};
//Model-kinda like collection/table(<singularcollectionname>,schemaname)
const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
});
const item2=new Item({
  name:"Hot the + button to add a new item"
});
const item3=new Item({
  name:"<--Hit this to delete a task"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
 };
 const List=mongoose.model("List",listSchema)
 



//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {
//find to show the stuff/render the stuff in the pg through the item 
  Item.find({},function(err,foundItems){//foundItems is answer of .find we insert 3 stuff if empty otherwise just print stuff in database....
 //if its not empty only then insert   
if(foundItems.length===0){

  Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Successfully saved the items")
  }
});

res.redirect("/")
}
else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
}
});
});


//const day = date.getDate();

 // res.render("list", {listTitle: day, newListItems: items});

 //Kinda SIMILAR TO WHAT WE DO IN THE GET(/)
 app.get("/:customListName",function(req,res){
 const customListName=req.params.customListName;

 List.findOne({name:customListName},function(err,foundList){
  if (!err){
    if(!foundList){
    const list=new List({
  name:customListName,items:defaultItems
 }) ;
 list.save();
 res.redirect("/"+customListName)
    }else{//Already there
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
    }
  })
 });

 //this is very imp and makes a lot of sense
 




app.post("/", function(req, res){
//the form values name is newItem and the buttons name is list
  //const item = req.body.newItem;
  //console.log(req.body);
  //if (req.body.list === "Work") {
   // workItems.push(item);
  //  console.log(req.body.list);
  //  res.redirect("/work");
  //} else {
    //items.push(item);
    //res.redirect("/");
  //}
//});
const ItemName= req.body.newItem;//From the form we get newitem which is the value entered 
const listName=req.body.list;//So we see the customeList May need to be handled a bit differently

//Here list value is when we "get" the page from that,based on that we hv a value rendered which is in the button 

const item=new Item({//this is for database and the rendering will show on pg(get)
  name:ItemName 
});

if(listName==="Today"){
  item.save();
  res.redirect("/")
}
else{
  List.findOne({name:listName},function(err,foundList){
   foundList.items.push(item);//added to the customised pg database 
   foundList.save();
   res.redirect("/"+ listName)
  })
}

//to show stuff on the page we redirect it

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
Item.findByIdAndRemove(checkedItemId,function(err){
  if(!err){
    console.log("Successfully Deleted Checked Item ")
    res.redirect("/");
  }
});

  }
else
{
  //various ways-javascript for loop,filter method
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList) )



  if(!err){
    res.redirect("/"+ listName);
  }
}

})





app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
//to remove we have to provide calback
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3001, function() {
  console.log("Server started on port 3001");
});

