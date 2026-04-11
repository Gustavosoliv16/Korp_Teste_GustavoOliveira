using System.ComponentModel.DataAnnotations;

namespace Faturamento.API.Models
{
    public enum StatusNota {Aberta, Fechada}

    public class NotaFiscal
    {
        [Key]
        public int Id { get; set;}

        public int NumeroSequencial { get; set;}

        public StatusNota Status { get; set; } = StatusNota.Aberta;

        public List<ItemNota> Itens { get; set;} = new();
    }
}