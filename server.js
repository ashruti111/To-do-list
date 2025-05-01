const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const FILE = './todos.json';

function readTodos() {
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(FILE));
}

function writeTodos(todos) {
    fs.writeFileSync(FILE, JSON.stringify(todos));
}

app.get('/todos', (req, res) => {
    res.json(readTodos());
});

app.post('/todos', (req, res) => {
    const todos = readTodos();
    const newTodo = { id: Date.now(), task: req.body.task };
    todos.push(newTodo);
    writeTodos(todos);
    res.json(newTodo);
});

app.delete('/todos/:id', (req, res) => {
    const todos = readTodos();
    const newTodos = todos.filter(todo => todo.id !== parseInt(req.params.id));
    writeTodos(newTodos);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
