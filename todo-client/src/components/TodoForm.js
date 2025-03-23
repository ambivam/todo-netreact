import React, { useState } from 'react';
import './TodoForm.css';

// Priority enum mapping
const Priority = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3
};

// RecurrenceType enum mapping
const RecurrenceType = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
  Yearly: 3
};

function TodoForm({ onSubmit, categories, onDeleteCategory, onAddCategory }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('1');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('Daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCategory = newCategory.trim() || category;
    onSubmit({
      title,
      description,
      priority: Number(priority),
      category: selectedCategory,
      isCompleted: false,
      createdDate: new Date().toISOString(),
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : null,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      comments: []
    });
    setTitle('');
    setDescription('');
    setPriority('1');
    setCategory('');
    setNewCategory('');
    setIsRecurring(false);
    setRecurrenceType('Daily');
    setRecurrenceInterval(1);
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      onAddCategory(trimmedCategory);
      setCategory(trimmedCategory);
      setNewCategory('');
      setIsEditingCategory(false);
    }
  };

  const handleEditCategory = (categoryToEdit) => {
    setEditingCategory(categoryToEdit);
    setNewCategory(categoryToEdit);
    setIsEditingCategory(true);
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
      onDeleteCategory(categoryToDelete);
      if (category === categoryToDelete) {
        setCategory('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title"
          required
        />
      </div>

      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter todo description"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Priority:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
            <option value="3">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group category-management">
        <h3>Categories</h3>
        <div className="new-category-input">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category"
          />
          {isEditingCategory ? (
            <button type="button" onClick={handleAddCategory}>Update Category</button>
          ) : (
            <button type="button" onClick={handleAddCategory}>Add Category</button>
          )}
        </div>
        <div className="category-list">
          {categories.map(cat => (
            <div key={cat} className="category-item">
              <span className="category-name">{cat}</span>
              <div className="category-buttons">
                <button 
                  type="button" 
                  onClick={() => handleEditCategory(cat)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDeleteCategory(cat)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          Recurring Task
        </label>
      </div>

      {isRecurring && (
        <div className="form-row">
          <div className="form-group">
            <label>Repeat:</label>
            <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Interval:</label>
            <input
              type="number"
              min="1"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      <button type="submit">Add Todo</button>
    </form>
  );
}

export default TodoForm; 