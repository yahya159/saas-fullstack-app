import { Injectable, signal, computed } from '@angular/core';

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [locale: string]: Translation;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLocale = signal<string>('en');
  private translations = signal<Translations>({
    en: {
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.close': 'Close',
      'common.yes': 'Yes',
      'common.no': 'No',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.widgets': 'Pricing Widgets',
      'nav.plans': 'Plans',
      'nav.profile': 'Profile',
      'nav.admin': 'Admin',
      'nav.logout': 'Logout',
      
      // Signup
      'signup.title': 'Create an account',
      'signup.username': 'Username',
      'signup.firstname': 'First Name',
      'signup.lastname': 'Last Name',
      'signup.email': 'Email',
      'signup.phone': 'Phone Number',
      'signup.streetAddr': 'Street Address',
      'signup.streetAddr2': 'Street Address Line 2',
      'signup.city': 'City',
      'signup.state': 'State / Province',
      'signup.zipCode': 'Postal / Zip Code',
      'signup.submit': 'Create Account',
      'signup.creating': 'Creating Account...',
      
      // Validation
      'validation.required': 'This field is required',
      'validation.email': 'Please enter a valid email address',
      'validation.minlength': 'Must be at least {min} characters',
      'validation.maxlength': 'Must not exceed {max} characters',
      'validation.pattern': 'Invalid format',
      
      // Dashboard
      'dashboard.welcome': 'Welcome, {name}!',
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.createWidget': 'Create Widget',
      'dashboard.viewPlans': 'View Plans',
      'dashboard.profileSettings': 'Profile Settings',
      'dashboard.accountInfo': 'Account Information',
      'dashboard.recentActivity': 'Recent Activity',
      'dashboard.plan': 'Plan',
      'dashboard.status': 'Status',
      'dashboard.verified': 'Verified',
      'dashboard.pendingVerification': 'Pending Verification',
      
      // Widget Builder
      'widget.title': 'Pricing Widget Builder',
      'widget.selectWidget': 'Select a widget...',
      'widget.newWidget': 'New Widget',
      'widget.templates': 'Templates',
      'widget.blocks': 'Blocks',
      'widget.theme': 'Theme',
      'widget.properties': 'Properties',
      'widget.livePreview': 'Live Preview',
      'widget.showPreview': 'Show Preview',
      'widget.hidePreview': 'Hide Preview',
      'widget.export': 'Export',
      
      // Notifications
      'notification.accountCreated': 'Account Created!',
      'notification.accountCreatedMessage': 'Your account has been created successfully. Please check your email for verification instructions.',
      'notification.signupFailed': 'Signup Failed',
      'notification.emailExists': 'An account with this email already exists.',
      'notification.usernameExists': 'This username is already taken. Please choose another.',
      'notification.networkError': 'Network error. Please check your connection and try again.',
      'notification.loggedOut': 'Logged Out',
      'notification.loggedOutMessage': 'You have been successfully logged out.',
      'notification.connectionRestored': 'Connection Restored',
      'notification.connectionRestoredMessage': 'You are back online!',
      'notification.connectionLost': 'Connection Lost',
      'notification.connectionLostMessage': 'You are currently offline. Some features may not work.',
      
      // Theme
      'theme.light': 'Light Mode',
      'theme.dark': 'Dark Mode',
      'theme.auto': 'Auto (System)',
      'theme.accentColor': 'Accent Color',
      'theme.radiusScale': 'Border Radius Scale',
      'theme.currency': 'Currency',
      'theme.reset': 'Reset to Default',
      
      // Errors
      'error.pageNotFound': 'Page Not Found',
      'error.pageNotFoundMessage': 'The page you\'re looking for doesn\'t exist or has been moved.',
      'error.goToDashboard': 'Go to Dashboard',
      'error.backToHome': 'Back to Home',
      'error.accessDenied': 'Access Denied',
      'error.accessDeniedMessage': 'You do not have permission to access this feature.',
      'error.authenticationRequired': 'Authentication Required',
      'error.authenticationRequiredMessage': 'Please log in to access this page.'
    },
    fr: {
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.cancel': 'Annuler',
      'common.save': 'Enregistrer',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.create': 'Créer',
      'common.close': 'Fermer',
      'common.yes': 'Oui',
      'common.no': 'Non',
      
      // Navigation
      'nav.dashboard': 'Tableau de bord',
      'nav.widgets': 'Widgets de tarification',
      'nav.plans': 'Plans',
      'nav.profile': 'Profil',
      'nav.admin': 'Administration',
      'nav.logout': 'Déconnexion',
      
      // Signup
      'signup.title': 'Créer un compte',
      'signup.username': 'Nom d\'utilisateur',
      'signup.firstname': 'Prénom',
      'signup.lastname': 'Nom de famille',
      'signup.email': 'E-mail',
      'signup.phone': 'Numéro de téléphone',
      'signup.streetAddr': 'Adresse',
      'signup.streetAddr2': 'Adresse ligne 2',
      'signup.city': 'Ville',
      'signup.state': 'État / Province',
      'signup.zipCode': 'Code postal',
      'signup.submit': 'Créer le compte',
      'signup.creating': 'Création du compte...',
      
      // Validation
      'validation.required': 'Ce champ est obligatoire',
      'validation.email': 'Veuillez saisir une adresse e-mail valide',
      'validation.minlength': 'Doit contenir au moins {min} caractères',
      'validation.maxlength': 'Ne doit pas dépasser {max} caractères',
      'validation.pattern': 'Format invalide',
      
      // Dashboard
      'dashboard.welcome': 'Bienvenue, {name} !',
      'dashboard.quickActions': 'Actions rapides',
      'dashboard.createWidget': 'Créer un widget',
      'dashboard.viewPlans': 'Voir les plans',
      'dashboard.profileSettings': 'Paramètres du profil',
      'dashboard.accountInfo': 'Informations du compte',
      'dashboard.recentActivity': 'Activité récente',
      'dashboard.plan': 'Plan',
      'dashboard.status': 'Statut',
      'dashboard.verified': 'Vérifié',
      'dashboard.pendingVerification': 'Vérification en attente',
      
      // Widget Builder
      'widget.title': 'Générateur de widgets de tarification',
      'widget.selectWidget': 'Sélectionner un widget...',
      'widget.newWidget': 'Nouveau widget',
      'widget.templates': 'Modèles',
      'widget.blocks': 'Blocs',
      'widget.theme': 'Thème',
      'widget.properties': 'Propriétés',
      'widget.livePreview': 'Aperçu en direct',
      'widget.showPreview': 'Afficher l\'aperçu',
      'widget.hidePreview': 'Masquer l\'aperçu',
      'widget.export': 'Exporter',
      
      // Notifications
      'notification.accountCreated': 'Compte créé !',
      'notification.accountCreatedMessage': 'Votre compte a été créé avec succès. Veuillez vérifier votre e-mail pour les instructions de vérification.',
      'notification.signupFailed': 'Échec de l\'inscription',
      'notification.emailExists': 'Un compte avec cet e-mail existe déjà.',
      'notification.usernameExists': 'Ce nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.',
      'notification.networkError': 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.',
      'notification.loggedOut': 'Déconnecté',
      'notification.loggedOutMessage': 'Vous avez été déconnecté avec succès.',
      'notification.connectionRestored': 'Connexion rétablie',
      'notification.connectionRestoredMessage': 'Vous êtes de nouveau en ligne !',
      'notification.connectionLost': 'Connexion perdue',
      'notification.connectionLostMessage': 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent ne pas fonctionner.',
      
      // Theme
      'theme.light': 'Mode clair',
      'theme.dark': 'Mode sombre',
      'theme.auto': 'Automatique (Système)',
      'theme.accentColor': 'Couleur d\'accent',
      'theme.radiusScale': 'Échelle du rayon de bordure',
      'theme.currency': 'Devise',
      'theme.reset': 'Réinitialiser par défaut',
      
      // Errors
      'error.pageNotFound': 'Page non trouvée',
      'error.pageNotFoundMessage': 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      'error.goToDashboard': 'Aller au tableau de bord',
      'error.backToHome': 'Retour à l\'accueil',
      'error.accessDenied': 'Accès refusé',
      'error.accessDeniedMessage': 'Vous n\'avez pas la permission d\'accéder à cette fonctionnalité.',
      'error.authenticationRequired': 'Authentification requise',
      'error.authenticationRequiredMessage': 'Veuillez vous connecter pour accéder à cette page.'
    }
  });

  readonly locale = this.currentLocale.asReadonly();
  readonly availableLocales = ['en', 'fr'];

  translate(key: string, params?: Record<string, string | number>): string {
    const translation = this.translations()[this.currentLocale()]?.[key] || key;
    
    if (params) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }

  setLocale(locale: string): void {
    if (this.availableLocales.includes(locale)) {
      this.currentLocale.set(locale);
      localStorage.setItem('locale', locale);
      document.documentElement.lang = locale;
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale();
  }

  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  constructor() {
    this.initializeLocale();
  }

  private initializeLocale(): void {
    // Get saved locale from localStorage
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && this.availableLocales.includes(savedLocale)) {
      this.setLocale(savedLocale);
    } else {
      // Try to detect browser locale
      const browserLocale = navigator.language.split('-')[0];
      if (this.availableLocales.includes(browserLocale)) {
        this.setLocale(browserLocale);
      } else {
        this.setLocale('en'); // Default to English
      }
    }
  }
}
