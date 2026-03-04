using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("saved_plans")]
    public class SavedPlan
    {
        [Key]
        public int saved_id { get; set; }

        public int user_id { get; set; }

        public int plan_id { get; set; }
    }
}