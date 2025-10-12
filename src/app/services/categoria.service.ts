import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CategoriaRequest } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/categorias';

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(categoria: CategoriaRequest): Observable<Categoria> {
    console.log('📤 Criando categoria:', JSON.stringify(categoria, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<Categoria>(this.apiUrl, categoria, { headers });
  }

  update(id: number, categoria: CategoriaRequest): Observable<Categoria> {
    console.log('📤 Atualizando categoria:', id, JSON.stringify(categoria, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria, { headers });
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deletando categoria:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}