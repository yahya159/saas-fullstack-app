import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['permission'] as string;
    
    if (!requiredPermission) {
      return true; // No permission required
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/signup']);
      return false;
    }

    if (!this.authService.hasPermission(requiredPermission)) {
      this.notificationService.error(
        'Access Denied',
        'You do not have permission to access this feature.'
      );
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
