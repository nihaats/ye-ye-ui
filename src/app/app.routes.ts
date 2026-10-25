import { Routes } from '@angular/router';
import { activateLang, matchLang, redirectToLang } from './i18n/i18n';

export const routes: Routes = [
    {
        path: ':lang',
        canMatch: [matchLang],
        canActivate: [activateLang],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/home/home').then((m) => m.Home),
                title: 'nav.home',
            },
            {
                path: 'cards',
                loadComponent: () => import('./pages/cards/cards').then((m) => m.Cards),
                title: 'nav.cards',
            },
            {
                path: 'login',
                loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
                title: 'nav.login',
            },
            {
                path: 'register',
                loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
                title: 'nav.register',
            },
            { path: '**', redirectTo: '' },
        ],
    },
    { path: '**', redirectTo: redirectToLang },
];
