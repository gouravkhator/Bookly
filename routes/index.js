const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', async (req, res) => {
    let books;
    try {
        books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec();
    } catch{
        books = [];
    }
    res.render('index', {
        books
    });
    //index.ejs is in /views folder and we said in server.js that use views folder for all view rendering
});
module.exports = router;