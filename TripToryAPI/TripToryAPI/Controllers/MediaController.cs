using Microsoft.AspNetCore.Mvc;
using TripToryAPI.Data;
using TripToryAPI.Models;

namespace TripToryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public MediaController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // 🔹 Upload one or more images for a plan
        [HttpPost("upload")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Upload([FromForm] int plan_id, [FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files were uploaded.");

            var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsRoot);

            var saved = new List<Media>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var fullPath = Path.Combine(uploadsRoot, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var media = new Media
                {
                    file_path = $"/uploads/{fileName}",
                    type = "image",
                    plan_id = plan_id
                };

                _context.Media.Add(media);
                saved.Add(media);
            }

            await _context.SaveChangesAsync();

            return Ok(saved);
        }

        // 🔹 Get all media for a plan
        [HttpGet("plan/{planId}")]
        public IActionResult GetByPlan(int planId)
        {
            var media = _context.Media.Where(m => m.plan_id == planId).ToList();
            return Ok(media);
        }

        // 🔹 Delete a media item
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var media = _context.Media.Find(id);
            if (media == null)
                return NotFound();

            var fullPath = Path.Combine(_env.ContentRootPath, "wwwroot", media.file_path.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);

            _context.Media.Remove(media);
            _context.SaveChanges();

            return Ok("Media deleted successfully");
        }
    }
}
