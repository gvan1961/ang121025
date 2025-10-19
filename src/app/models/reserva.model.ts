
export enum StatusReserva {
  ATIVA = 'ATIVA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA'
}

export enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  TRANSFERENCIA_BANCARIA = 'TRANSFERENCIA_BANCARIA',
  FATURADO = 'FATURADO'
}

export interface ExtratoReserva {
  id: number;
  reservaId: number;
  dataHoraLancamento: string;
  statusLancamento: 'PRODUTO' | 'DIARIA' | 'PAGAMENTO' | 'ESTORNO';
  quantidade?: number;
  valorUnitario?: number;
  totalLancamento: number;
  descricao: string;
  notaVendaId?: number;
}

export interface HistoricoHospede {
  id: number;
  reservaId: number;
  dataHora: string;
  quantidadeAnterior: number;
  quantidadeNova: number;
  motivo: string;
}

export interface Reserva {
  id?: number;
  apartamentoId: number;
  apartamento?: any;
  clienteId: number;
  cliente?: any;
  quantidadeHospede: number;
  diariaId?: number;
  diaria?: any;
  dataCheckin: string;
  dataCheckout: string;
  quantidadeDiaria?: number;
  totalDiaria?: number;
  totalProduto?: number;
  totalHospedagem?: number;
  totalRecebido?: number;
  desconto?: number;
  totalApagar?: number;
  status?: StatusReserva;
  extratos?: ExtratoReserva[];
  historicos?: HistoricoHospede[];
  notasVenda?: any[];
}

export interface ReservaRequest {
  apartamentoId: number;
  clienteId: number;
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
}

export interface ReservaResponse {
  id: number;
  apartamentoId: number;
  apartamento: any;
  clienteId: number;
  cliente: any;
  quantidadeHospede: number;
  diariaId: number;
  diaria: any;
  dataCheckin: string;
  dataCheckout: string;
  quantidadeDiaria: number;
  totalDiaria: number;
  totalProduto: number;
  totalHospedagem: number;
  totalRecebido: number;
  desconto: number;
  totalApagar: number;
  status: StatusReserva;
  extratos?: ExtratoReserva[];
  historicos?: HistoricoHospede[];
  notasVenda?: any[];
}

export interface PagamentoRequest {
  reservaId: number;
  valor: number;
  formaPagamento: FormaPagamento;
  observacao?: string;
}