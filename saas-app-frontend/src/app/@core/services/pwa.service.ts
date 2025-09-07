import { Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private notificationService = inject(NotificationService);
  
  readonly isOnline = signal(navigator.onLine);
  readonly hasUpdate = signal(false);

  constructor() {
    this.initializePwa();
  }

  private initializePwa(): void {
    // Check for updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
          map(evt => ({
            type: 'UPDATE_AVAILABLE',
            current: evt.currentVersion,
            available: evt.latestVersion,
          }))
        )
        .subscribe(() => {
          this.hasUpdate.set(true);
          this.notificationService.info(
            'Update Available',
            'A new version of the app is available. Click to update.',
            -1 // Don't auto-dismiss
          );
        });
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.notificationService.success('Connection Restored', 'You are back online!');
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      this.notificationService.warning('Connection Lost', 'You are currently offline. Some features may not work.');
    });
  }

  async checkForUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        if (updateFound) {
          this.hasUpdate.set(true);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }

  async activateUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled && this.hasUpdate()) {
      try {
        await this.swUpdate.activateUpdate();
        this.notificationService.success(
          'Update Installed',
          'The app has been updated. Please refresh to see the changes.'
        );
        // Reload the page to apply the update
        window.location.reload();
      } catch (error) {
        console.error('Error activating update:', error);
        this.notificationService.error(
          'Update Failed',
          'Failed to install the update. Please try again.'
        );
      }
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.notificationService.success(
          'Notifications Enabled',
          'You will now receive notifications from the app.'
        );
      } else if (permission === 'denied') {
        this.notificationService.warning(
          'Notifications Disabled',
          'Notifications are disabled. You can enable them in your browser settings.'
        );
      }
      return permission;
    }
    return 'denied';
  }

  showInstallPrompt(): void {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.notificationService.info(
        'Install App',
        'You can install this app on your device for a better experience.',
        -1
      );
    }
  }

  isInstallable(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isPwaSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}
