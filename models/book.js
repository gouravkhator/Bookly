const mongoose = require('mongoose');

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
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
});

//This is virtual attribute definition like all other attributes which calls the function given 
//It is used when we don't want to save this but require some manipulations on some defined attribute and access it directly

bookSchema.virtual('coverImagePath').get(function () {
    if (this.coverImage != null && this.coverImageType != null) //if name of book cover file is set
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;

    //in html to add src to img tag, data: can be used to display buffer data
    //data type and then charset and encoding then actual image to string from base64 format
});
//now book.coverImagePath can be accessed directly

module.exports = mongoose.model('Book', bookSchema);