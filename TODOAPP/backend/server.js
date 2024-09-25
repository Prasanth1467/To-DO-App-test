const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const db = new sqlite3.Database(':memory:');
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Create tables for users and todos
db.serialize(() => {
  db.run(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    title TEXT,
    status TEXT,
    userId TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
});

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (token) {
    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// User signup
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();

  db.run(`INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`, [id, name, email, hashedPassword], (err) => {
    if (err) {
      return res.status(400).send('Email already in use.');
    }
    res.status(201).send('User registered.');
  });
});

// User login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).send('User not found.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials.');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret_key');
    res.json({ token });
  });
});

// Get user profile
app.get('/profile', authenticateJWT, (req, res) => {
  db.get(`SELECT id, name, email FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.json(user);
  });
});

// Update user profile
app.put('/profile', authenticateJWT, async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  db.run(`UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`, [name, email, hashedPassword, req.user.id], (err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.send('Profile updated.');
  });
});

// Todo CRUD operations
app.post('/todos', authenticateJWT, (req, res) => {
  const { title } = req.body;
  const id = uuidv4();
  db.run(`INSERT INTO todos (id, title, status, userId) VALUES (?, ?, ?, ?)`, [id, title, 'pending', req.user.id], (err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.status(201).send('Todo created.');
  });
});

app.get('/todos', authenticateJWT, (req, res) => {
  db.all(`SELECT * FROM todos WHERE userId = ?`, [req.user.id], (err, todos) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.json(todos);
  });
});

app.put('/todos/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE todos SET status = ? WHERE id = ? AND userId = ?`, [status, id, req.user.id], (err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.send('Todo updated.');
  });
});

app.delete('/todos/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM todos WHERE id = ? AND userId = ?`, [id, req.user.id], (err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.send('Todo deleted.');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
