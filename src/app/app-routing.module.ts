import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthService } from "./guards/auth.service";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    loadChildren: () =>
      import("./home/home.module").then((m) => m.HomePageModule),
    canActivate: [AuthService],
  },
  {
    path: "login",
    loadChildren: () =>
      import("./login/login.module").then((m) => m.LoginPageModule),
    canActivate: [AuthService],
  },
  {
    path: "register",
    loadChildren: () =>
      import("./register/register.module").then((m) => m.RegisterPageModule),
    canActivate: [AuthService],
  },
  {
    path: "dash",
    loadChildren: () =>
      import("./dash/dash.module").then((m) => m.DashPageModule),
    canActivate: [AuthService],
  },
  {
    path: "server",
    loadChildren: () =>
      import("./server/server.module").then((m) => m.ServerPageModule),
    canActivate: [AuthService],
  },
  {
    path: "init",
    loadChildren: () =>
      import("./init/init.module").then((m) => m.InitPageModule),
    canActivate: [AuthService],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
