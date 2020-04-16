var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

// Ruta
app.get('/:type/:image', (req, res, next) => {
    var type = req.params.type;
    var image = req.params.image;

    var pathImage = path.resolve(__dirname, `../uploads/${type}/${image}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;