using System.ComponentModel.DataAnnotations;

namespace Estoque.API.Models
{
    public class Produto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty;

        public string Descricao { get; set; } = string.Empty;

        [Required]
        public decimal Preco { get; set; }

        [Required]
        public int QuantidadeEstoque { get; set; }

        [Timestamp]
        public byte[]? Version { get; set; }
    }
}