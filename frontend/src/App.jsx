import { useState, useEffect} from 'react';

const API = "http://localhost:8000"

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await fetch(`${API}/todos`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        setTodos(await res.json());
      } catch (err) {
        setError("Could not load tasks. Is the server running?");
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

const addTodo = async (e) => {
  e.preventDefault();
  if (!title.trim()) return;

  try {
    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const created = await res.json();
    setTodos([...todos, created]);
    setTitle("");
    setError(null);
  } catch (err) {
    setError("Could not add the task. Is the server running?");
  }
};

const deleteTodo = async (id) => {
  const res = await fetch(`${API}/todos/${id}`, { method: "DELETE" });

  if (res.ok) {
    setTodos(todos.filter((t) => t.id !== id));
  }
};

const toggleTodo = async (todo) => {
  const res = await fetch(`${API}/todos/${todo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: !todo.done }),
  });

  if (res.ok) {
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
  }
};

const startEdit = (todo) => {
  setEditingId(todo.id);
  setEditTitle(todo.title);
};

const cancelEdit = () => {
  setEditingId(null);
};

const saveEdit = async (id) => {
  if (!editTitle.trim()) return;

  const res = await fetch(`${API}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: editTitle }),
  });

  if (res.ok) {
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
    setEditingId(null);
  }
};

  return ( 
    <div>
      <h1>To-Do List</h1>
      <form onSubmit={addTodo}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && todos.length === 0 && <p>No tasks yet.</p>}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
  {editingId === todo.id ? (
    <>
      <input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
      />
      <button onClick={() => saveEdit(todo.id)}>Save</button>
      <button onClick={cancelEdit}>Cancel</button>
    </>
  ) : (
    <>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleTodo(todo)}
      />
      <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
        {todo.title}
      </span>
      <button onClick={() => startEdit(todo)}>Edit</button>
      <button onClick={() => deleteTodo(todo.id)}>✕</button>
    </>
  )}
</li>))}
      </ul>
    </div>
  );
}