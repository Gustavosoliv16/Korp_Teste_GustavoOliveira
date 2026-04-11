using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Faturamento.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFaturamentoSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CpfCnpjCliente",
                table: "NotasFiscais",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataEmissao",
                table: "NotasFiscais",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "NomeCliente",
                table: "NotasFiscais",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "PrecoUnitario",
                table: "ItensNota",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CpfCnpjCliente",
                table: "NotasFiscais");

            migrationBuilder.DropColumn(
                name: "DataEmissao",
                table: "NotasFiscais");

            migrationBuilder.DropColumn(
                name: "NomeCliente",
                table: "NotasFiscais");

            migrationBuilder.DropColumn(
                name: "PrecoUnitario",
                table: "ItensNota");
        }
    }
}
