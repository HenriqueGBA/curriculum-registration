using Microsoft.AspNetCore.Mvc;

namespace CurriculumRegistration.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            message = "Curriculum Registration API está funcionando."
        });
    }
}