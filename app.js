const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('pages/home');
});

app.get('/browse', (req, res) => {
    res.render('pages/browse');
});

app.get('/find', (req, res) => {
    res.render('pages/find');
});

app.get('/dog-care', (req, res) => {
    res.render('pages/dogCare');
});

app.get('/cat-care', (req, res) => {
    res.render('pages/catCare');
});

app.get('/give-away', (req, res) => {
    res.render('pages/giveAway');
});

app.get('/contact', (req, res) => {
    res.render('pages/contact');
});

app.get('/privacy', (req, res) => {
    res.render('pages/privacy');
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
