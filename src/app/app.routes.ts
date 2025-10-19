import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// IMPORTS
import { LoginApp } from './pages/login/login.app';
import { DashboardApp } from './pages/dashboard/dashboard.app';
import { ClienteListaApp } from './pages/clientes/cliente-lista.app';
import { ClienteFormApp } from './pages/clientes/cliente-form.app';
import { ApartamentoListaApp } from './pages/apartamentos/apartamento-lista.app';
import { ApartamentoFormApp } from './pages/apartamentos/apartamento-form.app';
import { TipoApartamentoListaApp } from './pages/tipos-apartamento/tipo-apartamento-lista.app';
import { TipoApartamentoFormApp } from './pages/tipos-apartamento/tipo-apartamento-form.app';
import { CategoriaListaApp } from './pages/categorias/categoria-lista.app';
import { CategoriaFormApp } from './pages/categorias/categoria-form.app';
import { EmpresaListaApp } from './pages/empresas/empresa-lista.app';
import { EmpresaFormApp } from './pages/empresas/empresa-form.app';
import { DiariaListaApp } from './pages/diarias/diaria-lista.app';
import { DiariaFormApp } from './pages/diarias/diaria-form.app';
import { ProdutoListaApp } from './pages/produtos/produto-lista.app';
import { ProdutoFormApp } from './pages/produtos/produto-form.app';
import { ReservaListaApp } from './pages/reservas/reserva-lista.app';
import { ReservaFormApp } from './pages/reservas/reserva-form.app';
import { ReservaDetalhesApp } from './pages/reservas/reserva-detalhes.app';

// ✅ ADICIONAR ESTE IMPORT
import { ApartamentosGestaoApp } from './pages/apartamentos/apartamentos-gestao.app';

export const routes: Routes = [
  // AUTH
  { path: 'login', component: LoginApp },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // DASHBOARD
  { 
    path: 'dashboard', 
    component: DashboardApp,
    canActivate: [authGuard]
  },

  // CLIENTES
  { 
    path: 'clientes', 
    component: ClienteListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'clientes/novo', 
    component: ClienteFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'clientes/editar/:id', 
    component: ClienteFormApp,
    canActivate: [authGuard]
  },

  // PRODUTOS
  { 
    path: 'produtos', 
    component: ProdutoListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'produtos/novo', 
    component: ProdutoFormApp,
    canActivate: [authGuard]
  },

  // APARTAMENTOS
  { 
    path: 'apartamentos', 
    component: ApartamentoListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'apartamentos/novo', 
    component: ApartamentoFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'apartamentos/editar/:id', 
    component: ApartamentoFormApp,
    canActivate: [authGuard]
  },
  // ✅ GESTÃO DE APARTAMENTOS - CORRIGIDO
  { 
    path: 'apartamentos/gestao', 
    component: ApartamentosGestaoApp,
    canActivate: [authGuard]
  },

  // TIPOS DE APARTAMENTO
  { 
    path: 'tipos-apartamento', 
    component: TipoApartamentoListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'tipos-apartamento/novo', 
    component: TipoApartamentoFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'tipos-apartamento/editar/:id', 
    component: TipoApartamentoFormApp,
    canActivate: [authGuard]
  },

  // DIÁRIAS
  { 
    path: 'diarias', 
    component: DiariaListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'diarias/novo', 
    component: DiariaFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'diarias/editar/:id', 
    component: DiariaFormApp,
    canActivate: [authGuard]
  },

  // RESERVAS
  {
    path: 'reservas',
    component: ReservaListaApp,
    canActivate: [authGuard]
  },
  {
    path: 'reservas/novo',
    component: ReservaFormApp,
    canActivate: [authGuard]
  },
  {
    path: 'reservas/detalhes/:id',
    component: ReservaDetalhesApp,
    canActivate: [authGuard]
  },

  // CATEGORIAS
  { 
    path: 'categorias', 
    component: CategoriaListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'categorias/nova', 
    component: CategoriaFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'categorias/editar/:id', 
    component: CategoriaFormApp,
    canActivate: [authGuard]
  },

  // EMPRESAS
  { 
    path: 'empresas', 
    component: EmpresaListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'empresas/nova', 
    component: EmpresaFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'empresas/editar/:id', 
    component: EmpresaFormApp,
    canActivate: [authGuard]
  },

  // REDIRECT
  { path: '**', redirectTo: '/dashboard' }
];