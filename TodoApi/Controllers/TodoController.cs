using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly TodoContext _context;
        private const int PageSize = 10;

        public TodoController(TodoContext context)
        {
            _context = context;
        }

        // GET: api/Todo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Todo>>> GetTodos(
            [FromQuery] int page = 1,
            [FromQuery] string search = "",
            [FromQuery] string category = "",
            [FromQuery] Priority? priority = null,
            [FromQuery] bool? isCompleted = null)
        {
            var query = _context.Todos
                .Include(t => t.Comments)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => 
                    t.Title.Contains(search) || 
                    t.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(t => t.Category == category);
            }

            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == priority.Value);
            }

            if (isCompleted.HasValue)
            {
                query = query.Where(t => t.IsCompleted == isCompleted.Value);
            }

            // Apply pagination
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)PageSize);

            var todos = await query
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.NextDueDate)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalItems.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());

            return todos;
        }

        // GET: api/Todo/Categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _context.Todos
                .Select(t => t.Category)
                .Distinct()
                .Where(c => !string.IsNullOrEmpty(c))
                .ToListAsync();

            // Return default categories if none exist
            if (!categories.Any())
            {
                categories = new List<string> { "Personal", "Work", "Shopping", "Health" };
            }

            return categories;
        }

        // GET: api/Todo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Todo>> GetTodo(int id)
        {
            var todo = await _context.Todos
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (todo == null)
            {
                return NotFound();
            }

            return todo;
        }

        // POST: api/Todo
        [HttpPost]
        public async Task<ActionResult<Todo>> CreateTodo(Todo todo)
        {
            if (todo == null)
            {
                return BadRequest("Todo cannot be null");
            }

            if (string.IsNullOrWhiteSpace(todo.Title))
            {
                return BadRequest("Title is required");
            }

            // Set default values
            todo.CreatedDate = DateTime.UtcNow;
            todo.IsCompleted = false;
            
            // Handle null values
            todo.Description = todo.Description ?? string.Empty;
            todo.Category = todo.Category ?? string.Empty;
            todo.Priority = todo.Priority == 0 ? Priority.Medium : todo.Priority;

            // Handle recurrence
            if (todo.RecurrenceType.HasValue && todo.RecurrenceInterval.HasValue && todo.RecurrenceInterval.Value > 0)
            {
                todo.NextDueDate = CalculateNextDueDate(todo.CreatedDate, todo.RecurrenceType.Value, todo.RecurrenceInterval.Value);
            }

            try
            {
                _context.Todos.Add(todo);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetTodo), new { id = todo.Id }, todo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the todo item");
            }
        }

        // POST: api/Todo/5/comments
        [HttpPost("{id}/comments")]
        public async Task<ActionResult<TodoComment>> AddComment(int id, [FromBody] string content)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            var comment = new TodoComment
            {
                TodoId = id,
                Content = content,
                CreatedDate = DateTime.UtcNow
            };

            _context.TodoComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        // PUT: api/Todo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodo(int id, Todo todo)
        {
            if (id != todo.Id)
            {
                return BadRequest();
            }

            var existingTodo = await _context.Todos.FindAsync(id);
            if (existingTodo == null)
            {
                return NotFound();
            }

            // Update recurring task due date if completed
            if (!existingTodo.IsCompleted && todo.IsCompleted && todo.RecurrenceType.HasValue)
            {
                todo.LastCompletedDate = DateTime.UtcNow;
                todo.NextDueDate = CalculateNextDueDate(DateTime.UtcNow, todo.RecurrenceType.Value, todo.RecurrenceInterval ?? 1);
                todo.IsCompleted = false; // Reset completion for recurring tasks
            }

            _context.Entry(existingTodo).CurrentValues.SetValues(todo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Todo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Todo/import
        [HttpPost("import")]
        public async Task<ActionResult<IEnumerable<Todo>>> ImportTodos([FromBody] List<Todo> todos)
        {
            foreach (var todo in todos)
            {
                todo.Id = 0; // Reset ID for new entries
                todo.CreatedDate = DateTime.UtcNow;
                _context.Todos.Add(todo);
            }

            await _context.SaveChangesAsync();
            return Ok(todos);
        }

        // GET: api/Todo/export
        [HttpGet("export")]
        public async Task<ActionResult<IEnumerable<Todo>>> ExportTodos()
        {
            var todos = await _context.Todos
                .Include(t => t.Comments)
                .ToListAsync();

            return Ok(todos);
        }

        private DateTime CalculateNextDueDate(DateTime fromDate, RecurrenceType recurrenceType, int interval)
        {
            return recurrenceType switch
            {
                RecurrenceType.Daily => fromDate.AddDays(interval),
                RecurrenceType.Weekly => fromDate.AddDays(interval * 7),
                RecurrenceType.Monthly => fromDate.AddMonths(interval),
                RecurrenceType.Yearly => fromDate.AddYears(interval),
                _ => fromDate
            };
        }
    }
} 