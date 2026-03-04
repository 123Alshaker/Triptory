using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("activities")]
    public class Activity
    {
        [Key]
        public int activity_id { get; set; }

        public string title { get; set; }

        public string description { get; set; }

        public decimal price { get; set; }

        public int day_id { get; set; }
    }
}