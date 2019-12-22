const express = require('express');
const Book = require('../models/book');
const Author = require('../models/author');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const uploadPath = path.join('public', Book.coverImgBasePath);
const multer = require('multer');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
    dest: uploadPath,
    limits: {
        fileSize: 1024 * 1024 * 3,
    },
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype)); //if mimetype is included in my array then accept file else reject it
        //which gives error after wards as file is required.
    }
});

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
router.post('/', upload.single('cover'), async (req, res) => {
    //upload single file of name cover and set the file as an object to req (all behind the scenes)
    const filename = (req.file != null ? req.file.filename : null);
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: filename,
        description: req.body.description,
    });
    //for files input we use multer dependency to maintain multi platform file input.
    //In form attribute, use enctype = "multipart/form-data"
    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);
    } catch{
        if (book.coverImageName != null) {
            //if some fields are blank then also if book cover is uploaded it gets saved so we want to delete that from server
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
});

function removeBookCover(filename) {
    fs.unlink(path.join(uploadPath, filename), (err) => {
        if (err) console.error(err);
    });
}
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
module.exports = router;