const express = require('express');
const app = express();
const data = require('../data/homer.json');
const earnings = require('../data/monthlyEarnings.json');
app.get('/homer', (req,res) => {
    res.json(data);
});
app.get('/earnings', (req, res) => {
    res.json(earnings);
})
app.listen(3000, function() { console.log('Server running on PORT 3000') });