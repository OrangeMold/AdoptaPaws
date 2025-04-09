const express = require('express');
const session = require('express-session'); // Import express-session
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Add this to parse form data

// --- Session Configuration ---
app.use(session({
    secret: 'your-very-secret-key-change-this', // CHANGE THIS to a random, secure string
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Optional: Cookie expiry (e.g., 1 day)
    }
}));

// --- Authentication Middleware ---
// This function checks if the user is logged in
function requireAuth(req, res, next) {
    if (req.session.isAuthenticated) {
        next(); // User is authenticated, proceed to the route
    } else {
        // Store the original URL they were trying to reach
        req.session.redirectTo = req.originalUrl;
        res.redirect('/login'); // User not authenticated, redirect to login
    }
}

// --- Routes ---
app.get('/', (req, res) => {
    res.render('pages/home', { username: req.session.username }); // Pass username if logged in
});

app.get('/browse', (req, res) => {
    res.render('pages/browse', { username: req.session.username });
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

// Protect the /give-away route using the middleware
app.get('/give-away', requireAuth, (req, res) => {
    res.render('pages/giveAway', { username: req.session.username }); // Can now safely assume user is logged in
});

app.get('/contact', (req, res) => {
    res.render('pages/contact', { username: req.session.username });
});

app.get('/privacy', (req, res) => {
    res.render('pages/privacy', { username: req.session.username });
});

app.get('/create-account', (req, res) => {
    res.render('pages/createAccount');
});

// --- Login Routes ---
app.get('/login', (req, res) => {
    // If already logged in, maybe redirect to home or profile? Optional.
    // if (req.session.isAuthenticated) {
    //     return res.redirect('/');
    // }
    res.render('pages/login', { error: null }); // Pass null error initially
});

const loginFilePath = path.join(__dirname, 'data', 'logins.txt');
const petsFilePath = path.join(__dirname, 'data', 'pets.txt'); // Define path for pets data

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(loginFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading logins file:", err);
            // Render login page with a generic error
            return res.status(500).render('pages/login', { error: 'Server error during login.' });
        }

        const lines = data.split('\n').filter(line => line.trim() !== ''); // Read lines, ignore empty ones
        let found = false;

        for (const line of lines) {
            const [storedUsername, storedPassword] = line.split(':');
            if (username === storedUsername && password === storedPassword) {
                found = true;
                break; // Exit loop once match is found
            }
        }

        if (found) {
            // Authentication successful
            req.session.isAuthenticated = true;
            req.session.username = username; // Store username in session

            // Redirect to the originally requested URL or default to '/'
            const redirectTo = req.session.redirectTo || '/give-away'; // Default to giveAway if no specific page was requested
            delete req.session.redirectTo; // Clear the stored redirect URL
            res.redirect(redirectTo);
        } else {
            // Authentication failed
            res.status(401).render('pages/login', { error: 'Invalid username or password.' });
        }
    });
});

// --- Logout Route ---
app.get('/logout', (req, res) => {
    const username = req.session.username; // Optional: Get username before destroying session if needed

    // Destroy the session data
    req.session.destroy((err) => {
        if (err) {
            // Handle potential errors during session destruction
            console.error("Error destroying session:", err);
            // Maybe render an error page instead of just sending text
            return res.status(500).send('Could not log out due to a server error.');
        }
        // Render the logout confirmation page instead of redirecting
        res.render('pages/logoutConfirm');
    });
});


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

// --- ***** NEW ROUTE TO HANDLE PET SUBMISSION ***** ---
app.post('/submit-pet', requireAuth, (req, res) => {
    const username = req.session.username; // Get username from session
    const formData = req.body; // Form data is in req.body

    // 1. Determine the next ID
    fs.readFile(petsFilePath, 'utf-8', (err, data) => {
        let nextId = 1; // Default to 1 if file doesn't exist or is empty

        if (err && err.code !== 'ENOENT') {
            // Handle errors other than file not found
            console.error("Error reading pets file:", err);
            return res.status(500).send("Error processing pet submission.");
        }

        if (!err && data) { // If file exists and has content
            const lines = data.trim().split('\n');
            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                const lastIdStr = lastLine.split(':')[0];
                const lastId = parseInt(lastIdStr, 10);
                if (!isNaN(lastId)) {
                    nextId = lastId + 1;
                } else {
                    // Fallback if the last line's ID is somehow not a number
                    // You might want more robust error handling here
                    console.warn(`Could not parse ID from last line: "${lastLine}". Using next sequential ID based on line count.`);
                     nextId = lines.length + 1; // Alternative fallback
                }
            }
        }

        // 2. Format the data string
        // Use bracket notation for keys with hyphens
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
            formData.comment.replace(/\n/g, ' '), // Replace newlines in comment to keep one line per pet
            formData['owner-name'],
            formData['owner-email']
        ].join(':'); // Join all parts with a colon

        // 3. Append data to pets.txt
        fs.appendFile(petsFilePath, petDataString + '\n', (appendErr) => {
            if (appendErr) {
                console.error("Error appending to pets file:", appendErr);
                return res.status(500).send("Error saving pet details.");
            }

            // 4. Send a response (e.g., redirect or success message)
            console.log(`Pet data saved: ${petDataString}`);
            // Redirect to the browse page after successful submission
            res.redirect('/browse?status=success');
            // Or send a success message:
            // res.send("Pet information submitted successfully!");
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
