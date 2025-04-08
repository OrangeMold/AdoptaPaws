const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


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

app.get('/create-account', (req, res) => {
    res.render('pages/createAccount');
});




const loginFilePath = path.join(__dirname, 'data', 'logins.txt');

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validate username and password format
    const isValidUsername = /^[a-zA-Z0-9]+$/.test(username);
    const isValidPassword =
        /^[a-zA-Z0-9]{4,}$/.test(password) &&
        /[a-zA-Z]/.test(password) &&
        /\d/.test(password);

    if (!isValidUsername || !isValidPassword) {
        return res.status(400).send("Invalid username or password format.");
    }

    // Read the file and check if username already exists
    fs.readFile(loginFilePath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Server error reading file.');

        // Check if the username already exists in the file
        const exists = data.split('\n').some(line => line.startsWith(username + ':'));
        if (exists) {
            return res.send("Username already exists. Please try another.");
        }

        // If username doesn't exist, append the new account details
        fs.appendFile(loginFilePath, `${username}:${password}\n`, (err) => {
            if (err) return res.status(500).send('Error writing to file.');
            res.send("Account successfully created! You can now log in.");
        });
    });
});


// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
