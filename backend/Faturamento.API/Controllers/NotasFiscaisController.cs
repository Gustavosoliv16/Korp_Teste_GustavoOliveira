using Faturamento.API.Data;
using Faturamento.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace Faturamento.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotasFiscaisController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;

        public NotasFiscaisController(AppDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri(configuration["ServiceUrls:EstoqueApi"]!);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaFiscal>>> GetNotas() =>
        await _context.NotasFiscais.Include(n => n.Itens).ToListAsync();

        [HttpPost]
        public async Task<ActionResult<NotaFiscal>> CriarNota(NotaFiscal nota) 
        {

            var ultimaNota = await _context.NotasFiscais.OrderByDescending(n => n.NumeroSequencial).FirstOrDefaultAsync();
            nota.NumeroSequencial = (ultimaNota?.NumeroSequencial ?? 0) + 1;
            nota.Status = StatusNota.Aberta;

            _context.NotasFiscais.Add(nota);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotas), new {id = nota.Id}, nota);
        }

         [HttpPost("{id}/imprimir")]
         public async Task<IActionResult> ImprimirNota(int id)
         {
            var nota = await _context.NotasFiscais.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id);

            if(nota == null) return NotFound();


            foreach (var item in nota.Itens)
            { try
            {
                var content = new StringContent(item.Quantidade.ToString(), Encoding.UTF8, "application/json");
                var response = await _httpClient.PatchAsync($"api/produtos/{item.ProdutoId}/atualizar-saldo", content);

                if (!response.IsSuccessStatusCode)
                { var error = await response.Content.ReadAsStringAsync();
                return BadRequest($"Falha no estoque para o produto {item.ProdutoId}: {error}");
                }
            }
            catch (Exception)
            {
                return StatusCode(503, "O serviço de estoque está indisponível no momento. Tente novamente mais tarde.");
            }
            }
            nota.Status = StatusNota.Fechada;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Nota impressa e fechada com sucesso!", nota});
         }
    }
}   
