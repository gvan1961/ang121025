import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagamentoRequestDTO {
  reservaId: number;
  valor: number;
  formaPagamento: string;
  observacao?: string;
}

export interface PagamentoResponse {
  id: number;
  reservaId: number;
  valor: number;
  formaPagamento: string;
  observacao?: string;
  dataPagamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pagamentos';

  processarPagamento(dto: PagamentoRequestDTO): Observable<PagamentoResponse> {
    console.log('💳 Processando pagamento:', dto);
    return this.http.post<PagamentoResponse>(this.apiUrl, dto);
  }

  listarPorReserva(reservaId: number): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/reserva/${reservaId}`);
  }
}