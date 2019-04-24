const express = require('express');
const app = express();
const data = require('../data/homer.json');
app.get('/homer', (req,res) => {
    res.json(data);
});

app.listen(3000, function() { console.log('hi') });