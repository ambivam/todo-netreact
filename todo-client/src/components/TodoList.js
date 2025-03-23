import React from 'react';

function TodoList({ todos, onUpdate, onDelete }) {
  const toggleComplete = (todo) => {
    onUpdate({
      ...todo,
      isCompleted: !todo.isCompleted,
    });
  };

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <div key={todo.id} className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
          <div className="todo-content">
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() => toggleComplete(todo)}
            />
            <div className="todo-text">
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
              <small>Created: {new Date(todo.createdDate).toLocaleString()}</small>
            </div>
          </div>
          <button
            className="delete-button"
            onClick={() => onDelete(todo.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default TodoList; 