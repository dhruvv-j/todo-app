const express = require("express");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const cors = require('cors'); 
const {UserModel, TodoModel} = require("./db");
const { default: mongoose } = require("mongoose");

mongoose.connect(process.env.DB_URL);
const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async function (req,res){
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email: email,
        password: password,
        name: name
    })

    res.json({
        message: "You are Signed UP"
    })
});

app.post("/signin", async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email,
        password: password
    })

    console.log(user);

    if(user){
        const token = jwt.sign({
                id: user._id.toString()
            }, process.env.JWT_SECRET);
        res.json({
            token: token
        });
    }
    else{
        res.status(403).json({
            message: "Incorrect Credentials"
        });
    }
});

const auth = (req,res,next) => {
    const token = req.headers.token;
    const response = jwt.verify(token,process.env.JWT_SECRET);

    if(response){
        req.userId = response.id;
        next();
    } 
    else{
        res.status(403).json({
            message: "Log in Again"
        })
    } 
}

app.post("/todo",auth,async function(req,res){
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        title: title,
        done: done,
        userId: userId
    })

    res.json({
        message: "Todo Created"
    })
});

app.get("/todos",auth, async function(req,res){
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    })

    res.json({
        todos
    })
});

app.listen(3000);