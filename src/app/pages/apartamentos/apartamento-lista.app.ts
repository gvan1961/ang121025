import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApartamentoService } from '../../services/apartamento.service';
import { Apartamento } from '../../models/apartamento.model';
import { StatusApartamento } from '../../models/enums';

@Component({
  selector: 'app-apartamento-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Apartamentos</h1>
        <button class="btn-primary" (click)="novo()">+ Novo Apartamento</button>
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
              <td>{{ apt.numeroApartamento }}</td>
              <td>{{ apt.tipoApartamento?.tipo || '-' }}</td>
              <td>{{ apt.capacidade }}</td>
              <td>{{ apt.camasDoApartamento }}</td>
              <td>{{ apt.tv ? 'Sim' : 'Não' }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + apt.status?.toLowerCase()">
                  {{ formatarStatus(apt.status) }}
                </span>
              </td>
              <td>
                <button class="btn-edit" (click)="editar(apt.id!)">Editar</button>
                <button class="btn-delete" (click)="excluir(apt.id!)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
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
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
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

    .status-pre_reserva {
      background: #cce5ff;
      color: #004085;
    }

    .status-manutencao {
      background: #e2e3e5;
      color: #383d41;
    }

    .btn-edit, .btn-delete {
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

    .btn-delete {
      background: #dc3545;
      color: white;
    }

    .btn-delete:hover {
      background: #c82333;
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
      a.numeroApartamento.toLowerCase().includes(termo)
    );
  }

  formatarStatus(status?: StatusApartamento): string {
    if (!status) return '-';
    const statusMap: any = {
      'DISPONIVEL': 'Disponível',
      'OCUPADO': 'Ocupado',
      'LIMPEZA': 'Limpeza',
      'PRE_RESERVA': 'Pré-Reserva',
      'MANUTENCAO': 'Manutenção'
    };
    return statusMap[status] || status;
  }

  novo(): void {
    this.router.navigate(['/apartamentos/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/apartamentos/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este apartamento?')) {
      this.apartamentoService.delete(id).subscribe({
        next: () => {
          this.carregarApartamentos();
        },
        error: (err) => {
          console.error('Erro ao excluir apartamento', err);
          alert('Erro ao excluir apartamento');
        }
      });
    }
  }
}