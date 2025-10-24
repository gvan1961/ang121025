import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // ✅ ADICIONAR
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { ApartamentoService } from '../../services/apartamento.service';
import { DiariaService } from '../../services/diaria.service';

import { ReservaRequest } from '../../models/reserva.model';
import { Cliente } from '../../models/cliente.model';
import { Apartamento } from '../../models/apartamento.model';
import { Diaria } from '../../models/diaria.model';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🏨 Nova Reserva</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <!-- ✅ BUSCA DE CLIENTE -->
          <div class="form-group campo-busca">
            <label>Cliente *</label>
            
            <div class="busca-wrapper">
              <input 
                type="text" 
                [(ngModel)]="buscaCliente"
                name="buscaCliente"
                (input)="filtrarClientes()"
                (focus)="filtrarClientes()"
                placeholder="Digite o nome ou CPF do cliente..."
                class="input-busca"
                autocomplete="off">
              
              <button 
                type="button" 
                class="btn-limpar-busca" 
                *ngIf="buscaCliente"
                (click)="limparBuscaCliente()">
                ✕
              </button>
            </div>

            <!-- RESULTADOS DA BUSCA -->
            <div class="resultados-busca" *ngIf="mostrarResultados && clientesFiltrados.length > 0">
              <div 
                class="resultado-item" 
                *ngFor="let cliente of clientesFiltrados"
                (click)="selecionarCliente(cliente)">
                <div class="resultado-nome">{{ cliente.nome }}</div>
                <div class="resultado-cpf">CPF: {{ formatarCPF(cliente.cpf) }}</div>
                <div class="resultado-info" *ngIf="cliente.telefone">
                  📞 {{ cliente.telefone }}
                </div>
              </div>
            </div>
            
            <div class="sem-resultado" *ngIf="mostrarResultados && clientesFiltrados.length === 0 && buscaCliente.length >= 2">
              ❌ Nenhum cliente encontrado
            </div>

            <small class="field-help">Digite pelo menos 2 caracteres para buscar</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Apartamento *</label>
              <select [(ngModel)]="reserva.apartamentoId" 
                      name="apartamentoId" required
                      (change)="onApartamentoChange()">
                <option [ngValue]="0">Selecione o apartamento</option>
                <option *ngFor="let apt of apartamentos" [ngValue]="apt.id">
                  {{ apt.numeroApartamento }} - Tipo {{ apt.tipoApartamentoNome }} (Cap: {{ apt.capacidade }})
                </option>
              </select>
              <small class="field-help" *ngIf="apartamentoSelecionado">
                Capacidade máxima: {{ apartamentoSelecionado.capacidade }} pessoa(s)
              </small>
            </div>

            <div class="form-group">
              <label>Quantidade de Hóspedes *</label>
              <input type="number" [(ngModel)]="reserva.quantidadeHospede" 
                     name="quantidadeHospede" required min="1" 
                     [max]="apartamentoSelecionado?.capacidade || 10"
                     placeholder="Quantidade de pessoas" />
              <small class="field-help">
                Número de pessoas que ocuparão o apartamento
              </small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>🗓️ Data e Hora de Check-in *</label>
              <input type="datetime-local" 
                     [(ngModel)]="reserva.dataCheckin" 
                     name="dataCheckin" required
                     (change)="calcularDiarias()" />
              <small class="field-help" *ngIf="reserva.dataCheckin">
                {{ formatarDataHora(reserva.dataCheckin) }}
              </small>
            </div>

            <div class="form-group">
              <label>🗓️ Data e Hora de Check-out *</label>
              <input type="datetime-local" 
                     [(ngModel)]="reserva.dataCheckout" 
                     name="dataCheckout" required
                     (change)="calcularDiarias()" />
              <small class="field-help" *ngIf="reserva.dataCheckout && quantidadeDiarias > 0">
                {{ formatarDataHora(reserva.dataCheckout) }} - Total: {{ quantidadeDiarias }} diária(s)
              </small>
            </div>
          </div>

          <div class="info-box" *ngIf="valorEstimado > 0">
            <strong>💰 Resumo da Reserva:</strong>
            
            <div class="resumo-info">
              <div class="info-linha">
                <span>Check-in:</span>
                <span>{{ formatarDataHora(reserva.dataCheckin) }}</span>
              </div>
              <div class="info-linha">
                <span>Check-out:</span>
                <span>{{ formatarDataHora(reserva.dataCheckout) }}</span>
              </div>
              <div class="info-linha destaque">
                <span>Período:</span>
                <span>{{ quantidadeDiarias }} diária(s)</span>
              </div>
            </div>
            
            <div class="valor-estimado">
              <div>
                <span>Valor por diária:</span>
                <span>R$ {{ valorDiaria | number:'1.2-2' }}</span>
              </div>
              <div class="total">
                <span>Total Estimado:</span>
                <span>R$ {{ valorEstimado | number:'1.2-2' }}</span>
              </div>
            </div>
            <small>* Valor calculado com base na diária de {{ diariaAplicada?.quantidade || quantidadeDiarias }} dia(s)</small>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="voltar()">Cancelar</button>
            <button type="submit" class="btn-save" [disabled]="loading">
              {{ loading ? 'Criando...' : 'Criar Reserva' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 900px;
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

    .btn-back {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #5a6268;
      transform: translateY(-1px);
    }

    .form-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }

    .field-help {
      display: block;
      font-size: 12px;
      color: #666;
      margin-top: 4px;
      font-style: italic;
    }

    /* ✅ ESTILOS DA BUSCA */
    .campo-busca {
      position: relative;
    }

    .busca-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-busca {
      width: 100%;
      padding: 12px;
      padding-right: 40px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .input-busca:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn-limpar-busca {
      position: absolute;
      right: 10px;
      width: 30px;
      height: 30px;
      background: #e0e0e0;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2em;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .btn-limpar-busca:hover {
      background: #d0d0d0;
      color: #333;
    }

    .resultados-busca {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #667eea;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: -2px;
    }

    .resultado-item {
      padding: 12px 15px;
      cursor: pointer;
      transition: background 0.2s ease;
      border-bottom: 1px solid #f0f0f0;
    }

    .resultado-item:last-child {
      border-bottom: none;
    }

    .resultado-item:hover {
      background: #f5f5f5;
    }

    .resultado-nome {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .resultado-cpf {
      font-size: 0.9em;
      color: #7f8c8d;
      margin-bottom: 2px;
    }

    .resultado-info {
      font-size: 0.85em;
      color: #95a5a6;
    }

    .sem-resultado {
      padding: 20px;
      text-align: center;
      color: #e74c3c;
      font-weight: 500;
    }

    .info-box {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .info-box strong {
      color: #2e7d32;
      display: block;
      margin-bottom: 15px;
      font-size: 16px;
    }

    .resumo-info {
      background: white;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }

    .info-linha {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    .info-linha:last-child {
      border-bottom: none;
    }

    .info-linha.destaque {
      font-weight: 600;
      color: #2e7d32;
      border-bottom: 2px solid #4caf50 !important;
      padding-bottom: 10px;
      margin-bottom: 0;
    }

    .info-linha span:first-child {
      color: #666;
    }

    .info-linha span:last-child {
      color: #333;
      font-weight: 500;
    }

    .valor-estimado {
      background: white;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 10px;
    }

    .valor-estimado > div {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .valor-estimado .total {
      border-top: 2px solid #4caf50;
      margin-top: 10px;
      padding-top: 10px;
      font-weight: 600;
      font-size: 18px;
      color: #2e7d32;
    }

    .info-box small {
      color: #666;
      font-size: 12px;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }

    .btn-cancel, .btn-save {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-save {
      background: #28a745;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #218838;
    }

    .btn-save:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReservaFormApp implements OnInit {
  private reservaService = inject(ReservaService);
  private clienteService = inject(ClienteService);
  private apartamentoService = inject(ApartamentoService);
  private diariaService = inject(DiariaService);
  private router = inject(Router);
  private http = inject(HttpClient);  // ✅ ADICIONAR

  reserva: ReservaRequest = {
    clienteId: 0,
    apartamentoId: 0,
    quantidadeHospede: 1,
    dataCheckin: '',
    dataCheckout: ''
  };

  clientes: Cliente[] = [];
  apartamentos: Apartamento[] = [];
  apartamentoSelecionado: Apartamento | null = null;
  diarias: Diaria[] = [];
  diariaAplicada: Diaria | null = null;
 
  // ✅ BUSCA DE CLIENTES
  todosClientes: any[] = [];
  clientesFiltrados: any[] = [];
  buscaCliente = '';
  mostrarResultados = false;

  quantidadeDiarias = 0;
  valorDiaria = 0;
  valorEstimado = 0;
  
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    console.log('🔵 Inicializando ReservaForm');
    this.carregarClientes();
    this.carregarApartamentos();
    this.setDatasPadrao();
  }

  setDatasPadrao(): void {
    const hoje = new Date();
    hoje.setHours(14, 0, 0, 0);
    
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(12, 0, 0, 0);
    
    this.reserva.dataCheckin = this.formatDateTimeLocal(hoje);
    this.reserva.dataCheckout = this.formatDateTimeLocal(amanha);
  }

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatarDataHora(dataHora: string): string {
    if (!dataHora) return '';
    
    const data = new Date(dataHora);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  }

  // ✅ CARREGAR CLIENTES
  carregarClientes(): void {
    this.http.get<any[]>('http://localhost:8080/api/clientes').subscribe({
      next: (data) => {
        this.todosClientes = data;
        this.clientesFiltrados = [];
        console.log('✅ Clientes carregados:', data.length);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar clientes:', err);
      }
    });
  }

  carregarApartamentos(): void {
    console.log('📋 Carregando apartamentos...');
    this.apartamentoService.getDisponiveis().subscribe({
      next: (data) => {
        this.apartamentos = data;
        console.log('✅ Apartamentos carregados:', data.length);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar apartamentos:', err);
      }
    });
  }

  // ✅ MÉTODOS DE BUSCA DE CLIENTE
  filtrarClientes(): void {
    const busca = this.buscaCliente.toLowerCase().trim();
    
    if (busca.length < 2) {
      this.clientesFiltrados = [];
      this.mostrarResultados = false;
      return;
    }

    this.clientesFiltrados = this.todosClientes.filter(cliente => {
      const nome = (cliente.nome || '').toLowerCase();
      const cpf = (cliente.cpf || '').replace(/\D/g, '');
      const buscaSemFormatacao = busca.replace(/\D/g, '');
      
      return nome.includes(busca) || cpf.includes(buscaSemFormatacao);
    });

    this.mostrarResultados = true;
    console.log(`🔍 Busca: "${busca}" - ${this.clientesFiltrados.length} resultados`);
  }

  selecionarCliente(cliente: any): void {
    this.reserva.clienteId = cliente.id;
    this.buscaCliente = `${cliente.nome} - ${this.formatarCPF(cliente.cpf)}`;
    this.clientesFiltrados = [];
    this.mostrarResultados = false;
    
    console.log('✅ Cliente selecionado:', cliente.nome, '- ID:', cliente.id);
  }

  formatarCPF(cpf: string): string {
    if (!cpf) return '';
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  limparBuscaCliente(): void {
    this.buscaCliente = '';
    this.reserva.clienteId = 0;
    this.clientesFiltrados = [];
    this.mostrarResultados = false;
  }

  onClienteChange(): void {
    console.log('👤 Cliente selecionado:', this.reserva.clienteId);
  }

  onApartamentoChange(): void {
    this.apartamentoSelecionado = this.apartamentos.find(a => a.id === this.reserva.apartamentoId) || null;
    console.log('🏠 Apartamento selecionado:', this.apartamentoSelecionado);
    
    if (this.apartamentoSelecionado?.tipoApartamentoId) {
      this.carregarDiarias(this.apartamentoSelecionado.tipoApartamentoId);
    }
  }

  carregarDiarias(tipoApartamentoId: number): void {
    console.log('💰 Carregando diárias do tipo:', tipoApartamentoId);
    this.diariaService.buscarPorTipoApartamento(tipoApartamentoId).subscribe({
      next: (data) => {
        this.diarias = data;
        console.log('✅ Diárias carregadas:', data);
        this.calcularDiarias();
      },
      error: (err) => {
        console.error('❌ Erro ao carregar diárias:', err);
        this.diarias = [];
        this.valorDiaria = 0;
        this.valorEstimado = 0;
      }
    });
  }

  calcularDiarias(): void {
    if (!this.reserva.dataCheckin || !this.reserva.dataCheckout) return;

    const checkin = new Date(this.reserva.dataCheckin);
    const checkout = new Date(this.reserva.dataCheckout);
    
    const diffTime = checkout.getTime() - checkin.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    this.quantidadeDiarias = diffDays > 0 ? diffDays : 0;
    
    if (this.diarias.length > 0 && this.quantidadeDiarias > 0) {
      this.diariaAplicada = this.diarias
        .filter(d => d.quantidade <= this.quantidadeDiarias)
        .sort((a, b) => b.quantidade - a.quantidade)[0] || this.diarias[0];
      
      this.valorDiaria = this.diariaAplicada.valor;
      this.valorEstimado = this.quantidadeDiarias * this.valorDiaria;
      
      console.log('📊 Cálculo realizado:');
      console.log('  - Dias:', this.quantidadeDiarias);
      console.log('  - Diária aplicada:', this.diariaAplicada.quantidade, 'dia(s)');
      console.log('  - Valor unitário:', this.valorDiaria);
      console.log('  - Total:', this.valorEstimado);
    } else {
      this.valorDiaria = 0;
      this.valorEstimado = 0;
      this.diariaAplicada = null;
    }
  }

  salvar(): void {
    console.log('💾 Iniciando criação de reserva...');
    console.log('📝 Estado atual:', this.reserva);
    
    if (!this.validarFormulario()) {
      console.log('⚠️ Validação falhou');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const reservaRequest: ReservaRequest = {
      clienteId: Number(this.reserva.clienteId),
      apartamentoId: Number(this.reserva.apartamentoId),
      quantidadeHospede: Number(this.reserva.quantidadeHospede),
      dataCheckin: new Date(this.reserva.dataCheckin).toISOString(),
      dataCheckout: new Date(this.reserva.dataCheckout).toISOString()
    };

    console.log('📤 Request montado:', reservaRequest);

    this.reservaService.create(reservaRequest).subscribe({
      next: (response) => {
        console.log('✅ Reserva criada com sucesso:', response);
        this.router.navigate(['/reservas']);
      },
      error: (err) => {
        console.error('❌ Erro ao criar reserva:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || err.error || 'Erro ao criar reserva';
      }
    });
  }

  validarFormulario(): boolean {
    console.log('🔍 Validando formulário...');
    
    if (!this.reserva.clienteId || this.reserva.clienteId === 0) {
      this.errorMessage = 'Selecione o cliente';
      return false;
    }
    
    if (!this.reserva.apartamentoId || this.reserva.apartamentoId === 0) {
      this.errorMessage = 'Selecione o apartamento';
      return false;
    }
    
    if (this.reserva.quantidadeHospede < 1) {
      this.errorMessage = 'Quantidade de hóspedes deve ser no mínimo 1';
      return false;
    }
    
    if (this.apartamentoSelecionado && this.reserva.quantidadeHospede > this.apartamentoSelecionado.capacidade) {
      this.errorMessage = `Quantidade de hóspedes excede a capacidade do apartamento (${this.apartamentoSelecionado.capacidade})`;
      return false;
    }
    
    if (!this.reserva.dataCheckin) {
      this.errorMessage = 'Data de check-in é obrigatória';
      return false;
    }
    
    if (!this.reserva.dataCheckout) {
      this.errorMessage = 'Data de check-out é obrigatória';
      return false;
    }
    
    const checkin = new Date(this.reserva.dataCheckin);
    const checkout = new Date(this.reserva.dataCheckout);
    
    if (checkout <= checkin) {
      this.errorMessage = 'Data de check-out deve ser posterior ao check-in';
      return false;
    }
    
    console.log('✅ Formulário válido');
    return true;
  }

  voltar(): void {
    this.router.navigate(['/reservas']);
  }
}