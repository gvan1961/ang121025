// src/app/pages/dashboard/dashboard.app.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-brand">
          <h2>Sistema Divan</h2>
        </div>
        <div class="nav-user">
          <span>{{ nomeUsuario }}</span>
          <button (click)="logout()">Sair</button>
        </div>
      </nav>

      <div class="content">
        <aside class="sidebar">
          <ul class="menu">
            <li>
              <a [class.active]="isActive('/dashboard')" (click)="navigate('/dashboard')">
                📊 Dashboard
              </a>
            </li>
            
            <!-- ✅ RESERVAS ADICIONADO -->
            <li>
              <a [class.active]="isActive('/reservas')" (click)="navigate('/reservas')">
                🏨 Reservas
              </a>
            </li>

            <li>
              <a [class.active]="isActive('/apartamentos')" (click)="navigate('/apartamentos')">
                🏢 Apartamentos
              </a>
            </li>

            <li>
              <a [class.active]="isActive('/tipos-apartamento')" (click)="navigate('/tipos-apartamento')">
                🏷️ Tipos Apartamento
              </a>
            </li>
            
            <li>
              <a [class.active]="isActive('/diarias')" (click)="navigate('/diarias')">
                💰 Diárias
              </a>
            </li>
            
            <li>
              <a [class.active]="isActive('/clientes')" (click)="navigate('/clientes')">
                👥 Clientes
              </a>
            </li>
            
            <li>
              <a [class.active]="isActive('/empresas')" (click)="navigate('/empresas')">
                🏢 Empresas
              </a>
            </li>
            
            <li>
              <a [class.active]="isActive('/produtos')" (click)="navigate('/produtos')">
                📦 Produtos
              </a>
            </li>
            
            <li>
              <a [class.active]="isActive('/categorias')" (click)="navigate('/categorias')">
                🏷️ Categorias
              </a>
            </li>
          </ul>
        </aside>

        <main class="main">
          <div class="welcome">
            <h1>Bem-vindo ao Sistema Divan</h1>
            <p>Selecione uma opção no menu lateral para começar</p>
            
            <div class="cards">
              <!-- ✅ CARD RESERVAS ADICIONADO -->
              <div class="card highlight" (click)="navigate('/reservas')">
                <div class="card-icon">🏨</div>
                <h3>Reservas</h3>
                <p>Gerenciar reservas de hóspedes</p>
              </div>

              <div class="card" (click)="navigate('/apartamentos')">
                <div class="card-icon">🏢</div>
                <h3>Apartamentos</h3>
                <p>Gerenciar apartamentos do hotel</p>
              </div>

              <div class="card" (click)="navigate('/tipos-apartamento')">
                <div class="card-icon">🏷️</div>
                <h3>Tipos Apartamento</h3>
                <p>Gerenciar tipos de apartamentos</p>
              </div>

              <!-- ✅ CARD DIÁRIAS ADICIONADO -->
              <div class="card" (click)="navigate('/diarias')">
                <div class="card-icon">💰</div>
                <h3>Diárias</h3>
                <p>Gerenciar valores de diárias</p>
              </div>

              <div class="card" (click)="navigate('/clientes')">
                <div class="card-icon">👥</div>
                <h3>Clientes</h3>
                <p>Gerenciar clientes do sistema</p>
              </div>

              <div class="card" (click)="navigate('/empresas')">
                <div class="card-icon">🏢</div>
                <h3>Empresas</h3>
                <p>Gerenciar empresas cadastradas</p>
              </div>

              <div class="card" (click)="navigate('/produtos')">
                <div class="card-icon">📦</div>
                <h3>Produtos</h3>
                <p>Gerenciar produtos e estoque</p>
              </div>

              <div class="card" (click)="navigate('/categorias')">
                <div class="card-icon">🏷️</div>
                <h3>Categorias</h3>
                <p>Gerenciar categorias de produtos</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .navbar {
      background: #667eea;
      color: white;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 24px;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .nav-user button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
    }

    .nav-user button:hover {
      background: rgba(255,255,255,0.3);
    }

    .content {
      display: flex;
      min-height: calc(100vh - 70px);
    }

    .sidebar {
      width: 250px;
      background: white;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    }

    .menu {
      list-style: none;
      padding: 20px 0;
      margin: 0;
    }

    .menu li {
      margin: 0;
    }

    .menu a {
      display: block;
      padding: 15px 25px;
      color: #333;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s;
    }

    .menu a:hover {
      background: #f5f5f5;
    }

    .menu a.active {
      background: #667eea;
      color: white;
    }

    .main {
      flex: 1;
      padding: 30px;
    }

    .welcome {
      max-width: 1200px;
    }

    .welcome h1 {
      color: #333;
      margin-bottom: 10px;
    }

    .welcome p {
      color: #666;
      margin-bottom: 40px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    /* ✅ Destaque para Reservas */
    .card.highlight {
      border: 2px solid #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .card.highlight h3,
    .card.highlight p {
      color: white;
    }

    .card-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .card h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .card p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class DashboardApp {
  private authService = inject(AuthService);
  private router = inject(Router);

  nomeUsuario = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomeUsuario = user?.nome || 'Usuário';
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout();
  }

  


}