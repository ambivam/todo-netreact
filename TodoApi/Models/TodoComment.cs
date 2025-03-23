using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TodoApi.Models;

public class TodoComment
{
    public int Id { get; set; }

    [Required]
    public string Content { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public int TodoId { get; set; }

    [JsonIgnore]
    public Todo Todo { get; set; }
} 