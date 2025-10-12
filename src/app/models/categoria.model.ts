export interface Categoria {
  id?: number;
  nomeCategoria: string;
  descricao?: string;
}

export interface CategoriaRequest {
  nomeCategoria: string;
  descricao?: string;
}