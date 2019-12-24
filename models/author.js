const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

//Function checking if author has books , if yes don't delete that author
authorSchema.pre('remove', function (next) {
    Book.find({ author: this.id }, (err, books) => {
        //if some error is there in next() then mongoose will not remove that author 
        if (err)
            next(err);
        else if (books.length > 0) {
            next(new Error('This author has books associated'));
        } else
            next(); //allows removal as error in next() is null
    });
});
module.exports = mongoose.model('Author', authorSchema); //Author is name of collection in mybrary database