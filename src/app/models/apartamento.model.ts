import { StatusApartamento } from './enums';

export interface Apartamento {
  id?: number;
  numeroApartamento: string;
  tipoApartamentoId: number;
  tipoApartamento?: any;
  capacidade: number;
  camasDoApartamento: number;
  tv?: boolean;
  status?: StatusApartamento;
}

export interface ApartamentoRequest {
  numeroApartamento: string;
  tipoApartamentoId: number;
  capacidade: number;
  camasDoApartamento: number;
  tv?: boolean;
}