import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
        title: 'Anasayfa',
    },
    {
        path: 'cards',
        loadComponent: () => import('./pages/cards/cards').then((m) => m.Cards),
        title: 'Kartlar',
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
        title: 'Giriş Yap',
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
        title: 'Kayıt Ol',
    },
    { path: '**', redirectTo: '' },
];
