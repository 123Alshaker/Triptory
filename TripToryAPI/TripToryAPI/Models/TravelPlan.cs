using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("travel_plans")]
    public class TravelPlan
    {
        [Key]
        public int plan_id { get; set; }

        public string title { get; set; }

        public string destination { get; set; }

        public decimal total_price { get; set; }

        public string status { get; set; }

        public int user_id { get; set; }
    }
}