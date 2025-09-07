import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no notifications', () => {
    expect(service.allNotifications().length).toBe(0);
    expect(service.hasNotifications()).toBeFalsy();
  });

  it('should add success notification', () => {
    service.success('Test Title', 'Test Message');
    
    const notifications = service.allNotifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].title).toBe('Test Title');
    expect(notifications[0].message).toBe('Test Message');
    expect(service.hasNotifications()).toBeTruthy();
  });

  it('should add error notification', () => {
    service.error('Error Title', 'Error Message');
    
    const notifications = service.allNotifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].title).toBe('Error Title');
    expect(notifications[0].message).toBe('Error Message');
  });

  it('should add warning notification', () => {
    service.warning('Warning Title', 'Warning Message');
    
    const notifications = service.allNotifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].title).toBe('Warning Title');
    expect(notifications[0].message).toBe('Warning Message');
  });

  it('should add info notification', () => {
    service.info('Info Title', 'Info Message');
    
    const notifications = service.allNotifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('info');
    expect(notifications[0].title).toBe('Info Title');
    expect(notifications[0].message).toBe('Info Message');
  });

  it('should remove notification by id', () => {
    service.success('Test Title', 'Test Message');
    const notifications = service.allNotifications();
    const notificationId = notifications[0].id;
    
    service.removeNotification(notificationId);
    
    expect(service.allNotifications().length).toBe(0);
    expect(service.hasNotifications()).toBeFalsy();
  });

  it('should clear all notifications', () => {
    service.success('Test 1', 'Message 1');
    service.error('Test 2', 'Message 2');
    service.warning('Test 3', 'Message 3');
    
    expect(service.allNotifications().length).toBe(3);
    
    service.clearAll();
    
    expect(service.allNotifications().length).toBe(0);
    expect(service.hasNotifications()).toBeFalsy();
  });

  it('should set custom duration for notifications', () => {
    service.success('Test Title', 'Test Message', 10000);
    
    const notifications = service.allNotifications();
    expect(notifications[0].duration).toBe(10000);
  });

  it('should set default durations correctly', () => {
    service.success('Success', 'Message');
    service.error('Error', 'Message');
    service.warning('Warning', 'Message');
    service.info('Info', 'Message');
    
    const notifications = service.allNotifications();
    expect(notifications[0].duration).toBe(5000); // success
    expect(notifications[1].duration).toBe(8000); // error
    expect(notifications[2].duration).toBe(6000); // warning
    expect(notifications[3].duration).toBe(4000); // info
  });

  it('should generate unique ids for notifications', () => {
    service.success('Test 1', 'Message 1');
    service.success('Test 2', 'Message 2');
    
    const notifications = service.allNotifications();
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });

  it('should set timestamp for notifications', () => {
    const beforeTime = new Date();
    service.success('Test Title', 'Test Message');
    const afterTime = new Date();
    
    const notifications = service.allNotifications();
    const notificationTime = notifications[0].timestamp;
    
    expect(notificationTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(notificationTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});
