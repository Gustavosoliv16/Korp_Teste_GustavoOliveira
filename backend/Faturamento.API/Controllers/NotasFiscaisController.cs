using Faturamento.API.Data;
using Faturamento.API.Models;
using Faturamento.API.Services;
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
        private readonly GroqService _groqService;

        public NotasFiscaisController(AppDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration, GroqService groqService)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient("EstoqueClient");
            _groqService = groqService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaFiscal>>> GetNotas() =>
            await _context.NotasFiscais.Include(n => n.Itens).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<NotaFiscal>> GetNota(int id)
        {
            var nota = await _context.NotasFiscais.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id);
            if (nota == null) return NotFound();
            return nota;
        }

        [HttpPost]
        public async Task<ActionResult<NotaFiscal>> CriarNota(NotaFiscal nota) 
        {
            var ultimaNota = await _context.NotasFiscais.OrderByDescending(n => n.NumeroSequencial).FirstOrDefaultAsync();
            nota.NumeroSequencial = (ultimaNota?.NumeroSequencial ?? 0) + 1;
            nota.Status = StatusNota.Aberta;
            nota.DataEmissao = DateTime.UtcNow;

            _context.NotasFiscais.Add(nota);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNota), new {id = nota.Id}, nota);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarNota(int id, NotaFiscal notaAtualizada)
        {
            var notaExistente = await _context.NotasFiscais.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id);
            
            if (notaExistente == null) return NotFound();
            if (notaExistente.Status == StatusNota.Fechada) return BadRequest("Não é possível editar uma nota já encerrada.");

            // Atualiza cabeçalho
            notaExistente.NomeCliente = notaAtualizada.NomeCliente;
            notaExistente.CpfCnpjCliente = notaAtualizada.CpfCnpjCliente;

            // Atualiza itens (Remove antigos e adiciona novos)
            _context.ItensNota.RemoveRange(notaExistente.Itens);
            notaExistente.Itens = notaAtualizada.Itens.Select(i => new ItemNota
            {
                ProdutoId = i.ProdutoId,
                NomeProduto = i.NomeProduto,
                Quantidade = i.Quantidade,
                PrecoUnitario = i.PrecoUnitario
            }).ToList();

            await _context.SaveChangesAsync();
            return NoContent();
        }

         [HttpPost("{id}/imprimir")]
         public async Task<IActionResult> ImprimirNota(int id, [FromHeader(Name = "X-Idempotency-Key")] string? idempotencyKey)
         {
            var nota = await _context.NotasFiscais.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id);

            if(nota == null) return NotFound();

            if (nota.Status == StatusNota.Fechada && !string.IsNullOrEmpty(idempotencyKey) && nota.IdempotencyKey == idempotencyKey)
            {
                return Ok(new { message = "Operação já realizada (Idempotência ativa).", nota});
            }

            foreach (var item in nota.Itens)
            { try
            {
                var content = new StringContent(item.Quantidade.ToString(), Encoding.UTF8, "application/json");
                var response = await _httpClient.PatchAsync($"api/produtos/{item.ProdutoId}/atualizar-saldo", content);

                if (!response.IsSuccessStatusCode)
            {
                var errorJson = await response.Content.ReadAsStringAsync();
                
                // Tenta extrair apenas o texto da mensagem se for um JSON
                string errorMsg;
                try {
                    using var doc = JsonDocument.Parse(errorJson);
                    errorMsg = doc.RootElement.TryGetProperty("message", out var msgElement) 
                        ? msgElement.GetString() ?? errorJson 
                        : errorJson;
                } catch {
                    errorMsg = errorJson;
                }

                return BadRequest($"Falha no estoque ({item.NomeProduto}): {errorMsg}");
            }    }
            catch (Exception)
            {
                return StatusCode(503, "O serviço de estoque está indisponível no momento. Tente novamente mais tarde.");
            }
            }
            nota.Status = StatusNota.Fechada;
            nota.IdempotencyKey = idempotencyKey;
            nota.ResumoIA = await _groqService.GerarResumoNotaAsync(nota);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Nota impressa e fechada com sucesso!", nota});
         }
    }
}   
