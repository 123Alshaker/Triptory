using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("recommendation")]
    public class Recommendation
    {
        [Key]
        public int recomm_id { get; set; }

        public int score { get; set; }

        public int plan_id { get; set; }

        public int user_id { get; set; }
    }
}