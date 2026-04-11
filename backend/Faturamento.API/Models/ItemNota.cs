using System.ComponentModel.DataAnnotations;

namespace Faturamento.API.Models
{
    public class ItemNota
    {
        [Key]
        public int Id { get; set; }
        
        public int NotaFiscalId { get; set; }
        
        public int ProdutoId { get; set; } 
        
        public int Quantidade { get; set; }
    }
}
