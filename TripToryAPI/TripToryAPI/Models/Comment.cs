using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("comments")]
    public class Comment
    {
        [Key]
        public int comment_id { get; set; }

        public string content { get; set; }

        public DateTime created_at { get; set; }

        public int user_id { get; set; }

        public int plan_id { get; set; }
    }
}