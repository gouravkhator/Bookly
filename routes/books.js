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
        res.redirect(`books/${newBook.id}`);
    } catch{
        renderNewPage(res, book, true);
    }
});

//show book info
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        //populate brings all author info as well in author and now author of book is an object.
        res.render('books/show', { book });
    } catch {
        res.redirect('/');
    }
});

//edit book page get request
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch{
        res.redirect('/');
    }
});

//Update book put request
router.put('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        //to get date and make it a timestamp with date and time fields also.
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        //req.body.cover is a string of base64 format
        if (req.body.cover != null && req.body.cover !== '') {
            //if the user actually uploaded something now then save the cover
            saveCover(book, req.body.cover);
        }
        await book.save();
        book = await Book.findById(req.params.id).populate('author').exec(); //to populate new author as object otherwise it will be blank
        res.render('books/show', { book });
    } catch{
        if (book == null)
            res.redirect('/'); //id was wrongly given
        else
            renderEditPage(res, book, true); //some updation was incorrect
    }
});

router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch{
        if (book == null) {
            res.redirect('/');
        } else {
            res.render('books/show', { book, errorMessage: 'Could not remove book' });
        }
    }
});

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors,
            book
        };
        if (hasError) {
            if (form === 'edit')
                params.errorMessage = 'Error Updating Book';
            else
                params.errorMessage = 'Error Creating Book';
        }
        res.render(`books/${form}`, params);
    } catch{
        res.redirect('/books'); //cannot find authors so redirect to books
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    try {
        const cover = JSON.parse(coverEncoded); //maybe it cannot be parsed to JSON so cover will be null so check that
        if (cover != null && imageMimeTypes.includes(cover.type)) {
            book.coverImage = new Buffer.from(cover.data, 'base64'); //as cover.data is encoded in base64 format so create a buffer
            book.coverImageType = cover.type;

            //cover.data is string which can be made to buffer in base64 format
            //the path of image can be taken as "data:<type>;charset=utf-8;base64,<image-as-buffer>.toString(<from base 64>)"
        }
    } catch{
        //if JSON.parse cannot parse the string then make all properties null
        book.coverImage = null;
        book.coverImageType = null;
    }
}
module.exports = router;