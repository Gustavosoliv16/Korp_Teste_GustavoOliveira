using System.ComponentModel.DataAnnotations;

namespace Faturamento.API.Models
{
    public class ItemNota
    {
        [Key]
        public int Id { get; set; }
        
        public int NotaFiscalId { get; set; }
        
        [Required]
        public int ProdutoId { get; set; } 
        
        [Required]
        public int Quantidade { get; set; }

        [Required]
        public decimal PrecoUnitario { get; set; }
    }
}
