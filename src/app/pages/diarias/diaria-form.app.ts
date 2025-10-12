import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiariaService } from '../../services/diaria.service';
import { TipoApartamentoService } from '../../services/tipo-apartamento.service';
import { DiariaRequest } from '../../models/diaria.model';
import { TipoApartamento } from '../../models/tipo-apartamento.model';

@Component({
  selector: 'app-diaria-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEdit ? 'Editar Diária' : 'Nova Diária' }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Tipo de Apartamento *</label>
            <select [(ngModel)]="diaria.tipoApartamentoId" name="tipoApartamentoId" required>
              <option [value]="undefined">Selecione o tipo</option>
              <option *ngFor="let tipo of tiposApartamento" [value]="tipo.id">
                Tipo {{ tipo.tipo }} {{ tipo.descricao ? '- ' + tipo.descricao : '' }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Quantidade *</label>
              <input type="number" [(ngModel)]="diaria.quantidade" name="quantidade" required min="1" />
              <small>Quantidade de diárias disponíveis</small>
            </div>

            <div class="form-group">
              <label>Valor (R$) *</label>
              <input type="number" [(ngModel)]="diaria.valor" name="valor" required min="0" step="0.01" />
              <small>Valor da diária</small>
            </div>
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

    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    small {
      display: block;
      color: #666;
      font-size: 12px;
      margin-top: 5px;
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
export class DiariaFormApp implements OnInit {
  private diariaService = inject(DiariaService);
  private tipoApartamentoService = inject(TipoApartamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  diaria: DiariaRequest = {
    tipoApartamentoId: 0,
    quantidade: 1,
    valor: 0
  };

  tiposApartamento: TipoApartamento[] = [];
  loading = false;
  errorMessage = '';
  isEdit = false;
  diariaId?: number;

  ngOnInit(): void {
    this.carregarTiposApartamento();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.diariaId = +params['id'];
        this.carregarDiaria(this.diariaId);
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

  carregarDiaria(id: number): void {
    this.diariaService.getById(id).subscribe({
      next: (data) => {
        this.diaria = {
          tipoApartamentoId: data.tipoApartamentoId,
          quantidade: data.quantidade,
          valor: data.valor
        };
      },
      error: (err) => {
        console.error('Erro ao carregar diária', err);
        this.errorMessage = 'Erro ao carregar diária';
      }
    });
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const diariaRequest: DiariaRequest = {
      tipoApartamentoId: this.diaria.tipoApartamentoId,
      quantidade: this.diaria.quantidade,
      valor: this.diaria.valor
    };

    const request = this.isEdit
      ? this.diariaService.update(this.diariaId!, diariaRequest)
      : this.diariaService.create(diariaRequest);

    request.subscribe({
      next: () => {
        this.router.navigate(['/diarias']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao salvar diária';
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.diaria.tipoApartamentoId || this.diaria.quantidade < 1 || this.diaria.valor < 0) {
      this.errorMessage = 'Preencha todos os campos obrigatórios corretamente';
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/diarias']);
  }
}