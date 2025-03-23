import React, { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';

function App() {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:5081/api/Todo';

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched todos:', data); // Debug log
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos. Please try again later.');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      console.log('Fetched categories:', data); // Debug log
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const addTodo = async (todo) => {
    try {
      setError(null);
      console.log('Sending todo data:', todo); // Debug log
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });

      const responseData = await response.text();
      console.log('Raw server response:', responseData); // Debug log

      if (!response.ok) {
        let errorMessage = 'Failed to add todo.';
        try {
          const errorData = JSON.parse(responseData);
          if (errorData.errors) {
            errorMessage = Object.entries(errorData.errors)
              .map(([key, value]) => `${key}: ${value.join(', ')}`)
              .join('; ');
          } else if (errorData.title) {
            errorMessage = errorData.title;
          }
        } catch (e) {
          errorMessage = responseData;
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
      }

      const data = JSON.parse(responseData);
      console.log('Parsed server response:', data); // Debug log
      setTodos([...todos, data]);
      
      // Update categories if a new category was added
      if (todo.category && !categories.includes(todo.category)) {
        setCategories([...categories, todo.category]);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error.message || 'Failed to add todo. Please try again.');
    }
  };

  const updateTodo = async (todo) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTodos(todos.map(t => t.id === todo.id ? todo : t));
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const addComment = async (todoId, content) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/${todoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      const responseData = await response.text();
      console.log('Raw comment response:', responseData);

      if (!response.ok) {
        let errorMessage = 'Failed to add comment.';
        try {
          const errorData = JSON.parse(responseData);
          if (errorData.errors) {
            errorMessage = Object.entries(errorData.errors)
              .map(([key, value]) => `${key}: ${value.join(', ')}`)
              .join('; ');
          } else if (errorData.title) {
            errorMessage = errorData.title;
          }
        } catch (e) {
          errorMessage = responseData;
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
      }

      const newComment = JSON.parse(responseData);
      console.log('Parsed comment response:', newComment);

      // Update the todos state with the new comment
      setTodos(todos.map(todo => 
        todo.id === todoId 
          ? { 
              ...todo, 
              comments: Array.isArray(todo.comments) ? [...todo.comments, newComment] : [newComment]
            }
          : todo
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Failed to add comment. Please try again.');
    }
  };

  const deleteCategory = async (categoryToDelete) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/categories/${encodeURIComponent(categoryToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the categories state by removing the deleted category
      setCategories(prevCategories => prevCategories.filter(cat => cat !== categoryToDelete));
      
      // Update todos to remove the deleted category
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.category === categoryToDelete 
            ? { ...todo, category: '' } 
            : todo
        )
      );
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again.');
    }
  };

  const addCategory = async (newCategory) => {
    try {
      setError(null);
      // Update categories state immediately for better UX
      setCategories(prevCategories => {
        if (!prevCategories.includes(newCategory)) {
          return [...prevCategories, newCategory];
        }
        return prevCategories;
      });

      // Update todos that might be using this category
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.category === '' 
            ? { ...todo, category: newCategory } 
            : todo
        )
      );
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
        <button onClick={toggleDarkMode} className="theme-toggle">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      <main>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <TodoForm 
          onSubmit={addTodo} 
          categories={categories}
          onDeleteCategory={deleteCategory}
          onAddCategory={addCategory}
        />
        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <TodoList
            todos={todos}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            onAddComment={addComment}
            categories={categories}
          />
        )}
      </main>
    </div>
  );
}

export default App;
