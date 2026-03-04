using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TripToryAPI.Data;
using TripToryAPI.Models;

namespace TripToryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TravelPlansController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TravelPlansController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Create new travel plan
        [HttpPost]
        public IActionResult CreatePlan(TravelPlan plan)
        {
            _context.TravelPlans.Add(plan);
            _context.SaveChanges();

            return Ok(plan);
        }

        // 🔹 Get all travel plans
        [HttpGet]
        public IActionResult GetAllPlans()
        {
            var plans = _context.TravelPlans.ToList();
            return Ok(plans);
        }

        // 🔹 Get plan by ID
        [HttpGet("{id}")]
        public IActionResult GetPlan(int id)
        {
            var plan = _context.TravelPlans
                .FirstOrDefault(p => p.plan_id == id);

            if (plan == null)
                return NotFound();

            return Ok(plan);
        }

        // 🔹 Delete plan
        [HttpDelete("{id}")]
        public IActionResult DeletePlan(int id)
        {
            var plan = _context.TravelPlans.Find(id);

            if (plan == null)
                return NotFound();

            _context.TravelPlans.Remove(plan);
            _context.SaveChanges();

            return Ok("Plan deleted successfully");
        }
    }
}