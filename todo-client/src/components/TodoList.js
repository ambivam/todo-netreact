import React, { useState } from 'react';
import './TodoList.css';

function TodoList({ todos, onUpdate, onDelete, onAddComment, categories }) {
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleComplete = (todo) => {
    onUpdate({
      ...todo,
      isCompleted: !todo.isCompleted,
    });
  };

  const handleAddComment = (todoId) => {
    const trimmedComment = commentText.trim();
    if (trimmedComment) {
      onAddComment(todoId, trimmedComment);
      setCommentText('');
      setActiveCommentId(null);
    }
  };

  // Filter todos based on search and filters
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || todo.category === filterCategory;
    const matchesPriority = !filterPriority || todo.priority === Number(filterPriority);
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPriorityClass = (priority) => {
    switch (Number(priority)) {
      case 0: return 'priority-low';
      case 1: return 'priority-medium';
      case 2: return 'priority-high';
      case 3: return 'priority-urgent';
      default: return '';
    }
  };

  return (
    <div className="todo-list-container">
      <div className="filters">
        <input
          type="text"
          placeholder="Search todos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {Array.isArray(categories) && categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
          <option value="3">Urgent</option>
        </select>
      </div>

      <div className="todo-list">
        {paginatedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`todo-item ${todo.isCompleted ? 'completed' : ''} ${getPriorityClass(todo.priority)}`}
          >
            <div className="todo-content">
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => toggleComplete(todo)}
              />
              <div className="todo-text">
                <h3>{todo.title}</h3>
                <p>{todo.description}</p>
                <div className="todo-meta">
                  {todo.category && (
                    <span className="category-tag">{todo.category}</span>
                  )}
                  <span className={`priority-tag ${getPriorityClass(todo.priority)}`}>
                    {todo.priority}
                  </span>
                  {todo.recurrenceType && (
                    <span className="recurrence-tag">
                      {`Repeats ${todo.recurrenceType.toLowerCase()} (${todo.recurrenceInterval})`}
                    </span>
                  )}
                  <small>Created: {new Date(todo.createdDate).toLocaleString()}</small>
                  {todo.nextDueDate && (
                    <small>Next due: {new Date(todo.nextDueDate).toLocaleString()}</small>
                  )}
                </div>

                {/* Comments section */}
                <div className="comments-section">
                  {todo.comments && todo.comments.length > 0 && (
                    <div className="comments-list">
                      {todo.comments.map(comment => (
                        <div key={comment.id} className="comment">
                          <p>{comment.content}</p>
                          <small>{new Date(comment.createdDate).toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeCommentId === todo.id ? (
                    <div className="add-comment">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                      />
                      <button onClick={() => handleAddComment(todo.id)}>Add Comment</button>
                      <button onClick={() => setActiveCommentId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      className="btn-comment"
                      onClick={() => setActiveCommentId(todo.id)}
                    >
                      Add Comment
                    </button>
                  )}
                </div>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TodoList; 