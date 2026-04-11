using System.ComponentModel.DataAnnotations;

namespace Estoque.API.Models
{
    public class Produto
    {

    [Key]
    public int Id {get; set;}

    [Required]
    public string Codigo {get; set;} = string.Empty;

    [Required]
    public string Descricao {get; set;} = string.Empty;

    [Required]
    public int Saldo {  get; set; }

    [Timestamp]
    public byte[]? Version { get; set; }
    }
}   