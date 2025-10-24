export interface Produto {
  id?: number;
  nomeProduto: string;
  quantidade: number;
  valorVenda: number;
  valorCompra: number;
  categoriaId?: number;
  categoria?: any;
}

export interface ProdutoRequest {
  nomeProduto: string;
  quantidade: number;
  valorVenda: number;
  valorCompra: number;
  categoriaId?: number;
}

