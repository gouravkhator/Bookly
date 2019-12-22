const mongoose = require('mongoose');
const path = require('path');
const coverImgBasePath = 'uploads/bookCovers';

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
});

//This is virtual attribute definition like all other attributes which calls the function given 
//It is used when we don't want to save this but require some manipulations on some defined attribute and access it directly
bookSchema.virtual('coverImagePath', function () {
    if (this.coverImageName != null) //if name of book cover file is set
        return path.join('/', coverImgBasePath, this.coverImageName); //get the path
    // '/' means in base here means public folder as we declared it base
    //then uploads/bookCovers/<name of file>
});
//now book.coverImagePath can be accessed directly

module.exports = mongoose.model('Book', bookSchema);
module.exports.coverImgBasePath = coverImgBasePath;