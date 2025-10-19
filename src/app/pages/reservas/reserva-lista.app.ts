import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { Reserva, StatusReserva } from '../../models/reserva.model';

@Component({
  selector: 'app-reserva-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🏨 Reservas</h1>
        <button class="btn-new" (click)="nova()">+ Nova Reserva</button>
      </div>

      <div class="filters">
        <div class="filter-buttons">
          <button 
            class="filter-btn" 
            [class.active]="filtroAtual === 'todas'"
            (click)="filtrar('todas')">
            📋 Todas
          </button>
          <button 
            class="filter-btn" 
            [class.active]="filtroAtual === 'ativas'"
            (click)="filtrar('ativas')">
            🟢 Ativas
          </button>
          <button 
            class="filter-btn" 
            [class.active]="filtroAtual === 'checkin-hoje'"
            (click)="filtrar('checkin-hoje')">
            📅 Check-in Hoje
          </button>
          <button 
            class="filter-btn" 
            [class.active]="filtroAtual === 'checkout-hoje'"
            (click)="filtrar('checkout-hoje')">
            📅 Check-out Hoje
          </button>
        </div>

        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="termoBusca" 
            (input)="buscar()"
            placeholder="🔍 Buscar por cliente ou apartamento..."
          />
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Apartamento</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Hóspedes</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let reserva of reservasFiltradas">
              <td>#{{ reserva.id }}</td>
              <td>{{ reserva.cliente?.nome || 'N/A' }}</td>
              <td>
                <span class="badge-apt">{{ reserva.apartamento?.numeroApartamento || 'N/A' }}</span>
              </td>
              <td>{{ formatarData(reserva.dataCheckin) }}</td>
              <td>{{ formatarData(reserva.dataCheckout) }}</td>
              <td class="hospedes">{{ reserva.quantidadeHospede }}</td>
              <td class="valor">R$ {{ reserva.totalApagar || 0 | number:'1.2-2' }}</td>
              <td>
                <span class="badge-status" [class]="'status-' + reserva.status?.toLowerCase()">
                  {{ reserva.status }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-view" (click)="visualizar(reserva.id!)" title="Ver Detalhes">
                  👁️
                </button>
                <button 
                  class="btn-finish" 
                  (click)="confirmarFinalizacao(reserva)" 
                  *ngIf="reserva.status === 'ATIVA'"
                  title="Finalizar">
                  ✅
                </button>
                <button 
                  class="btn-cancel" 
                  (click)="confirmarCancelamento(reserva)" 
                  *ngIf="reserva.status === 'ATIVA'"
                  title="Cancelar">
                  ❌
                </button>
              </td>
            </tr>
            <tr *ngIf="reservasFiltradas.length === 0">
              <td colspan="9" class="empty">
                Nenhuma reserva encontrada
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Finalizar -->
      <div class="modal" *ngIf="showFinalizarModal" (click)="cancelarFinalizacao()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>✅ Finalizar Reserva</h3>
          <p>Deseja finalizar esta reserva?</p>
          <p class="info" *ngIf="reservaParaFinalizar">
            <strong>Cliente:</strong> {{ reservaParaFinalizar.cliente?.nome }}<br>
            <strong>Apartamento:</strong> {{ reservaParaFinalizar.apartamento?.numeroApartamento }}<br>
            <strong>Total a pagar:</strong> R$ {{ reservaParaFinalizar.totalApagar | number:'1.2-2' }}
          </p>
          <div class="modal-actions">
            <button class="btn-modal-cancel" (click)="cancelarFinalizacao()">Cancelar</button>
            <button class="btn-modal-confirm" (click)="finalizar()">Finalizar</button>
          </div>
        </div>
      </div>

      <!-- Modal Cancelar -->
      <div class="modal" *ngIf="showCancelarModal" (click)="cancelarCancelamento()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>❌ Cancelar Reserva</h3>
          <p>Informe o motivo do cancelamento:</p>
          <textarea 
            [(ngModel)]="motivoCancelamento" 
            rows="3" 
            placeholder="Ex: Cliente desistiu, problema no apartamento..."
            class="modal-input"></textarea>
          <div class="modal-actions">
            <button class="btn-modal-cancel" (click)="cancelarCancelamento()">Voltar</button>
            <button class="btn-modal-confirm" (click)="cancelar()" [disabled]="!motivoCancelamento">
              Cancelar Reserva
            </button>
          </div>
        </div>
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
      margin-bottom: 30px;
    }

    h1 {
      color: #333;
      margin: 0;
    }

    .btn-new {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }

    .btn-new:hover {
      background: #218838;
    }

    .filters {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .filter-btn.active {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }

    .search-box input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
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

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    .badge-apt {
      background: #667eea;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
    }

    .hospedes {
      font-weight: 600;
      color: #667eea;
    }

    .valor {
      font-weight: 600;
      color: #28a745;
      font-size: 15px;
    }

    .badge-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-ativa {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelada {
      background: #f8d7da;
      color: #721c24;
    }

    .status-finalizada {
      background: #d1ecf1;
      color: #0c5460;
    }

    .actions {
      display: flex;
      gap: 5px;
    }

    .btn-view, .btn-finish, .btn-cancel {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 5px 8px;
      border-radius: 3px;
      transition: all 0.2s;
    }

    .btn-view:hover {
      background: #e3f2fd;
    }

    .btn-finish:hover {
      background: #d4edda;
    }

    .btn-cancel:hover {
      background: #f8d7da;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 40px !important;
      font-style: italic;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
    }

    .modal-content h3 {
      margin: 0 0 15px 0;
    }

    .info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      font-size: 14px;
    }

    .modal-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      font-size: 14px;
      margin: 10px 0;
      box-sizing: border-box;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-modal-cancel, .btn-modal-confirm {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-modal-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-modal-cancel:hover {
      background: #5a6268;
    }

    .btn-modal-confirm {
      background: #28a745;
      color: white;
    }

    .btn-modal-confirm:hover:not(:disabled) {
      background: #218838;
    }

    .btn-modal-confirm:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class ReservaListaApp implements OnInit {
  private reservaService = inject(ReservaService);
  private router = inject(Router);

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  filtroAtual = 'todas';
  termoBusca = '';
  
  showFinalizarModal = false;
  showCancelarModal = false;
  reservaParaFinalizar: Reserva | null = null;
  reservaParaCancelar: Reserva | null = null;
  motivoCancelamento = '';

  ngOnInit(): void {
    console.log('🔵 Inicializando ReservaLista');
    this.carregarReservas();
  }

  carregarReservas(): void {
    console.log('📋 Carregando reservas...');
    this.reservaService.getAll().subscribe({
      next: (data) => {
        this.reservas = data;
        this.reservasFiltradas = data;
        console.log('✅ Reservas carregadas:', data.length);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar reservas:', err);
      }
    });
  }

  filtrar(tipo: string): void {
    this.filtroAtual = tipo;
    
    switch (tipo) {
      case 'todas':
        this.carregarReservas();
        break;
      case 'ativas':
        this.reservaService.getAtivas().subscribe({
          next: (data) => {
            this.reservas = data;
            this.reservasFiltradas = data;
          },
          error: (err) => console.error('❌ Erro:', err)
        });
        break;
      case 'checkin-hoje':
        const hoje = new Date().toISOString();
        this.reservaService.getCheckinsDoDia(hoje).subscribe({
          next: (data) => {
            this.reservas = data;
            this.reservasFiltradas = data;
          },
          error: (err) => console.error('❌ Erro:', err)
        });
        break;
      case 'checkout-hoje':
        const hojeCheckout = new Date().toISOString();
        this.reservaService.getCheckoutsDoDia(hojeCheckout).subscribe({
          next: (data) => {
            this.reservas = data;
            this.reservasFiltradas = data;
          },
          error: (err) => console.error('❌ Erro:', err)
        });
        break;
    }
  }

  buscar(): void {
    const termo = this.termoBusca.toLowerCase();
    this.reservasFiltradas = this.reservas.filter(r =>
      r.cliente?.nome?.toLowerCase().includes(termo) ||
      r.apartamento?.numeroApartamento?.toLowerCase().includes(termo) ||
      r.id?.toString().includes(termo)
    );
  }

  formatarData(data: string): string {
    if (!data) return 'N/A';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  nova(): void {
    this.router.navigate(['/reservas/novo']);
  }

  visualizar(id: number): void {
    this.router.navigate(['/reservas/detalhes', id]);
  }

  confirmarFinalizacao(reserva: Reserva): void {
    this.reservaParaFinalizar = reserva;
    this.showFinalizarModal = true;
  }

  cancelarFinalizacao(): void {
    this.showFinalizarModal = false;
    this.reservaParaFinalizar = null;
  }

  finalizar(): void {
    if (!this.reservaParaFinalizar) return;

    this.reservaService.finalizar(this.reservaParaFinalizar.id!).subscribe({
      next: () => {
        console.log('✅ Reserva finalizada');
        this.carregarReservas();
        this.cancelarFinalizacao();
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        alert('Erro ao finalizar: ' + (err.error?.message || err.message));
      }
    });
  }

  confirmarCancelamento(reserva: Reserva): void {
    this.reservaParaCancelar = reserva;
    this.motivoCancelamento = '';
    this.showCancelarModal = true;
  }

  cancelarCancelamento(): void {
    this.showCancelarModal = false;
    this.reservaParaCancelar = null;
    this.motivoCancelamento = '';
  }

  cancelar(): void {
    if (!this.reservaParaCancelar || !this.motivoCancelamento) return;

    this.reservaService.cancelar(this.reservaParaCancelar.id!, this.motivoCancelamento).subscribe({
      next: () => {
        console.log('✅ Reserva cancelada');
        this.carregarReservas();
        this.cancelarCancelamento();
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        alert('Erro ao cancelar: ' + (err.error?.message || err.message));
      }
    });
  }
}