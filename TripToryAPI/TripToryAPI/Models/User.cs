using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TripToryAPI.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        public int user_id { get; set; }

        public string name { get; set; }

        public string email { get; set; }

        public string password { get; set; }
    }
}