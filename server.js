if (process.env.NODE_ENV !== 'production') {
    //if the app is not in production  
    //then mongodb will be in localhost and the path is in .env file
    require('dotenv').config({ path: './.env' });
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout'); //to include header and footer in html to reuse
app.use(expressLayouts);
app.use(express.static('public')); //public folder for css and js files
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }); //mongoose uses old style of accessing database 
//so using new would be better
//to load environment variables in app we use dotenv 
const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('Connected to mongoose'));

app.use('/', indexRouter); // '/' is the root for indexRouter
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

app.listen(process.env.PORT || 3000); //process.env.PORT which is used in hosting the website


//dependencies :
/* body-parser to get values from form fields
_form_fields has some reusable form fields to be used in different pages
views has authors folder , layouts, partials
partials for reusable headers in diff. pages
*/