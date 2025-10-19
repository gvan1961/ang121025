import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApartamentoService } from '../../services/apartamento.service';
import { Apartamento } from '../../models/apartamento.model';
import { StatusApartamento } from '../../models/enums';

@Component({
  selector: 'app-apartamentos-gestao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🏨 Gestão de Apartamentos</h1>
        <button class="btn-refresh" (click)="carregar()">🔄 Atualizar</button>
      </div>

      <div class="filtros">
        <button 
          *ngFor="let f of filtros" 
          [class]="'btn-filtro ' + (filtroAtivo === f.valor ? 'ativo' : '')"
          (click)="filtroAtivo = f.valor">
          {{ f.label }} ({{ contarPorStatus(f.valor) }})
        </button>
      </div>

      <div class="grid-apartamentos">
        <div 
          *ngFor="let apt of apartamentosFiltrados()" 
          [class]="'card-apt status-' + apt.status">
          
          <div class="apt-header">
            <h3>{{ apt.numeroApartamento }}</h3>
            <span [class]="'badge-status badge-' + apt.status">
              {{ getStatusLabel(apt.status!) }}
            </span>
          </div>

          <div class="apt-info">
            <div class="info-item">
              <span class="label">Tipo:</span>
              <span>{{ apt.tipoApartamentoNome || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Capacidade:</span>
              <span>{{ apt.capacidade }} pessoa(s)</span>
            </div>
          </div>

          <div class="apt-acoes">
            <!-- LIMPEZA → DISPONÍVEL -->
            <button 
              *ngIf="apt.status === StatusApartamento.LIMPEZA"
              class="btn-acao btn-liberar"
              (click)="liberarLimpeza(apt)">
              ✅ Liberar
            </button>

            <!-- MANUTENÇÃO → DISPONÍVEL -->
            <button 
              *ngIf="apt.status === StatusApartamento.MANUTENCAO"
              class="btn-acao btn-liberar"
              (click)="liberarManutencao(apt)">
              ✅ Liberar Manutenção
            </button>

            <!-- INDISPONÍVEL → DISPONÍVEL -->
            <button 
              *ngIf="apt.status === StatusApartamento.INDISPONIVEL"
              class="btn-acao btn-liberar"
              (click)="desbloquear(apt)">
              ✅ Desbloquear
            </button>

            <!-- DISPONÍVEL → MANUTENÇÃO -->
            <button 
              *ngIf="apt.status === StatusApartamento.DISPONIVEL"
              class="btn-acao btn-manutencao"
              (click)="abrirModalManutencao(apt)">
              🔧 Manutenção
            </button>

            <!-- DISPONÍVEL → BLOQUEAR -->
            <button 
              *ngIf="apt.status === StatusApartamento.DISPONIVEL"
              class="btn-acao btn-bloquear"
              (click)="abrirModalBloquear(apt)">
              🚫 Bloquear
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Manutenção -->
      <div class="modal" *ngIf="modalManutencao" (click)="fecharModalManutencao()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>🔧 Colocar em Manutenção</h3>
          <p><strong>Apartamento:</strong> {{ aptSelecionado?.numeroApartamento }}</p>
          
          <div class="campo">
            <label>Motivo *</label>
            <textarea [(ngModel)]="motivoManutencao" rows="3" placeholder="Ex: Troca de ar condicionado"></textarea>
          </div>

          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalManutencao()">Cancelar</button>
            <button class="btn-pri" (click)="salvarManutencao()" [disabled]="!motivoManutencao">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Bloquear -->
      <div class="modal" *ngIf="modalBloquear" (click)="fecharModalBloquear()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>🚫 Bloquear Apartamento</h3>
          <p><strong>Apartamento:</strong> {{ aptSelecionado?.numeroApartamento }}</p>
          
          <div class="campo">
            <label>Motivo *</label>
            <textarea [(ngModel)]="motivoBloquear" rows="3" placeholder="Ex: Apartamento interditado"></textarea>
          </div>

          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalBloquear()">Cancelar</button>
            <button class="btn-pri" (click)="salvarBloquear()" [disabled]="!motivoBloquear">
              Confirmar
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
    
    .btn-refresh { 
      background: #667eea; 
      color: white; 
      border: none; 
      padding: 10px 20px; 
      border-radius: 5px; 
      cursor: pointer; 
      font-size: 14px; 
      transition: all 0.2s;
    }
    
    .btn-refresh:hover { 
      background: #5568d3; 
      transform: translateY(-1px);
    }

    .filtros { 
      display: flex; 
      gap: 10px; 
      margin-bottom: 30px; 
      flex-wrap: wrap; 
    }
    
    .btn-filtro { 
      padding: 10px 20px; 
      border: 2px solid #ddd; 
      background: white; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 500; 
      transition: all 0.2s; 
    }
    
    .btn-filtro:hover { 
      border-color: #667eea; 
      transform: translateY(-1px);
    }
    
    .btn-filtro.ativo { 
      background: #667eea; 
      color: white; 
      border-color: #667eea; 
    }

    .grid-apartamentos { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 20px; 
    }
    
    .card-apt { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      border-left: 5px solid; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      transition: all 0.2s;
    }
    
    .card-apt:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .status-DISPONIVEL { border-left-color: #28a745; }
    .status-OCUPADO { border-left-color: #dc3545; }
    .status-LIMPEZA { border-left-color: #ffc107; }
    .status-MANUTENCAO { border-left-color: #fd7e14; }
    .status-INDISPONIVEL { border-left-color: #6c757d; }

    .apt-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 15px; 
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .apt-header h3 { 
      margin: 0; 
      color: #333; 
      font-size: 20px;
    }
    
    .badge-status { 
      padding: 4px 12px; 
      border-radius: 12px; 
      font-size: 12px; 
      font-weight: 600; 
    }
    
    .badge-DISPONIVEL { background: #d4edda; color: #155724; }
    .badge-OCUPADO { background: #f8d7da; color: #721c24; }
    .badge-LIMPEZA { background: #fff3cd; color: #856404; }
    .badge-MANUTENCAO { background: #ffecd9; color: #8a4c00; }
    .badge-INDISPONIVEL { background: #e2e3e5; color: #383d41; }

    .apt-info { 
      margin: 15px 0; 
    }
    
    .info-item { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0; 
      border-bottom: 1px solid #f0f0f0; 
    }
    
    .info-item:last-child { 
      border-bottom: none; 
    }
    
    .label { 
      color: #666; 
      font-size: 13px; 
    }

    .apt-acoes { 
      display: flex; 
      gap: 10px; 
      margin-top: 15px; 
      flex-wrap: wrap; 
    }
    
    .btn-acao { 
      flex: 1; 
      padding: 8px 12px; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer; 
      font-size: 13px; 
      font-weight: 500; 
      min-width: 120px; 
      transition: all 0.2s;
    }
    
    .btn-liberar { 
      background: #28a745; 
      color: white; 
    }
    
    .btn-liberar:hover { 
      background: #218838; 
      transform: translateY(-1px);
    }
    
    .btn-manutencao { 
      background: #fd7e14; 
      color: white; 
    }
    
    .btn-manutencao:hover { 
      background: #e8590c; 
      transform: translateY(-1px);
    }
    
    .btn-bloquear { 
      background: #6c757d; 
      color: white; 
    }
    
    .btn-bloquear:hover { 
      background: #5a6268; 
      transform: translateY(-1px);
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
    
    .modal-box { 
      background: white; 
      padding: 30px; 
      border-radius: 8px; 
      max-width: 500px; 
      width: 90%; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    
    .modal-box h3 { 
      margin: 0 0 15px 0; 
      color: #333; 
    }
    
    .modal-box p { 
      margin-bottom: 20px; 
    }

    .campo { 
      margin-bottom: 20px; 
    }
    
    .campo label { 
      display: block; 
      margin-bottom: 5px; 
      font-weight: 500; 
      color: #555; 
    }
    
    .campo textarea { 
      width: 100%; 
      padding: 10px; 
      border: 1px solid #ddd; 
      border-radius: 5px; 
      font-family: inherit; 
      box-sizing: border-box; 
      resize: vertical;
    }
    
    .campo textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .modal-btns { 
      display: flex; 
      gap: 10px; 
      justify-content: flex-end; 
    }
    
    .btn-sec, .btn-pri { 
      padding: 10px 20px; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer; 
      font-size: 14px; 
    }
    
    .btn-sec { 
      background: #6c757d; 
      color: white; 
    }
    
    .btn-sec:hover { 
      background: #5a6268; 
    }
    
    .btn-pri { 
      background: #28a745; 
      color: white; 
    }
    
    .btn-pri:hover:not(:disabled) { 
      background: #218838; 
    }
    
    .btn-pri:disabled { 
      background: #ccc; 
      cursor: not-allowed; 
    }
  `]
})
export class ApartamentosGestaoApp implements OnInit {
  private apartamentoService = inject(ApartamentoService);

  // ✅ Expor enum para uso no template
  StatusApartamento = StatusApartamento;

  apartamentos: Apartamento[] = [];
  filtroAtivo = 'TODOS';
  
  filtros = [
    { valor: 'TODOS', label: 'Todos' },
    { valor: StatusApartamento.DISPONIVEL, label: 'Disponíveis' },
    { valor: StatusApartamento.OCUPADO, label: 'Ocupados' },
    { valor: StatusApartamento.LIMPEZA, label: 'Limpeza' },
    { valor: StatusApartamento.MANUTENCAO, label: 'Manutenção' },
    { valor: StatusApartamento.INDISPONIVEL, label: 'Bloqueados' }
  ];

  modalManutencao = false;
  modalBloquear = false;
  aptSelecionado: Apartamento | null = null;
  motivoManutencao = '';
  motivoBloquear = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.apartamentoService.listar().subscribe({
      next: (data: Apartamento[]) => {
        this.apartamentos = data;
        console.log('✅ Apartamentos carregados:', data.length);
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('Erro ao carregar apartamentos');
      }
    });
  }

  apartamentosFiltrados(): Apartamento[] {
    if (this.filtroAtivo === 'TODOS') {
      return this.apartamentos;
    }
    return this.apartamentos.filter(a => a.status === this.filtroAtivo);
  }

  contarPorStatus(status: string): number {
    if (status === 'TODOS') return this.apartamentos.length;
    return this.apartamentos.filter(a => a.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      [StatusApartamento.DISPONIVEL]: 'Disponível',
      [StatusApartamento.OCUPADO]: 'Ocupado',
      [StatusApartamento.LIMPEZA]: 'Limpeza',
      [StatusApartamento.MANUTENCAO]: 'Manutenção',
      [StatusApartamento.INDISPONIVEL]: 'Bloqueado'
    };
    return labels[status] || status;
  }

  // LIBERAR LIMPEZA
  liberarLimpeza(apt: Apartamento): void {
    if (!apt.id) return;
    if (!confirm(`Liberar apartamento ${apt.numeroApartamento} da limpeza?`)) return;

    this.apartamentoService.liberarLimpeza(apt.id).subscribe({
      next: () => {
        alert('✅ Apartamento liberado!');
        this.carregar();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  // LIBERAR MANUTENÇÃO
  liberarManutencao(apt: Apartamento): void {
    if (!apt.id) return;
    if (!confirm(`Liberar apartamento ${apt.numeroApartamento} da manutenção?`)) return;

    this.apartamentoService.liberarManutencao(apt.id).subscribe({
      next: () => {
        alert('✅ Manutenção finalizada!');
        this.carregar();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  // DESBLOQUEAR
  desbloquear(apt: Apartamento): void {
    if (!apt.id) return;
    if (!confirm(`Desbloquear apartamento ${apt.numeroApartamento}?`)) return;

    this.apartamentoService.desbloquear(apt.id).subscribe({
      next: () => {
        alert('✅ Apartamento desbloqueado!');
        this.carregar();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  // MODAL MANUTENÇÃO
  abrirModalManutencao(apt: Apartamento): void {
    this.aptSelecionado = apt;
    this.motivoManutencao = '';
    this.modalManutencao = true;
  }

  fecharModalManutencao(): void {
    this.modalManutencao = false;
  }

  salvarManutencao(): void {
    if (!this.aptSelecionado?.id) return;

    this.apartamentoService.colocarEmManutencao(this.aptSelecionado.id, this.motivoManutencao).subscribe({
      next: () => {
        alert('✅ Apartamento em manutenção!');
        this.carregar();
        this.fecharModalManutencao();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  // MODAL BLOQUEAR
  abrirModalBloquear(apt: Apartamento): void {
    this.aptSelecionado = apt;
    this.motivoBloquear = '';
    this.modalBloquear = true;
  }

  fecharModalBloquear(): void {
    this.modalBloquear = false;
  }

  salvarBloquear(): void {
    if (!this.aptSelecionado?.id) return;

    this.apartamentoService.bloquear(this.aptSelecionado.id, this.motivoBloquear).subscribe({
      next: () => {
        alert('✅ Apartamento bloqueado!');
        this.carregar();
        this.fecharModalBloquear();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }
}