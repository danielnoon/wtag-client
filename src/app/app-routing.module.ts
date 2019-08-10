import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthService } from './guards/auth.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () =>
      import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthService]
  },
  {
    path: 'login',
    loadChildren: './login/login.module#LoginPageModule',
    canActivate: [AuthService]
  },
  {
    path: 'register',
    loadChildren: './register/register.module#RegisterPageModule',
    canActivate: [AuthService]
  },
  {
    path: 'dash',
    loadChildren: './dash/dash.module#DashPageModule',
    canActivate: [AuthService]
  },
  {
    path: 'server',
    loadChildren: './server/server.module#ServerPageModule',
    canActivate: [AuthService]
  },
  {
    path: 'init',
    loadChildren: './init/init.module#InitPageModule',
    canActivate: [AuthService]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
