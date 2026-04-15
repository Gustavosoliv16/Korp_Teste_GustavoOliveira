using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Faturamento.API.Migrations
{
    /// <inheritdoc />
    public partial class AddResumoIA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResumoIA",
                table: "NotasFiscais",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResumoIA",
                table: "NotasFiscais");
        }
    }
}
