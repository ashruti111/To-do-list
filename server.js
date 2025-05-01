const express = require('express');
const sqlite3 = require('sqlite3').verbose(); 
const path = require('path');

const app = express();
const PORT = 5000;
 
app.use(express.json());

// Set up SQLite database (db file in the same directory)
const db = new sqlite3.Database(path.join(__dirname, 'todos.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('SQLite database connected');
        // Create todos table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL
            );
        `);
    }
});

// Serve static files (index.html) from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET all todos
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST a new todo
app.post('/todos', (req, res) => {
    const { task } = req.body;
    if (!task || typeof task !== 'string') {
        return res.status(400).json({ error: 'Invalid task' });
    }

    const stmt = db.prepare('INSERT INTO todos (task) VALUES (?)');
    stmt.run(task, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, task });
    });
    stmt.finalize();
});

// DELETE a todo by ID
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    db.run('DELETE FROM todos WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ success: true });
    });
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
