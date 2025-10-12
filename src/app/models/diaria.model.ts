export interface Diaria {
  id?: number;
  tipoApartamentoId: number;
  tipoApartamento?: any;
  quantidade: number;
  valor: number;
}

export interface DiariaRequest {
  tipoApartamentoId: number;
  quantidade: number;
  valor: number;
}