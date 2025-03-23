using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class Todo
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime CreatedDate { get; set; }

        // Task Prioritization
        public Priority Priority { get; set; }

        // Task Categories
        public string Category { get; set; }

        // Task Comments
        public virtual ICollection<TodoComment> Comments { get; set; } = new List<TodoComment>();

        // Recurring Tasks
        public RecurrenceType? RecurrenceType { get; set; }
        public int? RecurrenceInterval { get; set; }
        public DateTime? NextDueDate { get; set; }
        public DateTime? LastCompletedDate { get; set; }
    }

    public enum Priority
    {
        Low,
        Medium,
        High
    }

    public enum RecurrenceType
    {
        Daily,
        Weekly,
        Monthly,
        Yearly
    }
} 