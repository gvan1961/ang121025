import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apartamento, ApartamentoRequest } from '../models/apartamento.model';
import { StatusApartamento } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class ApartamentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/apartamentos';

  getAll(): Observable<Apartamento[]> {
    return this.http.get<Apartamento[]>(this.apiUrl);
  }

  getById(id: number): Observable<Apartamento> {
    return this.http.get<Apartamento>(`${this.apiUrl}/${id}`);
  }

  getDisponiveis(): Observable<Apartamento[]> {
    return this.http.get<Apartamento[]>(`${this.apiUrl}/disponiveis`);
  }

  create(apartamento: ApartamentoRequest): Observable<Apartamento> {
    console.log('📤 Criando apartamento:', JSON.stringify(apartamento, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<Apartamento>(this.apiUrl, apartamento, { headers });
  }

  update(id: number, apartamento: ApartamentoRequest): Observable<Apartamento> {
    console.log('📤 Atualizando apartamento:', id, JSON.stringify(apartamento, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put<Apartamento>(`${this.apiUrl}/${id}`, apartamento, { headers });
  }

  atualizarStatus(id: number, status: StatusApartamento): Observable<Apartamento> {
    console.log('🔄 Atualizando status:', id, status);
    return this.http.patch<Apartamento>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deletando apartamento:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}