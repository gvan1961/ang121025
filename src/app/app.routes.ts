import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginApp } from './pages/login/login.app';
import { DashboardApp } from './pages/dashboard/dashboard.app';
import { ClienteListaApp } from './pages/clientes/cliente-lista.app';
import { ClienteFormApp } from './pages/clientes/cliente-form.app';
import { EmpresaListaApp } from './pages/empresas/empresa-lista.app';
import { EmpresaFormApp } from './pages/empresas/empresa-form.app';
import { ProdutoListaApp } from './pages/produtos/produto-lista.app';
import { ProdutoFormApp } from './pages/produtos/produto-form.app';
import { ApartamentoListaApp } from './pages/apartamentos/apartamento-lista.app';
import { ApartamentoFormApp } from './pages/apartamentos/apartamento-form.app';
import { CategoriaListaApp } from './pages/categorias/categoria-lista.app';
import { CategoriaFormApp } from './pages/categorias/categoria-form.app';
import { TipoApartamentoListaApp } from './pages/tipos-apartamento/tipo-apartamento-lista.app';
import { TipoApartamentoFormApp } from './pages/tipos-apartamento/tipo-apartamento-form.app';
import { DiariaListaApp } from './pages/diarias/diaria-lista.app';
import { DiariaFormApp } from './pages/diarias/diaria-form.app';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginApp },
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
  
  // EMPRESAS
  { 
    path: 'empresas', 
    component: EmpresaListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'empresas/novo', 
    component: EmpresaFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'empresas/editar/:id', 
    component: EmpresaFormApp,
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
  { 
    path: 'produtos/editar/:id', 
    component: ProdutoFormApp,
    canActivate: [authGuard]
  },
  
  // CATEGORIAS
  { 
    path: 'categorias', 
    component: CategoriaListaApp,
    canActivate: [authGuard]
  },
  { 
    path: 'categorias/novo', 
    component: CategoriaFormApp,
    canActivate: [authGuard]
  },
  { 
    path: 'categorias/editar/:id', 
    component: CategoriaFormApp,
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
  
  { path: '**', redirectTo: '/login' }
];