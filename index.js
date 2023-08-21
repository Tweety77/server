const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { format } = require('date-fns');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sasha221291",
    database:"users-posts",
})

db.on('error', function(err) {
    console.log("[mysql error]",err);
  });

const saltRounds = 10;

app.post('/signup', (req,res) => {
    const LastName =req.body.LastName;
    const FirstName =req.body.FirstName;
    const Email =req.body.Email;
    const Password =req.body.Password;
     bcrypt.hash(Password, saltRounds, (err, hashedPassword) =>{
        if (err){
            res.send('Couldn`t hash password')
        }else{
            db.query('INSERT INTO users(LastName, FirstName, Email, Password) VALUES (?, ?, ?, ?)', [LastName, FirstName, Email, hashedPassword], (err, result) => {
                if(err){
                    res.send("Couldn't register user")
                }else{
                    res.send({user: FirstName + " " + LastName})
                    db.query('SELECT idUser FROM users WHERE Email = ?', [Email], (err, result) =>{
                        res.send({userId: result[0].idUser})
                    })
                }
            })
        }
     })
})

app.post('/signin', (req,res) => {
    const Email =req.body.Email;
    const Password =req.body.Password;
    db.query('SELECT * FROM users WHERE Email = ?', [Email], async(err, result) => {
            if(err){
                res.send(err.message)
            }
            else if (result.lengh < 1){
               res.send('Invalid login')
           }
        else{
            bcrypt.compare(Password, result[0].Password, (err, match) =>{
                if (match){
                    res.send({user: result[0].FirstName + " " + result[0].LastName, userId: result[0].idUser})
                }
                if (!match){
                    res.sand('Invalid password')
                }
            })
        }
    })
})

app.get('/getusers', (req,res)=>{
    db.query("SELECT * FROM users", (err,result)=>{
        if(err) {
            res.send(err)
        } 
        res.send(result)
    })  
})
  
app.post('/createpost', (req,res)=> {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'dd-MM HH:mm');
    const userId = req.body.userId;
    const text = req.body.text;

    db.query("INSERT INTO posts(postValue, postDate, userId) VALUES (?, ?, ?)",[text, formattedDate, userId], (err,result)=>{
       if(err) {
        console.log(err)
       } 
       console.log(result)
    }) 
})

app.get('/getposts', (req,res)=>{
    db.query("SELECT * FROM posts JOIN users ON posts.userId = idUser", (err,result)=>{
        if(err) {
            res.send(err)
        }
        res.send(result)
    })  
})

app.listen(8080, () =>{
    console.log("server is listeling on port 8080")
})