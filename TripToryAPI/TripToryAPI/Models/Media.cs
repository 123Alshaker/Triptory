using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("media")]
    public class Media
    {
        [Key]
        public int media_id { get; set; }

        public string file_path { get; set; }

        public string type { get; set; }

        public int plan_id { get; set; }
    }
}