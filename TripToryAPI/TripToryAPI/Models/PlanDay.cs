using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("plan_days")]
    public class PlanDay
    {
        [Key]
        public int day_id { get; set; }

        public int day_number { get; set; }

        public int plan_id { get; set; }
    }
}