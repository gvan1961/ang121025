import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApartamentoService } from '../../services/apartamento.service';
import { Apartamento } from '../../models/apartamento.model';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-apartamento-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  
  template: `
   
   <div class="header">
  <h1>🏨 Apartamentos</h1>
  <div class="header-actions">
    <button class="btn-limpeza" (click)="abrirLimpeza()">
      🧹 Gestão de Limpeza
    </button>
    <button class="btn-novo" (click)="novoApartamento()">
      ➕ Novo Apartamento
    </button>
  </div>
  </div>

      <div class="acoes-topo">
         <button class="btn-gestao" routerLink="/apartamentos/gestao">
        🔧 Gestão de Status
       </button>
     </div>

     <div class="card" routerLink="/apartamentos/gestao">
       <div class="card-icon">🔧</div>
         <h3>Gestão de Status</h3>
         <p>Liberar limpeza, manutenção e bloqueios</p>
    </div>

      
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Buscar apartamento..."
          [(ngModel)]="filtro"
          (input)="filtrar()"
        />
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && apartamentosFiltrados.length === 0" class="empty">
        Nenhum apartamento encontrado
      </div>

      <div class="table-container" *ngIf="!loading && apartamentosFiltrados.length > 0">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Capacidade</th>
              <th>Camas</th>
              <th>TV</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let apt of apartamentosFiltrados">
              <td><strong>{{ apt.numeroApartamento }}</strong></td>
              <td>{{ apt.tipoApartamentoNome }} - {{ apt.tipoApartamentoDescricao }}</td>
              <td>{{ apt.capacidade }} hóspedes</td>
              <td>{{ apt.camasDoApartamento }}</td>
              <td>{{ apt.tv || 'Sem TV' }}</td>
              <td><span [class]="'status-badge status-' + apt.status?.toLowerCase()">{{ apt.status }}</span></td>
              <td>
                <button class="btn-edit" (click)="editar(apt.id!)">Editar</button>
                <button class="btn-status" (click)="alterarStatus(apt)">Status</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin: 0;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .search-box {
      margin-bottom: 20px;
    }

    .search-box input {
      width: 100%;
      max-width: 400px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .loading, .empty {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-disponivel {
      background: #d4edda;
      color: #155724;
    }

    .status-ocupado {
      background: #f8d7da;
      color: #721c24;
    }

    .status-limpeza {
      background: #fff3cd;
      color: #856404;
    }

    .btn-edit, .btn-status {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-right: 5px;
    }

    .btn-edit {
      background: #28a745;
      color: white;
    }

    .btn-edit:hover {
      background: #218838;
    }

    .btn-status {
      background: #17a2b8;
      color: white;
    }

    .btn-status:hover {
      background: #138496;
    }

    .acoes-topo {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.btn-gestao {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-gestao:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

  `]
})
export class ApartamentoListaApp implements OnInit {
  private apartamentoService = inject(ApartamentoService);
  private router = inject(Router);

  apartamentos: Apartamento[] = [];
  apartamentosFiltrados: Apartamento[] = [];
  filtro = '';
  loading = true;

  ngOnInit(): void {
    this.carregarApartamentos();
  }

  carregarApartamentos(): void {
    this.apartamentoService.getAll().subscribe({
      next: (data) => {
        this.apartamentos = data;
        this.apartamentosFiltrados = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar apartamentos', err);
        this.loading = false;
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase();
    this.apartamentosFiltrados = this.apartamentos.filter(a =>
      a.numeroApartamento.toLowerCase().includes(termo) ||
      a.tipoApartamento.tipoApartamentoNome?.toLowerCase().includes(termo) ||
      a.camasDoApartamento.toLowerCase().includes(termo)
    );
  }

  novo(): void {
    this.router.navigate(['/apartamentos/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/apartamentos/editar', id]);
  }

  alterarStatus(apartamento: Apartamento): void {
    // Implementar modal ou página para alterar status
    console.log('Alterar status:', apartamento);
  } 

 // ✅ ADICIONAR ESTE MÉTODO
  novoApartamento(): void {
    this.router.navigate(['/apartamentos/novo']);
  }

  // ✅ ADICIONAR ESTE MÉTODO TAMBÉM
  abrirLimpeza(): void {
    this.router.navigate(['/apartamentos/limpeza']);
  }
 

}