const express = require('express');
const spawn = require('child_process').spawn;
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const paypal = require('paypal-rest-sdk');
const keys = require('./config/keys');
const billingroutes = require('./routes/billingroutes');

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));

paypal.configure({
    'mode': 'sandbox',
    'client_id': keys.paypalClientId,
    'client_secret': keys.paypalSecretId
})

app.use(bodyParser.json());

mongoose.connect(keys.mongoURI)

require('./models/User');
require('./services/passport');

app.use(
    cookieSession({
        maxAge: 30*24*60*60*1000,
        keys: [keys.cookieKey]
    })
);

app.use(passport.initialize());
app.use(passport.session());

//billingroutes(app);

app.get('/',(req,res)=>{
    res.render('landing');
})

app.get('/auth/google', passport.authenticate('google',{
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google'), (req,res) => {
    //console.log('1');
    res.redirect('/main');
    //console.log('2');
});

app.get('/main', (req,res)=>{
    res.render('main');
});

app.get('/about', (req,res)=>{
    res.render('about');
})

app.post('/api/ml', (req,res)=>{
    var fname = req.body.first;
    var sname = req.body.second;
    var fname = fname.charAt(0).toUpperCase() + fname.slice(1);
    var sname = sname.charAt(0).toUpperCase() + sname.slice(1);
    let x=0;
    const process = spawn('python',["./match1.py", fname,sname]);
    process.stdout.on('data',(data)=>{
        x=1;
        var data1 = data.toString();
        var data3 = data1.split("*");
        for(let i=0;i<3;i++){
            data3[i]=parseFloat(data3[i]);
            data3[i]=data3[i].toFixed(4);
        }
        //var data1 = parseFloat(data.toString());
        var data2 = {
            data3:data3,
            team1: fname,
            team2: sname
        };
        res.render('main1',{data:data2});
    })
    setTimeout(()=>{
        if(x==0){
            var data2={
                error:'Something went wrong! Please re enter the values again correctly'
            }
            res.render('main1',{data:data2});
        }
    },10000)
});


app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

const port = process.env.PORT || 3000
app.listen(port,function(){
    console.log('Server is up');
})