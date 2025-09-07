import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppComponent {
  router = inject(Router);
  authService = inject(AuthService);

  isDarkMode = signal(false);
  showUserMenu = signal(false);

  toggleTheme() {
    const currentTheme = this.isDarkMode();
    this.isDarkMode.set(!currentTheme);

    // Update document theme
    document.documentElement.setAttribute(
      'data-theme',
      !currentTheme ? 'dark' : 'light'
    );

    // Store preference
    localStorage.setItem('theme', !currentTheme ? 'dark' : 'light');
  }

  toggleUserMenu() {
    this.showUserMenu.update(show => !show);
  }

  signOut() {
    this.authService.logout();
  }

  constructor() {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialDarkMode = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    this.isDarkMode.set(initialDarkMode);

    document.documentElement.setAttribute(
      'data-theme',
      initialDarkMode ? 'dark' : 'light'
    );

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode.set(e.matches);
        document.documentElement.setAttribute(
          'data-theme',
          e.matches ? 'dark' : 'light'
        );
      }
    });

    // Close user menu when clicking outside
    document.addEventListener('click', (event) => {
      const userMenu = document.querySelector('.user-menu');
      if (userMenu && !userMenu.contains(event.target as Node)) {
        this.showUserMenu.set(false);
      }
    });
  }
}