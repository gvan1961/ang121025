import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { PagamentoService } from '../../services/pagamento.service';
import { ProdutoService } from '../../services/produto.service';
import { ReservaResponse } from '../../models/reserva.model';
import { Produto } from '../../models/produto.model';

interface PagamentoRequestDTO {
  reservaId: number;
  valor: number;
  formaPagamento: string;
  observacao?: string;
}

@Component({
  selector: 'app-reserva-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🏨 Detalhes da Reserva #{{ reserva?.id }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && reserva">
        
        <!-- Informações Principais -->
        <div class="card-info">
          <div class="card-header">
            <h2>📋 Detalhes da Reserva</h2>
            <span [class]="'badge-status status-' + reserva.status">
              {{ getStatusLabel(reserva.status) }}
            </span>
          </div>

          <div class="grid-info">
            <div class="item-info">
              <label>Cliente:</label>
              <strong>{{ reserva.cliente?.nome || 'N/A' }}</strong>
              <small *ngIf="reserva.cliente?.cpf">CPF: {{ reserva.cliente.cpf }}</small>
            </div>

            <div class="item-info">
              <label>Apartamento:</label>
              <strong>{{ reserva.apartamento?.numeroApartamento }}</strong>
              <small *ngIf="reserva.apartamento?.tipoApartamentoNome">
                Tipo: {{ reserva.apartamento.tipoApartamentoNome }}
              </small>
            </div>

            <div class="item-info">
              <label>Check-in:</label>
              <strong>{{ formatarDataHora(reserva.dataCheckin) }}</strong>
            </div>

            <div class="item-info">
              <label>Check-out:</label>
              <strong>{{ formatarDataHora(reserva.dataCheckout) }}</strong>
              <button 
                *ngIf="reserva.status === 'ATIVA'" 
                class="btn-mini" 
                (click)="abrirModalCheckout()">
                Alterar
              </button>
            </div>

            <div class="item-info">
              <label>Hóspedes:</label>
              <strong>{{ reserva.quantidadeHospede }}</strong>
              <button 
                *ngIf="reserva.status === 'ATIVA'" 
                class="btn-mini" 
                (click)="abrirModalHospedes()">
                Alterar
              </button>
            </div>

            <div class="item-info">
              <label>Diárias:</label>
              <strong>{{ reserva.quantidadeDiaria }}</strong>
            </div>
          </div>
        </div>

        <!-- Resumo Financeiro -->
        <div class="card-financeiro">
          <h2>💰 Resumo Financeiro</h2>
          <div class="lista-valores">
            <div class="linha-valor">
              <span>Total Diárias:</span>
              <strong>R$ {{ reserva.totalDiaria | number:'1.2-2' }}</strong>
            </div>
            <div class="linha-valor">
              <span>Total Produtos:</span>
              <strong>R$ {{ (reserva.totalHospedagem - reserva.totalDiaria) | number:'1.2-2' }}</strong>
            </div>
            <div class="linha-valor">
              <span>Subtotal:</span>
              <strong>R$ {{ reserva.totalHospedagem | number:'1.2-2' }}</strong>
            </div>
            <div class="linha-valor">
              <span>(-) Recebido:</span>
              <strong class="verde">R$ {{ reserva.totalRecebido | number:'1.2-2' }}</strong>
            </div>
            <div class="linha-valor total">
              <span>A Pagar:</span>
              <strong [class.zero]="reserva.totalApagar === 0">
                R$ {{ reserva.totalApagar | number:'1.2-2' }}
              </strong>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="card-acoes" *ngIf="reserva.status === 'ATIVA'">
          <h2>⚙️ Ações</h2>
          <div class="botoes">
            <button class="btn-acao pag" (click)="abrirModalPagamento()">
              💳 Adicionar Pagamento
            </button>
            <button class="btn-acao prod" (click)="abrirModalConsumo()">
              🛒 Adicionar Produto
            </button>
            <button class="btn-acao fin" (click)="abrirModalFinalizar()">
              ✅ Finalizar
            </button>
            <button class="btn-acao canc" (click)="abrirModalCancelar()">
              ❌ Cancelar
            </button>
          </div>
        </div>

        <!-- Botões de Extrato -->
        <div class="card-acoes">
          <h2>📄 Documentos</h2>
          <div class="botoes">
            <button class="btn-acao extrato" (click)="abrirModalExtrato()">
              🧾 Extrato Resumido
            </button>
            <button class="btn-acao extrato-fiscal" (click)="abrirModalExtratoFiscal()">
              📋 Extrato Detalhado
            </button>
          </div>
        </div>

        <!-- Notas de Venda / Consumo -->
        <div class="card-notas" *ngIf="notasVenda && notasVenda.length > 0">
          <h2>🧾 Detalhes de Venda</h2>
          
          <div class="nota-item" *ngFor="let nota of notasVenda">
            <div class="nota-header">
              <div class="nota-info">
                <strong>Nota #{{ nota.id }}</strong>
                <span class="nota-data">{{ formatarDataHora(nota.dataHoraVenda) }}</span>
              </div>
              <div class="nota-acoes">
                <span [class]="'badge-tipo-venda tipo-' + nota.tipoVenda">
                  {{ nota.tipoVenda === 'APARTAMENTO' ? 'Apartamento' : 'À Vista' }}
                </span>
              </div>
            </div>
            
            <table class="tabela-itens">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Qtd</th>
                  <th>Vlr Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of nota.itens">
                  <td>{{ item.produto?.nomeProduto }}</td>
                  <td>
                    <span class="badge-cat">{{ getCategoriaLabel(item.produto?.categoria) }}</span>
                  </td>
                  <td class="centro">{{ item.quantidade }}</td>
                  <td class="direita">R$ {{ item.valorUnitario | number:'1.2-2' }}</td>
                  <td class="direita"><strong>R$ {{ item.totalItem | number:'1.2-2' }}</strong></td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-nota">
                  <td colspan="4"><strong>TOTAL DA NOTA:</strong></td>
                  <td class="direita"><strong class="valor-nota">R$ {{ nota.total | number:'1.2-2' }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="resumo-notas">
            <div class="resumo-item">
              <span class="resumo-label">Total de Notas:</span>
              <span class="resumo-valor">{{ notasVenda.length }}</span>
            </div>
            <div class="resumo-item destaque">
              <span class="resumo-label">TOTAL CONSUMO:</span>
              <span class="total-geral">R$ {{ calcularTotalConsumo() | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Extrato -->
        <div class="card-extrato" *ngIf="reserva.extratos && reserva.extratos.length > 0">
          <h2>📄 Extrato</h2>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Vlr Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ext of reserva.extratos">
                <td>{{ formatarDataHora(ext.dataHoraLancamento) }}</td>
                <td>
                  <span [class]="'badge tipo-' + ext.statusLancamento">
                    {{ ext.statusLancamento }}
                  </span>
                </td>
                <td>{{ ext.descricao }}</td>
                <td class="centro">{{ ext.quantidade || '-' }}</td>
                <td class="direita">
                  {{ ext.valorUnitario ? 'R$ ' + (ext.valorUnitario | number:'1.2-2') : '-' }}
                </td>
                <td class="direita" [class.negativo]="ext.totalLancamento < 0">
                  R$ {{ ext.totalLancamento | number:'1.2-2' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Histórico -->
        <div class="card-historico" *ngIf="reserva.historicos && reserva.historicos.length > 0">
          <h2>📜 Histórico</h2>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let hist of reserva.historicos">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-data">{{ formatarDataHora(hist.dataHora) }}</div>
                <div class="timeline-texto">{{ hist.motivo }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Alterar Hóspedes -->
      <div class="modal" *ngIf="modalHospedes" (click)="fecharModalHospedes()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>👥 Alterar Quantidade de Hóspedes</h3>
          
          <div class="info-atual">
            <div class="info-linha">
              <span>Quantidade Atual:</span>
              <strong>{{ reserva?.quantidadeHospede }} hóspede(s)</strong>
            </div>
            <div class="info-linha">
              <span>Capacidade Máxima:</span>
              <strong>{{ reserva?.apartamento?.capacidade }} pessoa(s)</strong>
            </div>
          </div>
          
          <div class="campo">
            <label>Nova Quantidade de Hóspedes *</label>
            <input type="number" 
                   [(ngModel)]="novaQtdHospedes"
                   min="1" 
                   [max]="reserva?.apartamento?.capacidade || 10"
                   class="input-destaque" />
          </div>
          
          <div class="campo">
            <label>Motivo da Alteração</label>
            <textarea [(ngModel)]="motivoHospedes" 
                      rows="3" 
                      placeholder="Ex: Cliente solicitou incluir mais uma pessoa"></textarea>
          </div>
          
          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalHospedes()">Cancelar</button>
            <button class="btn-pri" 
                    (click)="salvarHospedes()"
                    [disabled]="!novaQtdHospedes || novaQtdHospedes === reserva?.quantidadeHospede">
              💾 Salvar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Alterar Checkout -->
      <div class="modal" *ngIf="modalCheckout" (click)="fecharModalCheckout()">
        <div class="modal-box modal-lg" (click)="$event.stopPropagation()">
          <h3>📅 Alterar Data de Checkout</h3>
          
          <div class="info-atual">
            <div class="info-linha">
              <span>Checkout Atual:</span>
              <strong>{{ formatarDataHora(reserva?.dataCheckout || '') }}</strong>
            </div>
          </div>
          
          <div class="campo">
            <label>Nova Data e Hora de Checkout *</label>
            <input type="datetime-local" 
                   [(ngModel)]="novaDataCheckout"
                   class="input-destaque" />
          </div>
          
          <div class="campo">
            <label>Motivo da Alteração</label>
            <textarea [(ngModel)]="motivoCheckout" 
                      rows="3" 
                      placeholder="Ex: Cliente solicitou extensão de estadia"></textarea>
          </div>
          
          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalCheckout()">Cancelar</button>
            <button class="btn-pri" 
                    (click)="salvarCheckout()"
                    [disabled]="!novaDataCheckout">
              💾 Salvar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Pagamento -->
      <div class="modal" *ngIf="modalPagamento" (click)="fecharModalPagamento()">
        <div class="modal-box modal-lg" (click)="$event.stopPropagation()">
          <h3>💳 Adicionar Pagamento</h3>
          
          <div class="resumo" *ngIf="reserva">
            <div class="resumo-linha">
              <span>Total:</span>
              <strong>R$ {{ reserva.totalHospedagem | number:'1.2-2' }}</strong>
            </div>
            <div class="resumo-linha">
              <span>Recebido:</span>
              <strong class="vd">R$ {{ reserva.totalRecebido | number:'1.2-2' }}</strong>
            </div>
            <div class="resumo-linha dest">
              <span>Saldo:</span>
              <strong class="vlr-dest">R$ {{ reserva.totalApagar | number:'1.2-2' }}</strong>
            </div>
          </div>

          <div class="campo">
            <label>Forma *</label>
            <select [(ngModel)]="pagFormaPagamento">
              <option *ngFor="let f of formasPagamento" [value]="f.codigo">
                {{ f.nome }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Valor *</label>
            <div class="input-rs">
              <span class="pref">R$</span>
              <input type="number" 
                     [(ngModel)]="pagValor" 
                     step="0.01" 
                     min="0.01"
                     [max]="reserva?.totalApagar || 0" />
            </div>
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="pagObs" rows="2"></textarea>
          </div>

          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalPagamento()">Cancelar</button>
            <button class="btn-pri" 
                    (click)="salvarPagamento()"
                    [disabled]="pagValor <= 0">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Adicionar Consumo -->
      <div class="modal" *ngIf="modalConsumo" (click)="fecharModalConsumo()">
        <div class="modal-box modal-lg" (click)="$event.stopPropagation()">
          <h3>🛒 Adicionar Consumo ao Apartamento</h3>
          
          <div class="info-atual" *ngIf="reserva">
            <div class="info-linha">
              <span>Cliente:</span>
              <strong>{{ reserva.cliente?.nome }}</strong>
            </div>
            <div class="info-linha">
              <span>Apartamento:</span>
              <strong>{{ reserva.apartamento?.numeroApartamento }}</strong>
            </div>
          </div>
          
          <div class="campo">
            <label>Selecione o Produto *</label>
            <select [(ngModel)]="produtoSelecionadoId" class="select-produto">
              <option [ngValue]="0">-- Selecione um produto --</option>
              <option *ngFor="let p of produtos" [ngValue]="p.id">
                {{ p.nomeProduto }} - R$ {{ p.valorVenda | number:'1.2-2' }} 
                ({{ p.quantidade }} disponíveis)
              </option>
            </select>
          </div>
          
          <div class="produto-detalhes" *ngIf="getProdutoSelecionado() as produto">
            <div class="detalhe-card">
              <div class="detalhe-linha preco-linha">
                <span>Preço Unitário:</span>
                <strong class="preco-destaque">R$ {{ produto.valorVenda | number:'1.2-2' }}</strong>
              </div>
              <div class="detalhe-linha">
                <span>Estoque:</span>
                <strong>{{ produto.quantidade }} unidades</strong>
              </div>
            </div>
          </div>
          
          <div class="campo">
            <label>Quantidade *</label>
            <input type="number" 
                   [(ngModel)]="quantidadeConsumo"
                   min="1"
                   [max]="getProdutoSelecionado()?.quantidade || 999"
                   class="input-destaque" />
          </div>
          
          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="observacaoConsumo" 
                      rows="2" 
                      placeholder="Ex: Entregar no quarto"></textarea>
          </div>
          
          <div class="preview-total" *ngIf="produtoSelecionadoId > 0 && getProdutoSelecionado()">
            <div class="preview-linha total-preview">
              <span>Total a Adicionar:</span>
              <strong class="valor-total">R$ {{ calcularTotalConsumoModal() | number:'1.2-2' }}</strong>
            </div>
          </div>
          
          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalConsumo()">Cancelar</button>
            <button class="btn-pri" 
                    (click)="salvarConsumo()"
                    [disabled]="!produtoSelecionadoId || produtoSelecionadoId === 0 || quantidadeConsumo <= 0">
              💾 Adicionar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Finalizar -->
      <div class="modal" *ngIf="modalFinalizar" (click)="fecharModalFinalizar()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>✅ Finalizar Reserva</h3>
          
          <div class="info-box" *ngIf="reserva">
            <strong>Cliente:</strong> {{ reserva.cliente?.nome }}<br>
            <strong>Apartamento:</strong> {{ reserva.apartamento?.numeroApartamento }}<br>
            <strong>Total Hospedagem:</strong> R$ {{ reserva.totalHospedagem | number:'1.2-2' }}<br>
            <strong>Total Recebido:</strong> R$ {{ reserva.totalRecebido | number:'1.2-2' }}<br>
            <strong class="saldo-linha" [class.saldo-ok]="reserva.totalApagar === 0" [class.saldo-devedor]="reserva.totalApagar > 0">
              Saldo: R$ {{ reserva.totalApagar | number:'1.2-2' }}
            </strong>
          </div>
          
          <div class="aviso-box aviso-error" *ngIf="reserva && reserva.totalApagar > 0">
            <strong>⚠️ Atenção:</strong>
            <p>Ainda há saldo devedor de R$ {{ reserva.totalApagar | number:'1.2-2' }}. É necessário quitar o valor antes de finalizar.</p>
          </div>
          
          <div class="aviso-box aviso-info" *ngIf="reserva && reserva.totalApagar === 0">
            <strong>ℹ️ Informação:</strong>
            <p>O apartamento ficará em status LIMPEZA após finalizar.</p>
          </div>
          
          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalFinalizar()">Cancelar</button>
            
            <button 
              *ngIf="reserva && reserva.totalApagar > 0"
              class="btn-pri btn-pag" 
              (click)="fecharModalFinalizar(); abrirModalPagamento()">
              💳 Adicionar Pagamento
            </button>
            
            <button 
              *ngIf="reserva && reserva.totalApagar === 0"
              class="btn-pri" 
              (click)="salvarFinalizar()">
              ✅ Finalizar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Extrato RESUMIDO -->
      <div class="modal modal-extrato" *ngIf="modalExtrato" (click)="fecharModalExtrato()">
        <div class="modal-box modal-extrato-box" (click)="$event.stopPropagation()">
          <div class="extrato-header no-print">
            <h3>🧾 Extrato Resumido da Reserva</h3>
            <div class="extrato-acoes">
              <button class="btn-print" (click)="imprimirExtrato()">🖨️ Imprimir</button>
              <button class="btn-close" (click)="fecharModalExtrato()">✕</button>
            </div>
          </div>

          <div class="extrato-conteudo" id="extrato-print">
            
            <div class="extrato-cabecalho">
              <h1>EXTRATO DE HOSPEDAGEM</h1>
              <p class="extrato-numero">Reserva #{{ reserva?.id }}</p>
              <p class="extrato-data">Emitido em: {{ dataAtual() }}</p>
            </div>

            <div class="extrato-secao">
              <h3>📋 Dados da Reserva</h3>
              <div class="extrato-grid">
                <div class="extrato-item">
                  <span>Cliente:</span>
                  <strong>{{ reserva?.cliente?.nome }}</strong>
                </div>
                <div class="extrato-item">
                  <span>CPF:</span>
                  <strong>{{ reserva?.cliente?.cpf }}</strong>
                </div>
                <div class="extrato-item">
                  <span>Apartamento:</span>
                  <strong>{{ reserva?.apartamento?.numeroApartamento }} - {{ reserva?.apartamento?.tipoApartamentoNome }}</strong>
                </div>
                <div class="extrato-item">
                  <span>Período:</span>
                  <strong>{{ formatarDataHora(reserva?.dataCheckin || '') }} até {{ formatarDataHora(reserva?.dataCheckout || '') }}</strong>
                </div>
                <div class="extrato-item">
                  <span>Quantidade de Diárias:</span>
                  <strong>{{ reserva?.quantidadeDiaria }}</strong>
                </div>
                <div class="extrato-item">
                  <span>Hóspedes:</span>
                  <strong>{{ reserva?.quantidadeHospede }}</strong>
                </div>
              </div>
            </div>

            <div class="extrato-secao">
              <h3>💰 Lançamentos</h3>
              <table class="extrato-table" *ngIf="reserva?.extratos?.length">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Qtd</th>
                    <th>Vlr. Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let ext of reserva?.extratos">
                    <td>{{ formatarDataHora(ext.dataHoraLancamento) }}</td>
                    <td>
                      <span [class]="'badge-extrato tipo-' + ext.statusLancamento">
                        {{ ext.statusLancamento }}
                      </span>
                    </td>
                    <td>{{ ext.descricao }}</td>
                    <td class="centro">{{ ext.quantidade || '-' }}</td>
                    <td class="direita">
                      {{ ext.valorUnitario ? 'R$ ' + (ext.valorUnitario | number:'1.2-2') : '-' }}
                    </td>
                    <td class="direita" [class.negativo]="ext.totalLancamento < 0">
                      R$ {{ ext.totalLancamento | number:'1.2-2' }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div *ngIf="!reserva?.extratos?.length" class="sem-lancamentos">  
                <p>📝 Nenhum lançamento registrado até o momento.</p>
              </div>
            </div>

            <div class="extrato-secao extrato-resumo">
              <h3>💳 Resumo Financeiro</h3>
              <div class="extrato-financeiro">
                <div class="linha-financeiro">
                  <span>Total de Diárias:</span>
                  <strong>R$ {{ (reserva?.totalDiaria || 0) | number:'1.2-2' }}</strong>
                </div>
                <div class="linha-financeiro">
                  <span>Total de Produtos/Serviços:</span>
                  <strong>R$ {{ ((reserva?.totalHospedagem || 0) - (reserva?.totalDiaria || 0)) | number:'1.2-2' }}</strong> 
                </div>
                <div class="linha-financeiro subtotal">
                  <span>Subtotal:</span>
                  <strong>R$ {{ (reserva?.totalHospedagem || 0) | number:'1.2-2' }}</strong>
                </div>
                <div class="linha-financeiro">
                  <span>(-) Total Recebido:</span>
                  <strong class="verde">R$ {{ (reserva?.totalRecebido || 0) | number:'1.2-2' }}</strong>
                </div>
                <div class="linha-financeiro total-extrato">
                  <span>SALDO:</span>
                  <strong [class.zero]="(reserva?.totalApagar || 0) === 0" [class.devedor]="(reserva?.totalApagar || 0) > 0">  
                    R$ {{ (reserva?.totalApagar || 0) | number:'1.2-2' }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="extrato-rodape">
              <p>Este é um documento eletrônico válido para fins de comprovação de hospedagem.</p>
              <p class="extrato-assinatura">_________________________________</p>
              <p class="extrato-assinatura-texto">Assinatura do Hóspede</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Extrato FISCAL/DETALHADO -->
      <div class="modal modal-extrato" *ngIf="modalExtratoFiscal" (click)="fecharModalExtratoFiscal()">
        <div class="modal-box modal-extrato-fiscal" (click)="$event.stopPropagation()">
          <div class="extrato-header no-print">
            <h3>📋 Extrato Detalhado - Lançamentos</h3>
            <div class="extrato-acoes">
              <button class="btn-print" (click)="imprimirExtrato()">🖨️ Imprimir</button>
              <button class="btn-close" (click)="fecharModalExtratoFiscal()">✕</button>
            </div>
          </div>

          <div class="extrato-fiscal-conteudo" id="extrato-fiscal-print">
            
            <div class="fiscal-header">
              <div class="fiscal-title">EXTRATO DETALHADO DE HOSPEDAGEM</div>
              <div class="fiscal-reserva">Reserva #{{ reserva?.id }}</div>
            </div>

            <div class="fiscal-info-grid">
              <div class="info-col">
                <div class="info-item">
                  <strong>Apartamento {{ reserva?.apartamento?.numeroApartamento }}</strong>
                </div>
                <div class="info-item">
                  <strong>Tipo {{ reserva?.apartamento?.tipoApartamentoNome }}</strong>
                </div>
                <div class="info-item">
                  <span class="label">Check-in:</span>
                  <span>{{ formatarDataHoraCompacto(reserva?.dataCheckin || '') }}</span>
                </div>
              </div>
              <div class="info-col">
                <div class="info-item">
                  <strong>{{ reserva?.cliente?.nome }}</strong>
                </div>
                <div class="info-item">
                  <span>Qtde Hosp. {{ reserva?.quantidadeHospede }}</span>
                </div>
                <div class="info-item">
                  <span class="label">CPF:</span>
                  <span>{{ formatarCPF(reserva?.cliente?.cpf || '') }}</span>
                </div>
              </div>
            </div>

            <div class="fiscal-separator"></div>

            <div class="fiscal-tabela">
              <table class="tabela-fiscal">
                <thead>
                  <tr>
                    <th class="th-data">Data</th>
                    <th class="th-desc">Descrição</th>
                    <th class="th-qt">QT</th>
                    <th class="th-vlr">Vl. Unit</th>
                    <th class="th-total">Total</th>
                    <th class="th-saldo">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let lanc of calcularExtratoFiscal()" 
                      [class.linha-pagamento]="lanc.statusLancamento === 'PAGAMENTO'">
                    <td class="td-data">{{ formatarDataHoraCompacto(lanc.dataHoraLancamento) }}</td>
                    <td class="td-desc">{{ lanc.descricao }}</td>
                    <td class="td-qt">{{ lanc.quantidade || '-' }}</td>
                    <td class="td-vlr">{{ lanc.valorUnitario ? 'R$ ' + formatarValor(lanc.valorUnitario) : '-' }}</td>
                    <td class="td-total" [class.negativo]="lanc.totalLancamento < 0">
                      R$ {{ formatarValorComSinal(lanc.totalLancamento) }}
                    </td>
                    <td class="td-saldo">
                      <strong>R$ {{ formatarValor(lanc.saldoAcumulado) }}</strong>
                    </td>
                  </tr>

                  <tr *ngIf="!reserva?.extratos?.length">
                    <td colspan="6" class="sem-dados">Nenhum lançamento registrado</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="separador-footer">
                    <td colspan="6"></td>
                  </tr>
                  <tr class="total-debitos">
                    <td colspan="4"><strong>TOTAL DÉBITOS</strong></td>
                    <td colspan="2"><strong>R$ {{ formatarValor(calcularSomaDebitos()) }}</strong></td>
                  </tr>
                  <tr class="total-creditos">
                    <td colspan="4">(-) TOTAL RECEBIDO</td>
                    <td colspan="2" class="verde"><strong>R$ {{ formatarValor(calcularSomaCreditos()) }}</strong></td>
                  </tr>
                  <tr class="saldo-final">
                    <td colspan="4"><strong>SALDO A PAGAR</strong></td>
                    <td colspan="2">
                      <strong class="valor-saldo" 
                              [class.zero]="(reserva?.totalApagar || 0) === 0" 
                              [class.devedor]="(reserva?.totalApagar || 0) > 0">
                        R$ {{ formatarValor(reserva?.totalApagar || 0) }}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="fiscal-footer">
              <p class="footer-data">Emitido em: {{ dataAtual() }}</p>
              <div class="fiscal-assinatura">
                <div class="linha-assinatura"></div>
                <p>Assinatura do Hóspede</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Cancelar -->
      <div class="modal" *ngIf="modalCancelar" (click)="fecharModalCancelar()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>❌ Cancelar Reserva</h3>
          <div class="campo">
            <label>Motivo *</label>
            <textarea [(ngModel)]="motivoCancelamento" rows="3" required></textarea>
          </div>
          <div class="modal-btns">
            <button class="btn-sec" (click)="fecharModalCancelar()">Voltar</button>
            <button class="btn-pri" 
                    (click)="salvarCancelar()"
                    [disabled]="!motivoCancelamento">
              Cancelar Reserva
            </button>
          </div>
        </div>
      </div>  
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    h1 { color: #333; margin: 0; }
    .btn-back { background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; transition: all 0.2s; }
    .btn-back:hover { background: #5a6268; transform: translateY(-1px); }
    .loading { text-align: center; padding: 40px; font-size: 18px; color: #666; }
    
    .card-info, .card-financeiro, .card-acoes, .card-notas, .card-extrato, .card-historico {
      background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h2 { color: #333; margin: 0 0 20px 0; font-size: 20px; }
    
    .badge-status { padding: 6px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; }
    .status-ATIVA { background: #d4edda; color: #155724; }
    .status-FINALIZADA { background: #d1ecf1; color: #0c5460; }
    .status-CANCELADA { background: #f8d7da; color: #721c24; }
    
    .grid-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .item-info { padding: 15px; background: #f8f9fa; border-radius: 5px; }
    .item-info label { display: block; color: #666; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; }
    .item-info strong { display: block; color: #333; font-size: 16px; margin-bottom: 5px; }
    .item-info small { display: block; color: #999; font-size: 12px; }
    .btn-mini { margin-top: 8px; padding: 4px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
    .btn-mini:hover { background: #5568d3; transform: scale(1.05); }
    
    .lista-valores { display: flex; flex-direction: column; gap: 15px; }
    .linha-valor { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .linha-valor.total { border-top: 2px solid #333; border-bottom: none; padding-top: 20px; margin-top: 10px; font-size: 18px; }
    .verde { color: #28a745; }
    .zero { color: #28a745 !important; }
    
    .botoes { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .btn-acao { padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .pag { background: #17a2b8; color: white; }
    .pag:hover { background: #138496; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .prod { background: #ffc107; color: #000; }
    .prod:hover { background: #e0a800; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .fin { background: #28a745; color: white; }
    .fin:hover { background: #218838; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .canc { background: #dc3545; color: white; }
    .canc:hover { background: #c82333; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    
    .btn-acao.extrato { background: #6f42c1; color: white; }
    .btn-acao.extrato:hover { background: #5a32a3; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    
    .btn-acao.extrato-fiscal { background: #17a2b8; color: white; }
    .btn-acao.extrato-fiscal:hover { background: #138496; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    
    .nota-item { border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #fafafa; }
    .nota-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0; }
    .nota-info { display: flex; flex-direction: column; gap: 5px; }
    .nota-data { font-size: 13px; color: #666; }
    .nota-acoes { display: flex; gap: 10px; align-items: center; }
    
    .badge-tipo-venda { padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .tipo-APARTAMENTO { background: #d4edda; color: #155724; }
    .tipo-VISTA { background: #d1ecf1; color: #0c5460; }
    
    .tabela-itens { width: 100%; border-collapse: collapse; background: white; border-radius: 5px; overflow: hidden; }
    .tabela-itens thead { background: #f8f9fa; }
    .tabela-itens th { padding: 10px; text-align: left; font-weight: 600; color: #555; font-size: 13px; }
    .tabela-itens td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    .badge-cat { display: inline-block; padding: 4px 8px; background: #764ba2; color: white; border-radius: 8px; font-size: 11px; font-weight: 600; }
    .total-nota { background: #f8f9fa; font-weight: 600; }
    .valor-nota { color: #667eea; font-size: 16px; }
    
    .resumo-notas { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      padding: 25px; 
      border-radius: 8px; 
      color: white; 
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .resumo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .resumo-item:last-child {
      border-bottom: none;
    }
    
    .resumo-item.destaque {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid rgba(255,255,255,0.4);
      border-bottom: none;
    }
    
    .resumo-label {
      font-size: 14px;
      font-weight: 500;
    }
    
    .resumo-item.destaque .resumo-label {
      font-size: 18px;
      font-weight: 600;
    }
    
    .resumo-valor {
      font-size: 16px;
      font-weight: 600;
    }
    
    .total-geral { 
      font-size: 26px; 
      color: #ffd700; 
      font-weight: 700; 
    } 
    
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8f9fa; }
    th { padding: 12px; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #dee2e6; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .tipo-DIARIA { background: #d4edda; color: #155724; }
    .tipo-PRODUTO { background: #fff3cd; color: #856404; }
    .tipo-PAGAMENTO { background: #d1ecf1; color: #0c5460; }
    .tipo-ESTORNO { background: #f8d7da; color: #721c24; }
    .centro { text-align: center; }
    .direita { text-align: right; }
    .negativo { color: #dc3545; }
    
    .timeline { position: relative; padding-left: 30px; }
    .timeline-item { position: relative; padding-bottom: 20px; }
    .timeline-dot { position: absolute; left: -26px; top: 5px; width: 12px; height: 12px; background: #667eea; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #667eea; }
    .timeline-item::before { content: ''; position: absolute; left: -21px; top: 17px; width: 2px; height: calc(100% - 5px); background: #dee2e6; }
    .timeline-item:last-child::before { display: none; }
    .timeline-data { font-size: 12px; color: #666; margin-bottom: 5px; }
    .timeline-texto { color: #333; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-box { background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 550px; }
    .modal-box h3 { margin: 0 0 20px 0; color: #333; }
    
    .info-atual { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #667eea; }
    .info-linha { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
    .info-linha:last-child { border-bottom: none; }
    .info-linha span { color: #666; font-size: 14px; }
    .info-linha strong { color: #333; font-weight: 600; }
    
    .resumo { background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 8px; margin-bottom: 25px; color: white; }
    .resumo-linha { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .resumo-linha:last-child { border-bottom: none; }
    .resumo-linha.dest { margin-top: 10px; padding-top: 12px; border-top: 2px solid rgba(255,255,255,0.3); border-bottom: none; font-size: 18px; }
    .vd { color: #90ee90; }
    .vlr-dest { font-size: 26px; color: #ffd700; font-weight: 700; }
    
    .campo { margin-bottom: 15px; }
    .campo label { display: block; margin-bottom: 5px; font-weight: 500; color: #555; }
    .campo input, .campo textarea, .campo select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: inherit; box-sizing: border-box; }
    .input-destaque { font-size: 18px !important; font-weight: 600 !important; text-align: center !important; border: 2px solid #667eea !important; background: #f8f9ff !important; }
    .input-rs { position: relative; }
    .pref { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-weight: 600; color: #666; font-size: 16px; }
    .input-rs input { padding-left: 45px; font-size: 18px; font-weight: 600; }
    
    .select-produto { font-size: 14px !important; }
    .produto-detalhes { margin: 20px 0; }
    .detalhe-card { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
    .detalhe-linha { margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .detalhe-linha:last-child { margin-bottom: 0; }
    .preco-destaque { font-size: 20px; color: #667eea; font-weight: 700; }
    
    .preview-total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 20px 0; color: white; }
    .preview-linha { display: flex; justify-content: space-between; padding: 8px 0; }
    .preview-linha.total-preview { font-size: 18px; }
    .valor-total { font-size: 24px; color: #ffd700; font-weight: 700; }
    
    .info-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; line-height: 1.6; }
    
    .saldo-linha { display: block; margin-top: 10px; padding-top: 10px; border-top: 2px solid #dee2e6; font-size: 16px; }
    .saldo-ok { color: #28a745; }
    .saldo-devedor { color: #dc3545; font-weight: 700; }
    
    .aviso-box { padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid; }
    .aviso-box strong { display: block; margin-bottom: 8px; font-size: 14px; }
    .aviso-box p { margin: 0; font-size: 13px; line-height: 1.5; }
    .aviso-info { background: #d1ecf1; border-left-color: #17a2b8; }
    .aviso-info strong { color: #0c5460; }
    .aviso-info p { color: #0c5460; }
    .aviso-error { background: #f8d7da; border-left-color: #dc3545; }
    .aviso-error strong { color: #721c24; }
    .aviso-error p { color: #721c24; }
    
    .modal-btns { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-sec, .btn-pri { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-sec { background: #6c757d; color: white; }
    .btn-sec:hover { background: #5a6268; }
    .btn-pri { background: #28a745; color: white; }
    .btn-pri:hover:not(:disabled) { background: #218838; transform: translateY(-1px); }
    .btn-pri:disabled { background: #ccc; cursor: not-allowed; }
    .btn-pag { background: #17a2b8 !important; }
    .btn-pag:hover { background: #138496 !important; }

    /* ESTILOS DO EXTRATO RESUMIDO */
    .modal-extrato { z-index: 2000; }
    .modal-extrato-box { max-width: 900px; max-height: 95vh; padding: 0; }
    
    .extrato-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 2px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }
    
    .extrato-header h3 { margin: 0; color: white; }
    .extrato-acoes { display: flex; gap: 10px; }
    
    .btn-print {
      padding: 8px 16px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-print:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    
    .btn-close {
      padding: 8px 12px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.2s;
    }
    .btn-close:hover { background: rgba(255,255,255,0.3); }
    
    .extrato-conteudo {
      padding: 30px;
      background: white;
      max-height: calc(95vh - 80px);
      overflow-y: auto;
    }
    
    .extrato-cabecalho {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #667eea;
      margin-bottom: 30px;
    }
    
    .extrato-cabecalho h1 { margin: 0 0 10px 0; color: #333; font-size: 28px; }
    .extrato-numero { font-size: 18px; color: #667eea; font-weight: 600; margin: 5px 0; }
    .extrato-data { font-size: 14px; color: #666; margin: 5px 0; }
    
    .extrato-secao {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .extrato-secao h3 { margin: 0 0 15px 0; color: #333; font-size: 18px; }
    
    .extrato-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .extrato-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .extrato-item span { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; }
    .extrato-item strong { font-size: 14px; color: #333; }
    
    .extrato-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 5px;
      overflow: hidden;
    }
    
    .extrato-table thead { background: #667eea; color: white; }
    .extrato-table th { padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
    .extrato-table td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
    
    .badge-extrato {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .sem-lancamentos {
      text-align: center;
      padding: 40px;
      color: #999;
      font-style: italic;
    }
    
    .extrato-financeiro {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: white;
      padding: 20px;
      border-radius: 5px;
    }
    
    .linha-financeiro {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .linha-financeiro.subtotal { border-bottom: 2px solid #667eea; padding-top: 15px; }
    .linha-financeiro.total-extrato {
      border-top: 3px solid #333;
      border-bottom: none;
      padding-top: 15px;
      margin-top: 10px;
      font-size: 18px;
    }
    
    .linha-financeiro strong.devedor { color: #dc3545; font-weight: 700; font-size: 20px; }
    
    .extrato-rodape {
      text-align: center;
      padding-top: 40px;
      margin-top: 40px;
      border-top: 2px dashed #ccc;
      color: #666;
      font-size: 12px;
    }
    
    .extrato-assinatura {
      margin-top: 60px;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .extrato-assinatura-texto { margin: 0; font-size: 12px; color: #999; }

    /* ESTILOS DO EXTRATO FISCAL */
    .modal-extrato-fiscal { max-width: 850px; }
    
    .extrato-fiscal-conteudo {
      padding: 30px;
      background: white;
      font-family: 'Courier New', monospace;
      max-height: calc(95vh - 80px);
      overflow-y: auto;
      font-size: 13px;
    }
    
    .fiscal-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }
    
    .fiscal-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
    .fiscal-reserva { font-size: 14px; color: #666; }
    
    .fiscal-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
      font-size: 13px;
    }
    
    .info-col {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .info-item {
      display: flex;
      gap: 5px;
    }
    
    .info-item strong { font-weight: bold; }
    .info-item .label { min-width: 70px; }
    
    .fiscal-separator { border-top: 1px dashed #333; margin: 15px 0; }
    
    .fiscal-tabela { margin: 20px 0; }
    
    .tabela-fiscal {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    .tabela-fiscal thead { border-bottom: 1px solid #333; }
    .tabela-fiscal th { padding: 8px 5px; text-align: left; font-weight: bold; font-size: 11px; }
    .tabela-fiscal td { padding: 6px 5px; border-bottom: 1px dotted #ddd; }
    
    .th-data, .td-data { width: 18%; }
    .th-desc, .td-desc { width: 32%; }
    .th-qt, .td-qt { width: 8%; text-align: center; }
    .th-vlr, .td-vlr { width: 14%; text-align: right; }
    .th-total, .td-total { width: 14%; text-align: right; }
    .th-saldo, .td-saldo { width: 14%; text-align: right; font-weight: bold; }
    
    .linha-pagamento { background: #f0f8ff; }
    .sem-dados { text-align: center; padding: 30px; color: #999; font-style: italic; }
    
    .tabela-fiscal tfoot { border-top: 1px solid #333; }
    .separador-footer td { padding: 5px; border: none; }
    .tabela-fiscal tfoot tr { border-bottom: none; }
    .tabela-fiscal tfoot td { padding: 8px 5px; font-weight: bold; border-bottom: none; }
    
    .total-debitos td { padding-top: 10px; }
    .total-creditos td { color: #28a745; }
    .saldo-final { border-top: 2px solid #333; }
    .saldo-final td { padding-top: 12px; font-size: 14px; }
    
    .valor-saldo { font-size: 16px; }
    .valor-saldo.zero { color: #28a745; }
    .valor-saldo.devedor { color: #dc3545; }
    
    .fiscal-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    
    .footer-data { margin-bottom: 40px; }
    .fiscal-assinatura { margin-top: 60px; }
    .linha-assinatura {
      width: 300px;
      border-top: 1px solid #333;
      margin: 0 auto 5px;
    }
    
    @media print {
      .no-print { display: none !important; }
      .modal-extrato { position: static; background: white; }
      .modal-extrato-box { max-width: 100%; box-shadow: none; border-radius: 0; }
      .extrato-conteudo, .extrato-fiscal-conteudo { padding: 20px; max-height: none; }
      .extrato-secao { page-break-inside: avoid; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `]
})
export class ReservaDetalhesApp implements OnInit {
  private reservaService = inject(ReservaService);
  private pagamentoService = inject(PagamentoService);
  private produtoService = inject(ProdutoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reserva: ReservaResponse | null = null;
  loading = true;

  modalHospedes = false;
  modalCheckout = false;
  modalPagamento = false;
  modalConsumo = false;
  modalFinalizar = false;
  modalCancelar = false;
  modalExtrato = false;
  modalExtratoFiscal = false;
   
  novaQtdHospedes = 0;
  motivoHospedes = '';
  
  novaDataCheckout = '';
  motivoCheckout = '';
  
  pagValor = 0;
  pagFormaPagamento = 'PIX';
  pagObs = '';
  
  formasPagamento = [
    { codigo: 'DINHEIRO', nome: 'Dinheiro' },
    { codigo: 'PIX', nome: 'PIX' },
    { codigo: 'CARTAO_DEBITO', nome: 'Cartão Débito' },
    { codigo: 'CARTAO_CREDITO', nome: 'Cartão Crédito' },
    { codigo: 'TRANSFERENCIA_BANCARIA', nome: 'Transferência' },
    { codigo: 'FATURADO', nome: 'Faturado' }
  ];

  produtos: Produto[] = [];
  produtoSelecionadoId: number = 0;
  quantidadeConsumo: number = 1;
  observacaoConsumo: string = '';

  notasVenda: any[] = [];
  motivoCancelamento = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.carregarReserva(+params['id']);
      }
    });
  }

  carregarReserva(id: number): void {
    this.loading = true;
    this.reservaService.getById(id).subscribe({
      next: (data) => {
        this.reserva = data;
        this.loading = false;
        this.carregarNotasVenda();
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        this.loading = false;
        alert('Erro ao carregar reserva');
      }
    });
  }

  carregarNotasVenda(): void {
    if (!this.reserva?.id) return;
    
    this.reservaService.listarNotasVenda(this.reserva.id).subscribe({
      next: (data) => {
        this.notasVenda = data;
      },
      error: (err: any) => {
        console.error('❌ Erro ao carregar notas:', err);
      }
    });
  }

  calcularTotalConsumo(): number {
    return this.notasVenda.reduce((total, nota) => total + (nota.total || 0), 0);
  }

  calcularTotalConsumoModal(): number {
    const produto = this.getProdutoSelecionado();
    if (!produto) return 0;
    return produto.valorVenda * this.quantidadeConsumo;
  }

  abrirModalHospedes(): void {
    if (!this.reserva) return;
    this.novaQtdHospedes = this.reserva.quantidadeHospede;
    this.motivoHospedes = '';
    this.modalHospedes = true;
  }

  fecharModalHospedes(): void {
    this.modalHospedes = false;
  }

  salvarHospedes(): void {
    if (!this.reserva?.id) return;
    this.reservaService.alterarQuantidadeHospedes(
      this.reserva.id,
      this.novaQtdHospedes,
      this.motivoHospedes
    ).subscribe({
      next: () => {
        alert('✅ Quantidade alterada!');
        this.carregarReserva(this.reserva!.id);
        this.fecharModalHospedes();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  abrirModalCheckout(): void {
    if (!this.reserva) return;
    
    const dataAtual = new Date(this.reserva.dataCheckout);
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const hora = String(dataAtual.getHours()).padStart(2, '0');
    const min = String(dataAtual.getMinutes()).padStart(2, '0');
    
    this.novaDataCheckout = `${ano}-${mes}-${dia}T${hora}:${min}`;
    this.motivoCheckout = '';
    this.modalCheckout = true;
  }

  fecharModalCheckout(): void {
    this.modalCheckout = false;
  }

  salvarCheckout(): void {
    if (!this.reserva?.id || !this.novaDataCheckout) return;
    
    const dataISO = new Date(this.novaDataCheckout).toISOString();
    
    this.reservaService.alterarCheckout(
      this.reserva.id,
      dataISO,
      this.motivoCheckout
    ).subscribe({
      next: () => {
        alert('✅ Checkout alterado!');
        this.carregarReserva(this.reserva!.id);
        this.fecharModalCheckout();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.error || err.message));
      }
    });
  }

  abrirModalPagamento(): void {
    if (!this.reserva) return;
    this.pagValor = Number(this.reserva.totalApagar);
    this.pagFormaPagamento = 'PIX';
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

    if (this.pagValor <= 0) {
      alert('Valor inválido');
      return;
    }

    if (this.pagValor > this.reserva.totalApagar) {
      alert(`Valor maior que saldo (R$ ${this.reserva.totalApagar.toFixed(2)})`);
      return;
    }

    const dto: PagamentoRequestDTO = {
      reservaId: this.reserva.id,
      valor: this.pagValor,
      formaPagamento: this.pagFormaPagamento,
      observacao: this.pagObs || undefined
    };

    this.pagamentoService.processarPagamento(dto).subscribe({
      next: () => {
        alert('✅ Pagamento registrado!');
        this.fecharModalPagamento();
        this.carregarReserva(this.reserva!.id);
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  carregarProdutosDisponiveis(): void {
    this.produtoService.listarDisponiveis().subscribe({
      next: (data) => {
        this.produtos = data;
        if (data.length === 0) {
          alert('⚠️ Nenhum produto disponível!');
        }
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('Erro ao carregar produtos');
      }
    });
  }

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

  getProdutoSelecionado(): Produto | undefined {
    const id = Number(this.produtoSelecionadoId);
    return this.produtos.find(p => p.id === id);
  }

  salvarConsumo(): void {
    if (!this.reserva?.id) {
      alert('Reserva não encontrada');
      return;
    }

    if (!this.produtoSelecionadoId || this.produtoSelecionadoId === 0) {
      alert('Selecione um produto');
      return;
    }

    if (this.quantidadeConsumo <= 0) {
      alert('Quantidade inválida');
      return;
    }

    const produtoId = Number(this.produtoSelecionadoId);
    const produto = this.getProdutoSelecionado();

    if (!produto) {
      alert('Produto não encontrado');
      return;
    }

    if (this.quantidadeConsumo > produto.quantidade) {
      alert(`Estoque insuficiente. Disponível: ${produto.quantidade}`);
      return;
    }

    this.reservaService.adicionarConsumo(
      this.reserva.id,
      produtoId,
      this.quantidadeConsumo,
      this.observacaoConsumo
    ).subscribe({
      next: () => {
        alert('✅ Produto adicionado!');
        this.carregarReserva(this.reserva!.id);
        this.fecharModalConsumo();
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  getCategoriaLabel(categoria: any): string {
    return categoria?.nome || 'Sem categoria';
  }

  abrirModalFinalizar(): void {
    this.modalFinalizar = true;
  }

  fecharModalFinalizar(): void {
    this.modalFinalizar = false;
  }

  salvarFinalizar(): void {
    if (!this.reserva?.id) return;
    
    if (this.reserva.totalApagar > 0) {
      this.fecharModalFinalizar();
      alert(`⚠️ Atenção!\n\nAinda há saldo devedor de R$ ${this.reserva.totalApagar.toFixed(2)}.\n\nAdicione o pagamento antes de finalizar a reserva.`);
      setTimeout(() => {
        this.abrirModalPagamento();
      }, 100);
      return;
    }
    
    if (!confirm('Confirma a finalização da reserva?\n\nO apartamento ficará em status LIMPEZA.')) {
      return;
    }
    
    this.reservaService.finalizar(this.reserva.id).subscribe({
      next: () => {
        alert('✅ Reserva finalizada com sucesso!');
        this.carregarReserva(this.reserva!.id);
        this.fecharModalFinalizar();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  abrirModalCancelar(): void {
    this.motivoCancelamento = '';
    this.modalCancelar = true;
  }

  fecharModalCancelar(): void {
    this.modalCancelar = false;
  }

  salvarCancelar(): void {
    if (!this.reserva?.id || !this.motivoCancelamento) return;
    this.reservaService.cancelar(this.reserva.id, this.motivoCancelamento).subscribe({
      next: () => {
        alert('✅ Reserva cancelada!');
        this.carregarReserva(this.reserva!.id);
        this.fecharModalCancelar();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  // MÉTODOS DE EXTRATO
  abrirModalExtrato(): void {
    this.modalExtrato = true;
  }

  fecharModalExtrato(): void {
    this.modalExtrato = false;
  }

  abrirModalExtratoFiscal(): void {
  console.log('🔵 Abrindo extrato fiscal...');
  console.log('🔵 Reserva:', this.reserva);
  console.log('🔵 Extratos:', this.reserva?.extratos);
  console.log('🔵 Quantidade de extratos:', this.reserva?.extratos?.length);
  
  if (!this.reserva?.extratos || this.reserva.extratos.length === 0) {
    console.warn('⚠️ ATENÇÃO: Nenhum extrato encontrado!');
    alert('⚠️ Esta reserva não possui lançamentos registrados.');
  } else {
    console.log('✅ Extratos encontrados:', this.reserva.extratos);
  }
  
  this.modalExtratoFiscal = true;
}

  fecharModalExtratoFiscal(): void {
    this.modalExtratoFiscal = false;
  }

  imprimirExtrato(): void {
    window.print();
  }

  dataAtual(): string {
    const hoje = new Date();
    return this.formatarDataHora(hoje.toISOString());
  }

  calcularExtratoFiscal(): any[] {
    if (!this.reserva?.extratos || this.reserva.extratos.length === 0) {
      return [];
    }

    const lancamentos = [...this.reserva.extratos].sort((a, b) => {
      return new Date(a.dataHoraLancamento).getTime() - new Date(b.dataHoraLancamento).getTime();
    });

    let saldoAcumulado = 0;
    return lancamentos.map(lanc => {
      saldoAcumulado += lanc.totalLancamento;
      return {
        ...lanc,
        saldoAcumulado: saldoAcumulado
      };
    });
  }

  calcularSomaDebitos(): number {
    if (!this.reserva?.extratos) return 0;
    
    return this.reserva.extratos
      .filter(e => e.statusLancamento !== 'PAGAMENTO')
      .reduce((total, e) => total + e.totalLancamento, 0);
  }

  calcularSomaCreditos(): number {
    if (!this.reserva?.extratos) return 0;
    
    return this.reserva.extratos
      .filter(e => e.statusLancamento === 'PAGAMENTO')
      .reduce((total, e) => total + Math.abs(e.totalLancamento), 0);
  }

  formatarDataHoraCompacto(data: string): string {
    if (!data) return '';
    
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');
    
    return `${dia}.${mes}.${ano} ${hora}:${minuto}`;
  }

  formatarCPF(cpf: string): string {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
  }

  formatarValorComSinal(valor: number): string {
    if (valor < 0) {
      return '-' + Math.abs(valor).toFixed(2).replace('.', ',');
    }
    return valor.toFixed(2).replace('.', ',');
  }

  // MÉTODOS AUXILIARES
  voltar(): void {
    this.router.navigate(['/reservas']);
  }

  formatarDataHora(data: string): string {
    if (!data) return 'N/A';
    
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'ATIVA': 'Ativa',
      'FINALIZADA': 'Finalizada',
      'CANCELADA': 'Cancelada'
    };
    return labels[status] || status;
  }
}

