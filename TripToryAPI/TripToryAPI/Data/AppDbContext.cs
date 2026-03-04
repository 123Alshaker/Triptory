using Microsoft.EntityFrameworkCore;
using TripToryAPI.Models;

namespace TripToryAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<TravelPlan> TravelPlans { get; set; }

        public DbSet<Comment> Comments { get; set; }

        public DbSet<Media> Media { get; set; }

        public DbSet<Recommendation> Recommendations { get; set; }
        public DbSet<PlanDay> PlanDays { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<SavedPlan> SavedPlans { get; set; }
    }
}