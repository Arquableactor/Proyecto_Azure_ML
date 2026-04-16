using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace ApiReciclaje.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClasificacionController : ControllerBase
    {
        private readonly string predictionKey = "TU_PREDICTION_KEY_AQUI";

        private readonly string endpoint = "https://cvreciclage-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/d3697fbb-8de8-4bfe-8ee9-92b6406fb242/classify/iterations/modelo-reciclaje/image";

        // ✅ MÉTODO GET PARA PROBAR EN NAVEGADOR
        [HttpGet]
        public IActionResult Test()
        {
            return Ok("API funcionando correctamente 🚀");
        }

        // ✅ MÉTODO POST (TU IA)
        [HttpPost]
        public async Task<IActionResult> ClasificarImagen([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No se envió imagen");

                Console.WriteLine("✔ Imagen recibida");

                using var client = new HttpClient();

                client.DefaultRequestHeaders.Clear();
                client.DefaultRequestHeaders.Add("Prediction-Key", predictionKey);

                using var stream = file.OpenReadStream();
                using var content = new StreamContent(stream);

                content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

                var response = await client.PostAsync(endpoint, content);

                var result = await response.Content.ReadAsStringAsync();

                Console.WriteLine("🔁 Respuesta Azure: " + result);

                return StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}