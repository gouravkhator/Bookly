if (process.env.NODE_ENV !== 'production') {
    //if the app is not in production  
    //then mongodb will be in localhost and the path is in .env file
    require('dotenv').parse();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout'); //to include header and footer in html to reuse
app.use(expressLayouts);
app.use(express.static('public')); //public folder for css and js files

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }); //mongoose uses old style of accessing database 
//so using new would be better
//to load environment variables in app we use dotenv 
const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('Connected to mongoose'));

app.use('/', indexRouter); // '/' is the root for indexRouter

app.listen(process.env.PORT || 3000); //process.env.PORT which is used in hosting the website