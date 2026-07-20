import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { Myitems } from './components/myitems/myitems';
import { Postitem } from './components/postitem/postitem';
import { Claims } from './components/claims/claims';
import { Profile } from './components/profile/profile';
import { Itemdetails } from './components/itemdetails/itemdetails';
import { Edititem } from './components/edititem/edititem';
import { Browse } from './components/browse/browse';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'browse', component: Browse, canActivate: [authGuard] },
  { path: 'my-items', component: Myitems, canActivate: [authGuard] },
  { path: 'post-item', component: Postitem, canActivate: [authGuard] },
  { path: 'claims', component: Claims, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'items/:id', component: Itemdetails, canActivate: [authGuard] },
  { path: 'items/:id/edit', component: Edititem, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
