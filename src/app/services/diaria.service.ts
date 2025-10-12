import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diaria, DiariaRequest } from '../models/diaria.model';

@Injectable({
  providedIn: 'root'
})
export class DiariaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/diarias';

  getAll(): Observable<Diaria[]> {
    return this.http.get<Diaria[]>(this.apiUrl);
  }

  getById(id: number): Observable<Diaria> {
    return this.http.get<Diaria>(`${this.apiUrl}/${id}`);
  }

  getByTipo(tipoId: number): Observable<Diaria[]> {
    return this.http.get<Diaria[]>(`${this.apiUrl}/tipo/${tipoId}`);
  }

  create(diaria: DiariaRequest): Observable<Diaria> {
    console.log('📤 Criando diária:', JSON.stringify(diaria, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<Diaria>(this.apiUrl, diaria, { headers });
  }

  update(id: number, diaria: DiariaRequest): Observable<Diaria> {
    console.log('📤 Atualizando diária:', id, JSON.stringify(diaria, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put<Diaria>(`${this.apiUrl}/${id}`, diaria, { headers });
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deletando diária:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}