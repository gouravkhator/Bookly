const express = require('express');
const Author = require('../models/author');
const Book = require('../models/book');
const router = express.Router();

//all authors or searched author on clicking search or all authors
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i'); //i for case insensitive
        //so it searches for all possible expressions
    } //if nothing sent then all authors are fetched
    try {
        const authors = await Author.find(searchOptions); //finding authors with some search conditions
        //error can only happen when mongodb is unable to access db
        //if searched author is not found then all authors are returned. so no error there.
        res.render('authors/index', { authors, searchOptions: req.query });
    } catch{
        res.redirect('/');
    }

});

//new author on clicking add author
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

//Create author route
//POST request on submitting new author creation
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });

    try {
        const newAuthor = await author.save(); //after saving in db it returns that newAuthor with _id
        res.redirect(`/authors/${newAuthor.id}`);
    } catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        });
    }
    //This code could be done normally but would use nested callbacks so async await is used
    //as author.save() is asynchronous so newAuthor will be populated only when it finishes its callback
});

//on view clicking
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({ author: req.params.id }).limit(6).exec();
        res.render('authors/show', {
            author,
            booksByAuthor: books
        });
    } catch{
        res.redirect('/');
    }
});

//on edit clicking
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author });
    } catch{
        res.redirect('/authors');
    }
});

//on update clicking
router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch{
        //as two awaits are there so 2 issue can occur : 1. author not found and 2. author updation not done.
        if (author == null) {
            res.redirect('/');
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating author'
            });
        }
    }
});

//on delete clicking
router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect('/authors');
    } catch{
        //as two awaits are there so 2 issue can occur : 1. author not found and 2. author updation not done.
        if (author == null) {
            res.redirect('/'); //as the person searched for non-existing id so redirect to home page 
        } else {
            try {
                const author = await Author.findById(req.params.id);
                const books = await Book.find({ author: req.params.id }).limit(6).exec();
                res.render('authors/show', {
                    author,
                    booksByAuthor: books,
                    errorMessage: 'Cannot delete author with existing books'
                });
            } catch{
                res.redirect('/');
            }
        }
    }
});
module.exports = router;

//if the person changes something in url except what should be there, then redirect to home page
//all find methods only give error when database or some fields cannot be accessed and 
//that means if searched term is not present it will not give error. It will give the entire authors on find() method.