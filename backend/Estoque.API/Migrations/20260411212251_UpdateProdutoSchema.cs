using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Estoque.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProdutoSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Saldo",
                table: "Produtos",
                newName: "QuantidadeEstoque");

            migrationBuilder.RenameColumn(
                name: "Codigo",
                table: "Produtos",
                newName: "Nome");

            migrationBuilder.AddColumn<decimal>(
                name: "Preco",
                table: "Produtos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Preco",
                table: "Produtos");

            migrationBuilder.RenameColumn(
                name: "QuantidadeEstoque",
                table: "Produtos",
                newName: "Saldo");

            migrationBuilder.RenameColumn(
                name: "Nome",
                table: "Produtos",
                newName: "Codigo");
        }
    }
}
