import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApartamentoService } from '../../services/apartamento.service';
import { TipoApartamentoService } from '../../services/tipo-apartamento.service';
import { ApartamentoRequest } from '../../models/apartamento.model';
import { TipoApartamento } from '../../models/tipo-apartamento.model';

@Component({
  selector: 'app-apartamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEdit ? 'Editar Apartamento' : 'Novo Apartamento' }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <div class="form-row">
            <div class="form-group">
              <label>Número do Apartamento *</label>
              <input type="text" [(ngModel)]="apartamento.numeroApartamento" name="numeroApartamento" required />
            </div>

            <div class="form-group">
              <label>Tipo de Apartamento *</label>
              <select [(ngModel)]="apartamento.tipoApartamentoId" name="tipoApartamentoId" required>
                <option [value]="undefined">Selecione o tipo</option>
                <option *ngFor="let tipo of tiposApartamento" [value]="tipo.id">
                  {{ tipo.tipo }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Capacidade *</label>
              <input type="number" [(ngModel)]="apartamento.capacidade" name="capacidade" required min="1" />
            </div>

            <div class="form-group">
              <label>Número de Camas *</label>
              <input type="number" [(ngModel)]="apartamento.camasDoApartamento" name="camasDoApartamento" required min="1" />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="apartamento.tv" name="tv" />
              Possui TV
            </label>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="voltar()">Cancelar</button>
            <button type="submit" class="btn-save" [disabled]="loading">
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
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
    }

    .btn-back:hover {
      background: #5a6268;
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

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
      cursor: pointer;
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
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-save {
      background: #667eea;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #5568d3;
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
export class ApartamentoFormApp implements OnInit {
  private apartamentoService = inject(ApartamentoService);
  private tipoApartamentoService = inject(TipoApartamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  apartamento: ApartamentoRequest = {
    numeroApartamento: '',
    tipoApartamentoId: 0,
    capacidade: 1,
    camasDoApartamento: 1,
    tv: false
  };

  tiposApartamento: TipoApartamento[] = [];
  loading = false;
  errorMessage = '';
  isEdit = false;
  apartamentoId?: number;

  ngOnInit(): void {
    this.carregarTiposApartamento();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.apartamentoId = +params['id'];
        this.carregarApartamento(this.apartamentoId);
      }
    });
  }

  carregarTiposApartamento(): void {
    this.tipoApartamentoService.getAll().subscribe({
      next: (data) => {
        this.tiposApartamento = data;
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de apartamento', err);
      }
    });
  }

  carregarApartamento(id: number): void {
    this.apartamentoService.getById(id).subscribe({
      next: (data) => {
        this.apartamento = {
          numeroApartamento: data.numeroApartamento,
          tipoApartamentoId: data.tipoApartamentoId,
          capacidade: data.capacidade,
          camasDoApartamento: data.camasDoApartamento,
          tv: data.tv || false
        };
      },
      error: (err) => {
        console.error('Erro ao carregar apartamento', err);
        this.errorMessage = 'Erro ao carregar apartamento';
      }
    });
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const apartamentoRequest: ApartamentoRequest = {
      numeroApartamento: this.apartamento.numeroApartamento,
      tipoApartamentoId: this.apartamento.tipoApartamentoId,
      capacidade: this.apartamento.capacidade,
      camasDoApartamento: this.apartamento.camasDoApartamento,
      tv: this.apartamento.tv
    };

    const request = this.isEdit
      ? this.apartamentoService.update(this.apartamentoId!, apartamentoRequest)
      : this.apartamentoService.create(apartamentoRequest);

    request.subscribe({
      next: () => {
        this.router.navigate(['/apartamentos']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao salvar apartamento';
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.apartamento.numeroApartamento || !this.apartamento.tipoApartamentoId || 
        this.apartamento.capacidade < 1 || this.apartamento.camasDoApartamento < 1) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/apartamentos']);
  }
}