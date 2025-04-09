const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'super-secret-code', //:)
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24 //so 1 day
    }
}));

function requireAuth(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        req.session.redirectTo = req.originalUrl;
        res.redirect('/login'); //redirect to login
    }
}

//parse data
function parsePetLine(line) {
    const parts = line.split(':');
    if (parts.length < 12) return null; //line has enough parts
    return {
        id: parts[0],
        username: parts[1],
        type: parts[2], 
        breed: parts[3], 
        age: parts[4], 
        gender: parts[5], 
        getsAlongDogs: parts[6], 
        getsAlongCats: parts[7], 
        suitableForFamily: parts[8], 
        comment: parts[9], 
        ownerName: parts[10],
        ownerEmail: parts[11] 
    };
}

app.get('/browse', (req, res) => {
    const searchCriteria = req.query; //get search params

    fs.readFile(petsFilePath, 'utf-8', (err, data) => {
        let allPets = [];
        let filteredPets = [];

        if (err && err.code !== 'ENOENT') {
            console.error("Error reading pets file:", err);
            return res.status(500).render('pages/browse', {
                username: req.session.username,
                pets: [], 
                error: 'Could not load pet data.'
            });
        }

        if (!err && data) { 
            allPets = data.trim().split('\n')
                .map(parsePetLine)
                .filter(pet => pet !== null);
        }

        if (Object.keys(searchCriteria).length === 0) {
            filteredPets = allPets;
        } else {
            filteredPets = allPets.filter(pet => {
                let match = true; 

                //check type
                if (searchCriteria.type && pet.type.toLowerCase() !== searchCriteria.type.toLowerCase()) {
                    match = false;
                }
                //check breed
                if (match && searchCriteria.breed && !pet.breed.toLowerCase().includes(searchCriteria.breed.toLowerCase())) {
                    match = false;
                }
                //check age
                if (match && searchCriteria.age && pet.age !== searchCriteria.age) {
                    match = false;
                }
                //check gender
                if (match && searchCriteria.gender && pet.gender !== searchCriteria.gender) {
                    match = false;
                }

                //check friendly
                if (match && searchCriteria.friendly) {
                    const friendlyCriteria = Array.isArray(searchCriteria.friendly) ? searchCriteria.friendly : [searchCriteria.friendly];

                    if (friendlyCriteria.includes('dogs') && pet.getsAlongDogs !== 'yes') {
                        match = false;
                    }
                    if (match && friendlyCriteria.includes('cats') && pet.getsAlongCats !== 'yes') {
                        match = false;
                    }
                    if (match && friendlyCriteria.includes('smallChildren') && pet.suitableForFamily !== 'yes') {
                        match = false;
                    }
                }

                return match; 
            });
        }

        res.render('pages/browse', {
            username: req.session.username,
            pets: filteredPets, 
            error: null
        });
    });
});

app.get('/', (req, res) => {
    res.render('pages/home', { username: req.session.username }); //pass username if logged in
});



app.get('/find', (req, res) => {
    res.render('pages/find', { username: req.session.username });
});

app.get('/dog-care', (req, res) => {
    res.render('pages/dogCare', { username: req.session.username });
});

app.get('/cat-care', (req, res) => {
    res.render('pages/catCare', { username: req.session.username });
});

app.get('/give-away', requireAuth, (req, res) => {
    res.render('pages/giveAway', { username: req.session.username });
});

app.get('/contact', (req, res) => {
    res.render('pages/contact', { username: req.session.username });
});

app.get('/privacy', (req, res) => {
    res.render('pages/privacy', { username: req.session.username });
});

app.get('/create-account', (req, res) => {
    res.render('pages/createAccount', { username: req.session.username });
});


app.get('/login', (req, res) => {
    res.render('pages/login', { error: null });
});

const loginFilePath = path.join(__dirname, 'data', 'logins.txt');
const petsFilePath = path.join(__dirname, 'data', 'pets.txt'); 

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(loginFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error("error reading logins file:", err);
            return res.status(500).render('pages/login', { error: 'Server error during login..?' });
        }

        const lines = data.split('\n').filter(line => line.trim() !== ''); //read lines, ignore empty ones
        let found = false;

        for (const line of lines) {
            const [storedUsername, storedPassword] = line.split(':');
            if (username === storedUsername && password === storedPassword) {
                found = true;
                break; 
            }
        }

        if (found) {
            req.session.isAuthenticated = true;
            req.session.username = username;

            const redirectTo = req.session.redirectTo || '/give-away'; 
            delete req.session.redirectTo; 
            res.redirect(redirectTo);
        } else {
            //authentication failed
            res.status(401).render('pages/login', { error: 'Invalid username or password ;(' });
        }
    });
});


app.get('/logout', (req, res) => {
    const username = req.session.username;

    //kill session data
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('server error can not log you out');
        }
        res.render('pages/logoutConfirm');
    });
});


app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const isValidUsername = /^[a-zA-Z0-9]+$/.test(username);
    const isValidPassword =
        /^[a-zA-Z0-9]{4,}$/.test(password) &&
        /[a-zA-Z]/.test(password) &&
        /\d/.test(password);

    if (!isValidUsername || !isValidPassword) {
        return res.status(400).send("Invalid username or password format.");
    }

    fs.readFile(loginFilePath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Server error reading file.');

        const exists = data.split('\n').some(line => line.startsWith(username + ':'));
        if (exists) {
            return res.send("Username already exists. Please try another.");
        }

        fs.appendFile(loginFilePath, `${username}:${password}\n`, (err) => {
            if (err) return res.status(500).send('Error writing to file.');
            res.send("Account successfully created! You can now log in.");
        });
    });
});


app.post('/submit-pet', requireAuth, (req, res) => {
    const username = req.session.username; 
    const formData = req.body; 

    fs.readFile(petsFilePath, 'utf-8', (err, data) => {
        let nextId = 1; 

        if (err && err.code !== 'ENOENT') {
            return res.status(500).send("error processing pet submission");
        }

        if (!err && data) { 
            const lines = data.trim().split('\n');
            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                const lastIdStr = lastLine.split(':')[0];
                const lastId = parseInt(lastIdStr, 10);
                if (!isNaN(lastId)) {
                    nextId = lastId + 1;
                } else {
                    console.warn(`Could not parse ID from last line: "${lastLine}". Using next ID (based on line count)`);
                     nextId = lines.length + 1; 
                }
            }
        }

        const petDataString = [
            nextId,
            username,
            formData['pet-type'],
            formData.breed,
            formData.age,
            formData.gender,
            formData['gets-along-dogs'],
            formData['gets-along-cats'],
            formData['suitable-for-family'],
            formData.comment.replace(/\n/g, ' '), 
            formData['owner-name'],
            formData['owner-email']
        ].join(':'); 

        fs.appendFile(petsFilePath, petDataString + '\n', (appendErr) => {
            if (appendErr) {
                console.error("eror appending to pets file:", appendErr);
                return res.status(500).send("Error saving pet details:(");
            }

            console.log(`Pet data saved: ${petDataString}`);
            res.redirect('/browse?status=success');
        });
    });
});

//start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
