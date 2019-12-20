const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index'); //index.ejs is in /views folder and we said in server.js that use views folder for all view rendering
});
module.exports = router;