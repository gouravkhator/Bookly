const express = require('express');
const Book = require('../models/book');
const Author = require('../models/author');
const router = express.Router();
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

//all books routes
router.get('/', async (req, res) => {
    let query = Book.find(); //an object to which i can query and append by regex
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
        //query title field in each data and check the regex matching with options 'i' as case insensitive
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore); //the book found is before the date queried
        //the book queried is "books published before some date"
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books,
            searchOptions: req.query
        });
    } catch{
        res.redirect('/');
    }
});

//new book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

//Create book route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);
    } catch{
        renderNewPage(res, book, true);
    }
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors,
            book
        };
        if (hasError) params.errorMessage = 'Error Creating Book';
        res.render('books/new', params);
    } catch{
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded); //maybe it cannot be parsed to JSON so cover will be null so check that
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64'); //as cover.data is encoded in base64 format so create a buffer
        book.coverImageType = cover.type;
    }
}
module.exports = router;