import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start as not authenticated', () => {
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.currentUser()).toBeNull();
    expect(service.authToken()).toBeNull();
  });

  it('should login successfully with valid credentials', (done) => {
    service.login('demo@example.com', 'password').subscribe({
      next: (result) => {
        expect(result.success).toBeTruthy();
        expect(result.message).toBe('Login successful');
        expect(service.isAuthenticated()).toBeTruthy();
        expect(service.currentUser()).toBeTruthy();
        expect(service.authToken()).toBeTruthy();
        done();
      }
    });
  });

  it('should fail login with invalid credentials', (done) => {
    service.login('invalid@example.com', 'wrongpassword').subscribe({
      next: (result) => {
        expect(result.success).toBeFalsy();
        expect(result.message).toBe('Invalid credentials');
        expect(service.isAuthenticated()).toBeFalsy();
        done();
      }
    });
  });

  it('should signup successfully', (done) => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      plan: 'YZ-PLAN-1'
    };

    service.signup(userData).subscribe({
      next: (result) => {
        expect(result.success).toBeTruthy();
        expect(result.message).toBe('Account created successfully');
        expect(service.isAuthenticated()).toBeTruthy();
        expect(service.currentUser()?.username).toBe('testuser');
        done();
      }
    });
  });

  it('should logout correctly', () => {
    // First login
    service.login('demo@example.com', 'password').subscribe();
    
    // Then logout
    service.logout();
    
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.currentUser()).toBeNull();
    expect(service.authToken()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
  });

  it('should persist auth state in localStorage', (done) => {
    service.login('demo@example.com', 'password').subscribe({
      next: () => {
        expect(localStorage.getItem('auth_token')).toBeTruthy();
        expect(localStorage.getItem('auth_user')).toBeTruthy();
        done();
      }
    });
  });

  it('should restore auth state from localStorage', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isVerified: true,
      plan: 'YZ-PLAN-1'
    };
    const mockToken = 'mock_token';

    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));

    // Create new service instance to test initialization
    const newService = new AuthService(mockRouter);
    
    expect(newService.isAuthenticated()).toBeTruthy();
    expect(newService.currentUser()?.username).toBe('testuser');
    expect(newService.authToken()).toBe(mockToken);
  });

  it('should handle invalid stored user data', () => {
    localStorage.setItem('auth_token', 'valid_token');
    localStorage.setItem('auth_user', 'invalid_json');

    const newService = new AuthService(mockRouter);
    
    expect(newService.isAuthenticated()).toBeFalsy();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should refresh token successfully', (done) => {
    service.login('demo@example.com', 'password').subscribe({
      next: () => {
        const originalToken = service.authToken();
        
        service.refreshToken().subscribe({
          next: (success) => {
            expect(success).toBeTruthy();
            expect(service.authToken()).not.toBe(originalToken);
            done();
          }
        });
      }
    });
  });

  it('should check permissions correctly', () => {
    service.login('demo@example.com', 'password').subscribe({
      next: () => {
        expect(service.hasPermission('read')).toBeTruthy();
        expect(service.hasPermission('create_widget')).toBeTruthy();
        expect(service.hasPermission('admin')).toBeFalsy();
      }
    });
  });

  it('should check email verification status', () => {
    service.login('demo@example.com', 'password').subscribe({
      next: () => {
        expect(service.isEmailVerified()).toBeTruthy();
      }
    });
  });
});
