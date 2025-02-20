const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Temporary storage (Replace with a database later)
let users = [];

// 👉 POST: Create a new user
app.post('/users', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newUser = { id: users.length + 1, firstName, lastName, email, password };
    users.push(newUser);

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

// 👉 GET: Retrieve all users
app.get('/users', (req, res) => {
    res.json(users);
});

// Start the server
app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
