using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using TripToryAPI.Data;
using TripToryAPI.Models;

namespace TripToryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // Register
        [HttpPost("register")]
        public IActionResult Register(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(user);
        }

        // Get all users
        [HttpGet]
        public IActionResult GetUsers()
        {
            return Ok(_context.Users.ToList());
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.email == loginDto.Email
                                       && u.password == loginDto.Password);

            if (user == null)
                return Unauthorized("Invalid email or password");

            return Ok(user);
        }
    }
}