import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ReservaDetalhes {
  id: number;
  cliente?: {
    id: number;
    nome: string;
    cpf: string;
    telefone?: string;
  };
  apartamento?: {
    id: number;
    numeroApartamento: string;
    capacidade: number;
    tipoApartamentoNome?: string;
  };
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
  quantidadeDiaria: number;
  valorDiaria: number;
  totalDiaria: number;
  totalHospedagem: number;
  totalRecebido: number;
  totalApagar: number;
  totalProduto?: number;
  status: string;
  extratos?: any[];
  historicos?: any[];
}

interface Produto {
  id: number;
  nomeProduto: string;
  valorVenda: number;
  quantidade: number;
}

interface Apartamento {
  id: number;
  numeroApartamento: string;
  capacidade: number;
  tipoApartamento?: {
    tipo: string;
  };
  tipoApartamentoNome?: string;
}

@Component({
  selector: 'app-reserva-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-detalhes">
      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando reserva...</p>
      </div>

      <!-- ERRO -->
      <div *ngIf="erro && !loading" class="erro">
        <h2>❌ Erro</h2>
        <p>{{ erro }}</p>
        <button (click)="voltar()">← Voltar</button>
      </div>

      <!-- DETALHES -->
      <div *ngIf="reserva && !loading" class="detalhes">
        <!-- HEADER -->
        <div class="header">
          <div>
            <h1>📋 Reserva #{{ reserva.id }}</h1>
            <span [class]="'badge-status ' + obterStatusClass()">
              {{ reserva.status }}
            </span>
          </div>
          <button class="btn-voltar" (click)="voltar()">
            ← Voltar
          </button>
        </div>

        <!-- GRID DE CARDS -->
        <div class="grid">
          <!-- CLIENTE -->
          <div class="card">
            <h2>👤 Cliente</h2>
            <div class="info-item">
              <span class="label">Nome:</span>
              <span class="value">{{ reserva.cliente?.nome || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPF:</span>
              <span class="value">{{ reserva.cliente?.cpf || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Telefone:</span>
              <span class="value">{{ reserva.cliente?.telefone || 'N/A' }}</span>
            </div>
          </div>

          <!-- APARTAMENTO -->
          <div class="card">
            <h2>🏨 Apartamento</h2>
            <div class="info-item">
              <span class="label">Número:</span>
              <span class="value numero-apt">
                {{ reserva.apartamento?.numeroApartamento || 'N/A' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Tipo:</span>
              <span class="value">{{ reserva.apartamento?.tipoApartamentoNome || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Capacidade:</span>
              <span class="value">{{ reserva.apartamento?.capacidade || 0 }} pessoas</span>
            </div>
          </div>

          <!-- HOSPEDAGEM -->
          <div class="card">
            <h2>📅 Hospedagem</h2>
            <div class="info-item">
              <span class="label">Check-in:</span>
              <span class="value">{{ formatarData(reserva.dataCheckin) }}</span>
            </div>
            <div class="info-item-com-botao">
              <div class="info-item">
                <span class="label">Check-out:</span>
                <span class="value">{{ formatarData(reserva.dataCheckout) }}</span>
              </div>
              <button 
                *ngIf="reserva.status === 'ATIVA'"
                class="btn-mini"
                (click)="abrirModalAlterarCheckout()"
                title="Alterar data de checkout">
                ✏️
              </button>
            </div>
            <div class="info-item-com-botao">
              <div class="info-item">
                <span class="label">Hóspedes:</span>
                <span class="value">{{ reserva.quantidadeHospede }}</span>
              </div>
              <button 
                *ngIf="reserva.status === 'ATIVA'"
                class="btn-mini"
                (click)="abrirModalAlterarHospedes()"
                title="Alterar quantidade de hóspedes">
                ✏️
              </button>
            </div>
            <div class="info-item">
              <span class="label">Diárias:</span>
              <span class="value">{{ reserva.quantidadeDiaria }}</span>
            </div>
          </div>

          <!-- FINANCEIRO -->
          <div class="card">
            <h2>💰 Financeiro</h2>
            <div class="info-item">
              <span class="label">Valor Diária:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.valorDiaria) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total Diárias:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.totalDiaria) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Consumo:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.totalProduto || 0) }}</span>
            </div>
            <div class="info-item destaque">
              <span class="label">Total Hospedagem:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.totalHospedagem) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Recebido:</span>
              <span class="value valor-positivo">R$ {{ formatarMoeda(reserva.totalRecebido) }}</span>
            </div>
            <div class="info-item destaque">
              <span class="label">Saldo:</span>
              <span class="value" [class.valor-negativo]="(reserva.totalApagar || 0) > 0">
                R$ {{ formatarMoeda(reserva.totalApagar) }}
              </span>
            </div>
          </div>
        </div>

        <!-- EXTRATO -->
        <div class="card extrato-card" *ngIf="reserva.extratos && reserva.extratos.length > 0">
          <h2>📊 Extrato</h2>
          <table class="tabela-extrato">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let extrato of reserva.extratos">
                <td>{{ formatarData(extrato.dataHoraLancamento) }}</td>
                <td>
                  <span [class]="'badge-extrato badge-' + extrato.statusLancamento.toLowerCase()">
                    {{ extrato.statusLancamento }}
                  </span>
                  {{ extrato.descricao }}
                </td>
                <td>{{ extrato.quantidade }}</td>
                <td>R$ {{ formatarMoeda(extrato.valorUnitario) }}</td>
                <td [class.valor-negativo]="extrato.totalLancamento < 0"
                    [class.valor-positivo]="extrato.totalLancamento > 0">
                  R$ {{ formatarMoeda(extrato.totalLancamento) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- HISTÓRICO -->
        <div class="card historico-card" *ngIf="reserva.historicos && reserva.historicos.length > 0">
          <h2>📜 Histórico</h2>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let hist of reserva.historicos">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-date">{{ formatarDataHora(hist.dataHora) }}</span>
                </div>
                <div class="timeline-body">
                  <p>{{ hist.motivo }}</p>
                  <small *ngIf="hist.quantidadeAnterior !== hist.quantidadeNova">
                    Hóspedes: {{ hist.quantidadeAnterior }} → {{ hist.quantidadeNova }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AÇÕES -->
        <div class="card acoes-card">
          <h2>⚙️ Ações</h2>
          <div class="botoes-acoes">
            <button class="btn-acao btn-pagamento" 
                    *ngIf="reserva.status === 'ATIVA' && (reserva.totalApagar || 0) > 0"
                    (click)="abrirModalPagamento()">
              💳 Registrar Pagamento
            </button>
            
            <button class="btn-acao btn-consumo" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalConsumo()">
              🛒 Adicionar Consumo
            </button>
            
            <button class="btn-acao btn-transferir" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalTransferencia()">
              🔄 Transferir Apartamento
            </button>
            
            <button class="btn-acao btn-finalizar" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="finalizarReserva()">
              ✅ Finalizar Reserva
            </button>
            
            <button class="btn-acao btn-cancelar" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="cancelarReserva()">
              ❌ Cancelar Reserva
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ALTERAR CHECKOUT -->
      <div class="modal-overlay" *ngIf="modalAlterarCheckout" (click)="fecharModalAlterarCheckout()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>📅 Alterar Data de Check-out</h2>
          
          <div class="info-box">
            <p><strong>Check-in:</strong> {{ formatarData(reserva?.dataCheckin) }}</p>
            <p><strong>Check-out atual:</strong> {{ formatarData(reserva?.dataCheckout) }}</p>
          </div>

          <div class="campo">
            <label>Nova Data de Check-out *</label>
            <input type="date" [(ngModel)]="novaDataCheckout" [min]="obterDataMinimaCheckout()">
          </div>

          <div class="campo">
            <label>Motivo</label>
            <textarea [(ngModel)]="motivoAlteracaoCheckout" rows="3"
                      placeholder="Informe o motivo da alteração..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalAlterarCheckout()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarAlteracaoCheckout()">
              Confirmar Alteração
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ALTERAR HÓSPEDES -->
      <div class="modal-overlay" *ngIf="modalAlterarHospedes" (click)="fecharModalAlterarHospedes()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>👥 Alterar Quantidade de Hóspedes</h2>
          
          <div class="info-box">
            <p><strong>Quantidade atual:</strong> {{ reserva?.quantidadeHospede }} hóspede(s)</p>
            <p><strong>Capacidade do apartamento:</strong> {{ reserva?.apartamento?.capacidade }} pessoa(s)</p>
          </div>

          <div class="campo">
            <label>Nova Quantidade *</label>
            <input type="number" [(ngModel)]="novaQuantidadeHospedes" 
                   min="1" [max]="reserva?.apartamento?.capacidade || 10">
          </div>

          <div class="campo">
            <label>Motivo</label>
            <textarea [(ngModel)]="motivoAlteracaoHospedes" rows="3"
                      placeholder="Informe o motivo da alteração..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalAlterarHospedes()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarAlteracaoHospedes()">
              Confirmar Alteração
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL PAGAMENTO -->
      <div class="modal-overlay" *ngIf="modalPagamento" (click)="fecharModalPagamento()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>💳 Registrar Pagamento</h2>
          
          <div class="campo">
            <label>Valor a Pagar *</label>
            <input type="number" [(ngModel)]="pagValor" step="0.01" min="0">
            <small>Saldo devedor: R$ {{ formatarMoeda(reserva?.totalApagar) }}</small>
          </div>

          <div class="campo">
            <label>Forma de Pagamento *</label>
            <select [(ngModel)]="pagFormaPagamento">
              <option value="">Selecione...</option>
              <option *ngFor="let forma of formasPagamento" [value]="forma.codigo">
                {{ forma.nome }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="pagObs" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalPagamento()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="salvarPagamento()">
              Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CONSUMO -->
      <div class="modal-overlay" *ngIf="modalConsumo" (click)="fecharModalConsumo()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>🛒 Adicionar Consumo</h2>
          
          <div class="campo">
            <label>Produto *</label>
            <select [(ngModel)]="produtoSelecionadoId">
              <option value="0">Selecione um produto...</option>
              <option *ngFor="let produto of produtos" [value]="produto.id">
                {{ produto.nomeProduto }} - R$ {{ formatarMoeda(produto.valorVenda) }} 
                (Estoque: {{ produto.quantidade }})
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Quantidade *</label>
            <input type="number" [(ngModel)]="quantidadeConsumo" min="1">
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="observacaoConsumo" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalConsumo()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="salvarConsumo()">
              Adicionar ao Consumo
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL TRANSFERÊNCIA -->
      <div class="modal-overlay" *ngIf="modalTransferencia" (click)="fecharModalTransferencia()">
        <div class="modal-content modal-grande" (click)="$event.stopPropagation()">
          <h2>🔄 Transferir Apartamento</h2>
          
          <div class="campo">
            <label>Novo Apartamento *</label>
            <select [(ngModel)]="novoApartamentoId">
              <option value="0">Selecione um apartamento...</option>
              <option *ngFor="let apt of apartamentosDisponiveis" [value]="apt.id">
                {{ apt.numeroApartamento }} - 
                {{ obterNomeTipoApartamento(apt) }} 
                (Cap: {{ apt.capacidade }})
              </option>
            </select>
          </div>

          <div class="campo">
            <label>
              <input type="checkbox" [(ngModel)]="transferenciaImediata">
              Transferência Imediata
            </label>
            <small>Se desmarcado, informe a data da transferência</small>
          </div>

          <div class="campo" *ngIf="!transferenciaImediata">
            <label>Data da Transferência *</label>
            <input type="date" [(ngModel)]="dataTransferencia" [min]="obterDataMinima()">
          </div>

          <div class="campo">
            <label>Motivo *</label>
            <textarea [(ngModel)]="motivoTransferencia" rows="3" 
                      placeholder="Informe o motivo da transferência..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalTransferencia()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarTransferencia()">
              Confirmar Transferência
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-detalhes {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #4CAF50;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .erro {
      background: #ffebee;
      border: 2px solid #f44336;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
    }

    .erro h2 {
      color: #c62828;
      margin: 0 0 15px 0;
    }

    .erro button {
      margin-top: 20px;
      padding: 10px 24px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .badge-status {
      padding: 6px 16px;
      border-radius: 12px;
      font-size: 0.9em;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-ativa {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .status-finalizada {
      background: #bbdefb;
      color: #1565c0;
    }

    .status-cancelada {
      background: #ffcdd2;
      color: #c62828;
    }

    .btn-voltar {
      padding: 10px 20px;
      background: #95a5a6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-voltar:hover {
      background: #7f8c8d;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 1.2em;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item.destaque {
      font-weight: 600;
      font-size: 1.1em;
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
      margin-top: 10px;
    }

    .info-item-com-botao {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #f5f5f5;
    }

    .info-item-com-botao .info-item {
      border-bottom: none;
      flex: 1;
      padding: 10px 0;
    }

    .btn-mini {
      padding: 4px 8px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      transition: all 0.3s ease;
    }

    .btn-mini:hover {
      background: #2980b9;
      transform: scale(1.1);
    }

    .label {
      color: #7f8c8d;
      font-weight: 600;
    }

    .value {
      color: #2c3e50;
      font-weight: 500;
    }

    .numero-apt {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
    }

    .valor-positivo {
      color: #4CAF50;
      font-weight: 700;
    }

    .valor-negativo {
      color: #f44336;
      font-weight: 700;
    }

    .extrato-card, .historico-card, .acoes-card {
      grid-column: 1 / -1;
    }

    .tabela-extrato {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    .tabela-extrato th {
      background: #2c3e50;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    .tabela-extrato td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .badge-extrato {
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.75em;
      font-weight: 600;
      text-transform: uppercase;
      margin-right: 8px;
    }

    .badge-diaria {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .badge-produto {
      background: #fff9c4;
      color: #f57f17;
    }

    .badge-estorno {
      background: #ffcdd2;
      color: #c62828;
    }

    .timeline {
      position: relative;
      padding-left: 30px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e0e0e0;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 20px;
    }

    .timeline-marker {
      position: absolute;
      left: -24px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4CAF50;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #4CAF50;
    }

    .timeline-content {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
    }

    .timeline-header {
      margin-bottom: 8px;
    }

    .timeline-date {
      color: #7f8c8d;
      font-size: 0.85em;
      font-weight: 600;
    }

    .timeline-body p {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .timeline-body small {
      color: #7f8c8d;
      font-size: 0.85em;
    }

    .botoes-acoes {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-acao {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;
    }

    .btn-acao:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-pagamento {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .btn-consumo {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .btn-transferir {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .btn-finalizar {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .btn-cancelar {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      min-width: 500px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideDown 0.3s ease;
    }

    .modal-grande {
      min-width: 600px;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .info-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .info-box p {
      margin: 8px 0;
    }

    .campo {
      margin-bottom: 20px;
    }

    .campo label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .campo input[type="text"],
    .campo input[type="number"],
    .campo input[type="date"],
    .campo select,
    .campo textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      font-family: inherit;
      box-sizing: border-box;
    }

    .campo input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }

    .campo input:focus,
    .campo select:focus,
    .campo textarea:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .campo small {
      display: block;
      margin-top: 5px;
      color: #7f8c8d;
      font-size: 0.85em;
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-cancelar-modal,
    .btn-confirmar {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancelar-modal {
      background: #95a5a6;
      color: white;
    }

    .btn-cancelar-modal:hover {
      background: #7f8c8d;
    }

    .btn-confirmar {
      background: #4CAF50;
      color: white;
    }

    .btn-confirmar:hover {
      background: #45a049;
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
      
      .botoes-acoes {
        flex-direction: column;
      }
      
      .btn-acao {
        width: 100%;
      }

      .modal-content {
        min-width: 90%;
      }
    }
  `]
})
export class ReservaDetalhesApp implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  reserva: ReservaDetalhes | null = null;
  loading = false;
  erro = '';

  // ALTERAR CHECKOUT
  modalAlterarCheckout = false;
  novaDataCheckout = '';
  motivoAlteracaoCheckout = '';

  // ALTERAR HÓSPEDES
  modalAlterarHospedes = false;
  novaQuantidadeHospedes = 1;
  motivoAlteracaoHospedes = '';

  // PAGAMENTO
  modalPagamento = false;
  pagValor = 0;
  pagFormaPagamento = '';
  pagObs = '';
  formasPagamento = [
    { codigo: 'DINHEIRO', nome: 'Dinheiro' },
    { codigo: 'PIX', nome: 'PIX' },
    { codigo: 'CARTAO_DEBITO', nome: 'Cartão Débito' },
    { codigo: 'CARTAO_CREDITO', nome: 'Cartão Crédito' },
    { codigo: 'TRANSFERENCIA_BANCARIA', nome: 'Transferência' },
    { codigo: 'FATURADO', nome: 'Faturado' }
  ];

  // CONSUMO
  modalConsumo = false;
  produtos: Produto[] = [];
  produtoSelecionadoId = 0;
  quantidadeConsumo = 1;
  observacaoConsumo = '';

  // TRANSFERÊNCIA
  modalTransferencia = false;
  apartamentosDisponiveis: Apartamento[] = [];
  novoApartamentoId = 0;
  dataTransferencia = '';
  transferenciaImediata = true;
  motivoTransferencia = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarReserva(Number(id));
    } else {
      this.erro = 'ID da reserva não fornecido';
    }
  }

  carregarReserva(id: number): void {
    this.loading = true;
    this.erro = '';

    this.http.get<ReservaDetalhes>(`http://localhost:8080/api/reservas/${id}`).subscribe({
      next: (data) => {
        this.reserva = data;
        this.loading = false;
        console.log('✅ Reserva carregada:', data);
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        this.erro = err.error?.message || 'Erro ao carregar reserva';
        this.loading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/reservas']);
  }

  formatarData(data: any): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: any): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarMoeda(valor: any): string {
    if (valor === null || valor === undefined) return '0,00';
    return Number(valor).toFixed(2).replace('.', ',');
  }

  obterStatusClass(): string {
    if (!this.reserva?.status) return 'status-ativa';
    return 'status-' + this.reserva.status.toLowerCase();
  }

  // ============= ALTERAR CHECKOUT =============
  abrirModalAlterarCheckout(): void {
    if (!this.reserva) return;
    
    const dataCheckout = new Date(this.reserva.dataCheckout);
    this.novaDataCheckout = dataCheckout.toISOString().split('T')[0];
    this.motivoAlteracaoCheckout = '';
    this.modalAlterarCheckout = true;
  }

  fecharModalAlterarCheckout(): void {
    this.modalAlterarCheckout = false;
  }

  obterDataMinimaCheckout(): string {
    if (!this.reserva) return '';
    const dataCheckin = new Date(this.reserva.dataCheckin);
    dataCheckin.setDate(dataCheckin.getDate() + 1);
    return dataCheckin.toISOString().split('T')[0];
  }

  confirmarAlteracaoCheckout(): void {
    if (!this.reserva) return;

    if (!this.novaDataCheckout) {
      alert('⚠️ Informe a nova data de check-out');
      return;
    }

    const params: any = {
      novaDataCheckout: this.novaDataCheckout + 'T12:00:00'
    };

    if (this.motivoAlteracaoCheckout.trim()) {
      params.motivo = this.motivoAlteracaoCheckout;
    }

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/alterar-checkout`, null, { params }).subscribe({
      next: () => {
        alert('✅ Data de check-out alterada com sucesso!');
        this.fecharModalAlterarCheckout();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  // ============= ALTERAR HÓSPEDES =============
  abrirModalAlterarHospedes(): void {
    if (!this.reserva) return;
    
    this.novaQuantidadeHospedes = this.reserva.quantidadeHospede;
    this.motivoAlteracaoHospedes = '';
    this.modalAlterarHospedes = true;
  }

  fecharModalAlterarHospedes(): void {
    this.modalAlterarHospedes = false;
  }

  confirmarAlteracaoHospedes(): void {
    if (!this.reserva) return;

    if (this.novaQuantidadeHospedes < 1) {
      alert('⚠️ Quantidade inválida');
      return;
    }

    if (this.novaQuantidadeHospedes > (this.reserva.apartamento?.capacidade || 0)) {
      alert('⚠️ Quantidade excede a capacidade do apartamento');
      return;
    }

    const params: any = {
      quantidade: this.novaQuantidadeHospedes
    };

    if (this.motivoAlteracaoHospedes.trim()) {
      params.motivo = this.motivoAlteracaoHospedes;
    }

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/alterar-hospedes`, null, { params }).subscribe({
      next: () => {
        alert('✅ Quantidade de hóspedes alterada com sucesso!');
        this.fecharModalAlterarHospedes();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  // ============= PAGAMENTO =============
  abrirModalPagamento(): void {
    if (!this.reserva) return;
    this.pagValor = Number(this.reserva.totalApagar);
    this.pagFormaPagamento = '';
    this.pagObs = '';
    this.modalPagamento = true;
  }

  fecharModalPagamento(): void {
    this.modalPagamento = false;
  }

  salvarPagamento(): void {
    if (!this.reserva) {
      alert('Reserva não encontrada');
      return;
    }

    if (!this.pagFormaPagamento) {
      alert('Selecione uma forma de pagamento');
      return;
    }

    if (this.pagValor <= 0) {
      alert('Valor inválido');
      return;
    }

    if (this.pagValor > (this.reserva.totalApagar || 0)) {
      alert(`Valor maior que saldo (R$ ${(this.reserva.totalApagar || 0).toFixed(2)})`);
      return;
    }

    const dto = {
      reservaId: this.reserva.id,
      valor: this.pagValor,
      formaPagamento: this.pagFormaPagamento,
      observacao: this.pagObs || undefined
    };

    this.http.post('http://localhost:8080/api/pagamentos', dto).subscribe({
      next: () => {
        alert('✅ Pagamento registrado!');
        this.fecharModalPagamento();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  // ============= CONSUMO =============
  abrirModalConsumo(): void {
    this.carregarProdutosDisponiveis();
    this.produtoSelecionadoId = 0;
    this.quantidadeConsumo = 1;
    this.observacaoConsumo = '';
    this.modalConsumo = true;
  }

  fecharModalConsumo(): void {
    this.modalConsumo = false;
  }

  carregarProdutosDisponiveis(): void {
    this.http.get<Produto[]>('http://localhost:8080/api/produtos').subscribe({
      next: (data) => {
        this.produtos = data.filter(p => p.quantidade > 0);
        if (this.produtos.length === 0) {
          alert('⚠️ Nenhum produto disponível!');
        }
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('Erro ao carregar produtos');
      }
    });
  }

  salvarConsumo(): void {
    if (!this.reserva) {
      alert('Reserva não encontrada');
      return;
    }

    if (this.produtoSelecionadoId === 0) {
      alert('⚠️ Selecione um produto');
      return;
    }

    if (this.quantidadeConsumo <= 0) {
      alert('⚠️ Quantidade inválida');
      return;
    }

    const dto = {
      produtoId: this.produtoSelecionadoId,
      quantidade: this.quantidadeConsumo,
      observacao: this.observacaoConsumo
    };

    this.http.post(`http://localhost:8080/api/reservas/${this.reserva.id}/consumo`, dto).subscribe({
      next: () => {
        alert('✅ Produto adicionado ao consumo!');
        this.fecharModalConsumo();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error?.message || err.message));
      }
    });
  }

  // ============= TRANSFERÊNCIA =============
  abrirModalTransferencia(): void {
    if (!this.reserva) return;

    this.http.get<Apartamento[]>('http://localhost:8080/api/apartamentos').subscribe({
      next: (data) => {
        this.apartamentosDisponiveis = data.filter(
          (apt: Apartamento) => 
            apt.id !== this.reserva?.apartamento?.id &&
            apt.capacidade >= (this.reserva?.quantidadeHospede || 0)
        );

        if (this.apartamentosDisponiveis.length === 0) {
          alert('⚠️ Nenhum apartamento disponível para transferência');
          return;
        }

        this.novoApartamentoId = 0;
        this.dataTransferencia = '';
        this.transferenciaImediata = true;
        this.motivoTransferencia = '';
        this.modalTransferencia = true;
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('Erro ao carregar apartamentos disponíveis');
      }
    });
  }

  fecharModalTransferencia(): void {
    this.modalTransferencia = false;
  }

  confirmarTransferencia(): void {
    if (!this.reserva) {
      alert('Reserva não encontrada');
      return;
    }

    if (this.novoApartamentoId === 0) {
      alert('⚠️ Selecione um apartamento');
      return;
    }

    if (!this.transferenciaImediata && !this.dataTransferencia) {
      alert('⚠️ Informe a data da transferência');
      return;
    }

    if (!this.motivoTransferencia.trim()) {
      alert('⚠️ Informe o motivo da transferência');
      return;
    }

    const confirmacao = confirm(
      this.transferenciaImediata
        ? '⚠️ Confirma transferência IMEDIATA de apartamento?'
        : `⚠️ Confirma transferência para o dia ${this.dataTransferencia}?`
    );

    if (!confirmacao) return;

    const dto = {
      reservaId: this.reserva.id,
      novoApartamentoId: this.novoApartamentoId,
      dataTransferencia: this.transferenciaImediata ? null : this.dataTransferencia + 'T00:00:00',
      motivo: this.motivoTransferencia
    };

    this.http.post('http://localhost:8080/api/reservas/transferir-apartamento', dto).subscribe({
      next: () => {
        alert('✅ Transferência realizada com sucesso!');
        this.fecharModalTransferencia();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  obterNomeTipoApartamento(apt: Apartamento): string {
    return apt.tipoApartamento?.tipo || apt.tipoApartamentoNome || 'Sem tipo';
  }

  obterDataMinima(): string {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return amanha.toISOString().split('T')[0];
  }

  // ============= FINALIZAR / CANCELAR =============
  finalizarReserva(): void {
    if (!this.reserva) return;

    if ((this.reserva.totalApagar || 0) > 0) {
      alert(`❌ Não é possível finalizar!\n\nSaldo devedor: R$ ${(this.reserva.totalApagar || 0).toFixed(2)}\n\nQuite o valor antes de finalizar.`);
      return;
    }

    const confirmacao = confirm('✅ Confirma a finalização da reserva?\n\nO apartamento ficará em status LIMPEZA.');
    if (!confirmacao) return;

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/finalizar`, {}).subscribe({
      next: () => {
        alert('✅ Reserva finalizada com sucesso!');
        this.carregarReserva(this.reserva!.id);
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  cancelarReserva(): void {
    if (!this.reserva) return;

    const motivo = prompt('❌ Informe o motivo do cancelamento:');
    if (!motivo || motivo.trim() === '') {
      alert('⚠️ Motivo é obrigatório!');
      return;
    }

    const confirmacao = confirm(`❌ Confirma o cancelamento da reserva?\n\nMotivo: ${motivo}\n\nO apartamento será liberado.`);
    if (!confirmacao) return;

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/cancelar`, null, { params: { motivo } }).subscribe({
      next: () => {
        alert('✅ Reserva cancelada!');
        this.carregarReserva(this.reserva!.id);
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }
}