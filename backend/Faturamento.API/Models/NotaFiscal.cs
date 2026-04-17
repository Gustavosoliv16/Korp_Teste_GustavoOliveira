using System.ComponentModel.DataAnnotations;

namespace Faturamento.API.Models
{
    public enum StatusNota { Aberta, Fechada }

    public class NotaFiscal
    {
        [Key]
        public int Id { get; set; }

        public int NumeroSequencial { get; set; }

        [Required]
        public string NomeCliente { get; set; } = string.Empty;

        [Required]
        public string CpfCnpjCliente { get; set; } = string.Empty;

        public StatusNota Status { get; set; } = StatusNota.Aberta;

        public DateTime DataEmissao { get; set; } = DateTime.UtcNow;

        public List<ItemNota> Itens { get; set; } = new();

        public string? ResumoIA {get; set;}
        public string? IdempotencyKey { get; set; }
    }
}