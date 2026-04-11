export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidadeEstoque: number;
}

export interface ItemNota {
  produtoId: number;
  nomeProduto?: string;
  quantidade: number;
  precoUnitario: number;
}

export interface NotaFiscal {
  id: number;
  numeroSequencial: number;
  nomeCliente: string;
  cpfCnpjCliente: string;
  status: 'Aberta' | 'Fechada';
  dataEmissao: string;
  itens: ItemNota[];
  valorTotal?: number;
}

export interface CreateNotaFiscalDto {
  nomeCliente: string;
  cpfCnpjCliente: string;
  itens: { produtoId: number; quantidade: number; precoUnitario: number }[];
}

export interface CreateProdutoDto {
  nome: string;
  descricao: string;
  preco: number;
  quantidadeEstoque: number;
}

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  exiting?: boolean;
}
