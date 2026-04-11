import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EstoqueComponent } from './pages/estoque/estoque.component';
import { NotasFiscaisComponent } from './pages/notas-fiscais/notas-fiscais.component';
import { EmitirNotaComponent } from './pages/emitir-nota/emitir-nota.component';

export const routes: Routes = [
  { path: '',       component: DashboardComponent, title: 'Dashboard — SistemaNFe' },
  { path: 'estoque', component: EstoqueComponent,  title: 'Estoque — SistemaNFe' },
  { path: 'notas',  component: NotasFiscaisComponent, title: 'Notas Fiscais — SistemaNFe' },
  { path: 'emitir', component: EmitirNotaComponent,   title: 'Emitir NF — SistemaNFe' },
  { path: '**',     redirectTo: '' },
];
