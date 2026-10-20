import { useState, useEffect} from 'react';

const API = "http://localhost:8000"

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(`${API}/todos`)
    .then((res) => res.json())
    .then((data) => setTodos(data));
  }, []);

  const addTodo = async (e) => {
  e.preventDefault();
  if (!title.trim()) return;

  const res = await fetch(`${API}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const created = await res.json();

  setTodos([...todos, created]);
  setTitle("");
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
      <ul>
        {todos.map((todo) => (<li key={todo.id}>{todo.title}</li>))}
      </ul>
    </div>
  );
}