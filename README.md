# Sistema de Emissão de Notas Fiscais 🧾

Um sistema de faturamento construído sob uma Arquitetura de Microsserviços, projetado para simular cenários reais de engenharia de software incluindo resiliência a falhas, controle de concorrência e integraçõescom Inteligência Artificial.

---

## 🚀 Tecnologias e Tecnologias Utilizadas

Este projeto foi construído como demonstração fullstack, abrangendo tecnologias modernas tanto no back-end quanto no front-end:

### Back-end (APIs)
- **C# / .NET 8:** Construção de APIs em formato Minimal/Controller Web API.
- **Entity Framework Core (EF Core):** Mapeamento Objeto-Relacional (ORM).
- **PostgreSQL (Neon):** Banco de dados relacional na nuvem.
- **LINQ:** Para consultas, agregações e formatação de dados em memória.
- **Groq API (Llama 3.3):** Geração dinâmica de resumos de faturamento via IA Generativa em tempo real.

### Front-end (UI)
- **Angular 18:** Framework SPA suportado por reatividade moderna através de *Signals*.
- **RxJS:** Tratamento de requisições assíncronas (Observables) e interceptação de erros HTTP.
- **Tailwind CSS & ZardUI:** Para rápida prototipagem e estilização em componentes visualmente modernos.
- **Lucide Icons:** Biblioteca base de ícones limpos em formato SVG.

---

## 📦 Arquitetura

O sistema é dividido em dois serviços completamente desacoplados, que conversam entre si via requisições REST:

1. **Estoque.API**
   Responsável pelo cadastro de produtos e a sua respectiva rastreabilidade de saldo.
   
2. **Faturamento.API**
   Responsável pela gestão de notas fiscais, controlando emissão, o status dos pedidos e solicitando dedução de produtos à API de Estoque.

---

## ✨ Funcionalidades e Requisitos Técnicos Atendidos

### ✅ Funcionalidades Base
- **Cadastro Prévio de Produtos:** Registro com Código, Descrição e Saldo Inicial.
- **Módulo de Vendas (NFe):** Criação de pedidos referenciando produtos já existentes, gerando número sequencial na nota com o status inicial "Aberta".
- **Baixa via Impressão:** Ao dar Print (Imprimir) em uma nota "Aberta", ocorre a requisição de cancelamento de estoque e o status da nota avança para "Fechada".

### 🛡️ Tratamento de Falhas (Resilience)
O sistema sobrevive a quedas controladas. Se a `Faturamento.API` for chamada enquanto a `Estoque.API` estiver inoperante (Offline), em vez de uma quebra fatal, a rede de requisições ativa um Try/Catch. O pedido emite um Status HTTP 503 com `O serviço de estoque está indisponível no momento`, retendo os dados e evitando travamentos grosseiros na UI.
---

## ⚙️ Como rodar o projeto localmente

### 1. Iniciar os Microsserviços Back-end
Recomenda-se abrir dois terminais em paralelo (um para cada API):

**Terminal 1 (Estoque):**
```bash
cd backend/Estoque.API
dotnet run
```

**Terminal 2 (Faturamento):**
```bash
cd backend/Faturamento.API
dotnet run
```

### 2. Iniciar o Front-end Angular

**Terminal 3 (Front-end):**
```bash
cd frontend
# Caso não tenha as dependências, execute 'npm install' ou 'pnpm install'
pnpm run start
```
Após o build angular finalizar, acesse em seu navegador:  
`http://localhost:4200`
