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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL');
});

db.on('error', function(err) {
    console.log("[mysql error]",err);
  });

const saltRounds = 10;

app.post('/signup', (req,res) => {
    const LastName =req.body.LastName;
    const FirstName =req.body.FirstName;
    const Email =req.body.Email;
    const Password =req.body.Password;
    try{
        db.query('SELECT * FROM users WHERE Email = ?', [Email], (err, result) => {
            if(result){
                res.send(err)
            }
            else{
                bcrypt.hash(Password, saltRounds, (err, hashedPassword) =>{
                    db.query('INSERT INTO users(LastName, FirstName, Email, Password) VALUES (?, ?, ?, ?)', [LastName, FirstName, Email, hashedPassword], (err, result) => {
                        if(err){
                            res.send(err)
                        }else{
                            db.query('SELECT idUser FROM users WHERE Email = ?', [Email], (err, result) =>{
                            res.send({userId: result[0].idUser, user:`${FirstName} ${LastName}`})
                            })
                        }
                    })
                })
            }
        })
    }
    catch(e){
        res.send("Couldn't register user")
    }
})

app.post('/signin', (req,res) => {
    const Email =req.body.Email;
    const Password =req.body.Password;
    try{
        db.query('SELECT * FROM users WHERE Email = ?', [Email], (err, result) => {
            if(!result){
                throw e;
            }
            else{
                bcrypt.compare(Password, result[0].Password, (err, match) =>{
                    if (match){
                        res.send({user:`${result[0].FirstName} ${result[0].LastName}`, userId: result[0].idUser})
                    }
                    if (!match){
                        res.send('Invalid password')
                    }
                })
            }
        })
    }
    catch(e){
        alert("sorry");
    }
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
    db.query("SELECT * FROM posts JOIN users ON posts.UserId = idUser", (err,result)=>{
        if(err) {
            res.send(err)
        }
        res.send(result)
    })  
})

app.listen(8080, () =>{
    console.log("server is listeling on port 8080")
})