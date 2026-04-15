using System.Text;
using System.Text.Json;
using Faturamento.API.Models;

namespace Faturamento.API.Services
{
    public class GroqService{
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GroqService(HttpClient httpClient, IConfiguration configuration){
            _httpClient = httpClient;
            _apiKey = configuration["Groq:ApiKey"]!;
        }

        public async Task<string> GerarResumoNotaAsync(NotaFiscal nota){
            var valorTotal = nota.Itens.Sum(i => i.Quantidade * i.PrecoUnitario);
            var promt = $@"Analise esta nota fiscal e gere um resumo técnico em português:
                - Nota Fiscal #{nota.NumeroSequencial}
                - Cliente: {nota.NomeCliente}
                - Data: {nota.DataEmissao:dd/MM/yyyy}
                - Valor Total da NF: R$ {valorTotal:F2}
                - Itens: {string.Join(" | ", nota.Itens.Select(i => $"Produto ID {i.ProdutoId} (qtd: {i.Quantidade}, total do item: R$ {i.Quantidade * i.PrecoUnitario:F2})"))}
                Seja objetivo, 3 linhas no máximo indicando também o valor total.";

                var payload = new
                {
                    model = "llama-3.3-70b-versatile",
                    messages =new[] { new { role = "user", content = promt} }
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
                request.Headers.Add("Authorization", $"Bearer {_apiKey}");
                request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                var json = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(json);
                return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "Erro ao gerar resumo.";
        }
    }
}