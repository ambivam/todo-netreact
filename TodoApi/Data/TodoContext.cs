using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data
{
    public class TodoContext : DbContext
    {
        public TodoContext(DbContextOptions<TodoContext> options)
            : base(options)
        {
        }

        public DbSet<Todo> Todos { get; set; }
        public DbSet<TodoComment> TodoComments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Todo>()
                .HasMany(t => t.Comments)
                .WithOne(c => c.Todo)
                .HasForeignKey(c => c.TodoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Todo>()
                .Property(t => t.Priority)
                .HasDefaultValue(Priority.Medium);
        }
    }
} 