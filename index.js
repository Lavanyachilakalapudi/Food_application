var express=require('express');
var multer=require('multer');
var bodyParser = require('body-parser')
var cookieParser =require('cookie-parser');
//var session =require('express-session');
const fs= require('fs');
var app= express();
app.set('view engine','pug');
app.set('views','./views');
app.use(express.static(__dirname+"/public"))
app.use(express.static(__dirname+"/uploads"));

app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use(cookieParser());
app.get("/",function(req,res){
    res.redirect("/login.html");
})

//app.use(session({secret:"user login details"}));
var login={};
//var username=[{username:"lavanya",password:"1234",placeorder:[]},{username:"nandu",password:"abc",placeorder:[]},{username:"varshi",password:"varshi",placeorder:[]}];
app.post("/authenticate",function(req,res){
    console.log(login);
    var temp=0;
    var test=JSON.parse((fs.readFileSync(__dirname+"/database.json").toString()));
    // console.log(test);
    // console.log(req.body);
    test.details.forEach(function(a,b,next){
        if(a.username===req.body.username && a.password===req.body.password){
            res.cookie('username',req.body.username);
            temp=1;
            
        }
    })
    if(temp==1){
        res.redirect("/home?mylocation=all");
    }
    else{
        res.redirect("/registration.html");
    }
})
app.use(function(req,res,next){
    if(req.cookies.username){
        next();
    }
    else{
        res.redirect("/")
    }
})

app.get("/home",function(req,res){
    //console.log(req.query.mylocation)
    let rawdata =fs.readFileSync('./database.json');
    const item = JSON.parse(rawdata);
    var locations=[];
    //console.log(loc);
    item.users.forEach(function(a,b){
        if(locations.includes(a.location)){}
        else{
            locations.push(a.location);
        }
    })
     //console.log(item);
    // console.log(locations);
    res.render("home",{items:item.users,locations:locations,locsel:req.query.mylocation,username:req.cookies.username});
})

app.get("/additem",function(req,res){
    res.redirect("additemform");
})
app.get("/additemform",function(req,res){
    res.render("additemform");
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'D:/WAL_intern_Training_practice/22-03-2022/Food_order_app/uploads')
    }
  })
  const upload = multer({ storage: storage })

var jsonfile=require('jsonfile');
var file ='./database.json';
app.post("/additem",upload.single("foodimage"),function(req,res){
    //console.log(req.body);
    let rawdata =fs.readFileSync('./database.json');
    const item=JSON.parse(rawdata);
    //console.log(req.file);
    var obj={};
    obj.name=req.body.food;
    obj.servedcapacity=req.body.servedcapacity;
    obj.price=req.body.price;
    obj.remarks=req.body.remarks;
    obj.location=req.body.location;
    obj.name=req.body.food;
    obj.delivery=req.body.delivery;
    obj.foodimage=req.file.filename;
    item.users.push(obj);
    jsonfile.writeFileSync(file,{users: item.users})
    res.redirect("home");   
})
app.post("/register",function(req,res){
    let rawdata =fs.readFileSync('database.json');
    const item = JSON.parse(rawdata);
    console.log(item);
    var obj=JSON.parse(JSON.stringify(req.body));
    //console.log(obj);
    item.details.push(obj);
    fs.writeFileSync("database.json",JSON.stringify(item),'utf-8');
    res.redirect("/login.html");
})

app.get("/display",function(req,res){
    console.log(typeof req.query.data);
    res.render("order",{data: JSON.parse(req.query.data)})
})
app.get("/orderitem",function(req,res){
    //console.log(req.body.location);
    let rawdata =fs.readFileSync('./database.json');
    const loc = JSON.parse(rawdata);
    var locations=[];
    //console.log(loc);
    loc.users.forEach(function(a,b){
        if(locations.includes(a.location)){}
        else{
            locations.push(a.location);
        }
    })
    console.log(locations);
    res.render("orderitem",{locations:locations})
})
app.get("/order/:item",function(req,res){
    let placeditem=null;
    //console.log(req.item,req.params);
    var test=JSON.parse((fs.readFileSync(__dirname+"/database.json").toString()));
    var obj=JSON.parse(JSON.stringify(req.body));
    test.users.forEach(function(a,b){
        if(req.params.item===a.name){
            placeditem=a;
        }
    })
    console.log(placeditem)
    obj.item=placeditem;
    obj.user=req.cookies.username;
    test.placedorders.push(obj);
    fs.writeFileSync("database.json",JSON.stringify(test),'utf-8');   
    res.render("success");
})
app.get("/placeorders",function(req,res){
    var test=JSON.parse((fs.readFileSync(__dirname+"/database.json").toString()));
    //console.log(test.placedorders[0].user,req.cookies.username)
    res.render("placeorders",{username:req.cookies.username,placeorder: test.placedorders})
})

app.get("/myorders",function(req,res){
    var test=JSON.parse((fs.readFileSync(__dirname+"/database.json").toString()));
    //console.log(test.placedorders[0].user,req.cookies.username)
    res.render("myorders",{username:req.cookies.username,placeorder: test.placedorders})
})
app.post("/selectloc",function(req,res){
    var data=JSON.parse(fs.readFileSync('./database.json').toString());
    console.log(data.users);
    res.render("display",{data:data.users,userloc:req.body.mylocation})
})

app.get("/edit/:item",function(req,res){
    let edititem=null;
    //console.log(req.item,req.params);
    var test=JSON.parse((fs.readFileSync(__dirname+"/database.json").toString()));
    test.users.forEach(function(a,b){
        if(req.params.item===a.name){
            edititem=a;
        }
    })
    res.render("editform",{edititem:edititem});
})
app.get("/logout",function(req,res){
    res.clearCookie("username");
    res.redirect("/login.html");
})
app.post("/updateitem",function(req,res){
    console.log(req.body);
    res.render("success");
})

app.listen(process.env.PORT)