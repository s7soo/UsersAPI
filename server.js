const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Temporary storage (Replace with a database later)
let users = [];

// 👉 POST: Register a new user (Signup)
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, firstName, lastName, email, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
});

// 👉 POST: Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
});

// 👉 Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// 👉 GET: Retrieve all users (Protected Route)
app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});
// 👉 GET: Retrieve all users (Protected Route)
app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});

// 👉 GET: Retrieve a user by ID (Protected Route)
app.get('/users/:id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id);
    console.log("Requested User ID:", userId); // Debugging

    const user = users.find(u => u.id === userId);
    console.log("Found User:", user); // Debugging

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
});

// Start the server
app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
