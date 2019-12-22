const express = require('express');
const Author = require('../models/author');
const router = express.Router();

//all authors or searched author
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i'); //i for case insensitive
        //so it searches for all possible expressions
    } //if nothing sent then all authors arefetched
    try {
        const authors = await Author.find(searchOptions); //finding authors with some search conditions
        //fetching all of them
        res.render('authors/index', { authors, searchOptions: req.query });
    } catch{
        res.redirect('/');
    }

});

//new author
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

//Create author route
//POST request on submitiing new author creation
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });

    try {
        const newAuthor = await author.save(); //after saving in db it returns that newAuthor with _id
        //res.redirect(`authors/${newAuthor.id}`);
        res.redirect(`authors/`);
    } catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        });
    }
    //This code could be done normally but would use nested callbacks so async await is used
    //as author.save() is asynchronous so newAuthor will be populated only when it finishes its callback
});
module.exports = router;