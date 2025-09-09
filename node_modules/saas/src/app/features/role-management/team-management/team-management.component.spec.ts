import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TeamManagementComponent } from './team-management.component';
import { RoleManagementService } from '../services/role-management.service';
import { of } from 'rxjs';

describe('TeamManagementComponent', () => {
  let component: TeamManagementComponent;
  let fixture: ComponentFixture<TeamManagementComponent>;
  let mockRoleManagementService: jasmine.SpyObj<RoleManagementService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RoleManagementService', [
      'getAllRoles',
      'assignUserRole',
      'revokeUserRole',
      'getRoleDisplayInfo'
    ]);

    await TestBed.configureTestingModule({
      imports: [TeamManagementComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: RoleManagementService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamManagementComponent);
    component = fixture.componentInstance;
    mockRoleManagementService = TestBed.inject(RoleManagementService) as jasmine.SpyObj<RoleManagementService>;

    // Setup default mock responses
    mockRoleManagementService.getAllRoles.and.returnValue(of({
      success: true,
      data: [
        {
          _id: '1',
          name: 'Customer Admin',
          roleType: 'CUSTOMER_ADMIN',
          description: 'Full administrative access',
          permissions: { 'admin': 'FULL_CONTROL' },
          responsibilities: ['Manage team', 'Configure system'],
          restrictions: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      count: 1
    }));

    mockRoleManagementService.getRoleDisplayInfo.and.returnValue({
      displayName: 'Customer Admin',
      icon: '👤',
      color: '#3182ce',
      profileSuggestion: 'CTO, Technical Director'
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles on init', () => {
    component.ngOnInit();
    expect(mockRoleManagementService.getAllRoles).toHaveBeenCalled();
  });

  it('should filter client roles correctly', () => {
    component.roles.set([
      {
        _id: '1',
        name: 'Customer Admin',
        roleType: 'CUSTOMER_ADMIN',
        description: 'Admin role',
        permissions: {},
        responsibilities: [],
        restrictions: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'Platform Admin',
        roleType: 'SAAS_PLATFORM_ADMIN',
        description: 'Platform role',
        permissions: {},
        responsibilities: [],
        restrictions: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const clientRoles = component.clientRoles();
    expect(clientRoles.length).toBe(1);
    expect(clientRoles[0].roleType).toBe('CUSTOMER_ADMIN');
  });

  it('should filter provider roles correctly', () => {
    component.roles.set([
      {
        _id: '1',
        name: 'Customer Admin',
        roleType: 'CUSTOMER_ADMIN',
        description: 'Admin role',
        permissions: {},
        responsibilities: [],
        restrictions: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'Platform Admin',
        roleType: 'SAAS_PLATFORM_ADMIN',
        description: 'Platform role',
        permissions: {},
        responsibilities: [],
        restrictions: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const providerRoles = component.providerRoles();
    expect(providerRoles.length).toBe(1);
    expect(providerRoles[0].roleType).toBe('SAAS_PLATFORM_ADMIN');
  });

  it('should open assign role modal', () => {
    const mockRole = {
      _id: '1',
      name: 'Customer Admin',
      roleType: 'CUSTOMER_ADMIN' as const,
      description: 'Admin role',
      permissions: {},
      responsibilities: [],
      restrictions: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.selectRoleForAssignment(mockRole);
    expect(component.showAssignRoleModal).toBe(true);
    expect(component.assignRoleForm.get('roleId')?.value).toBe('1');
  });

  it('should close assign role modal and reset form', () => {
    component.showAssignRoleModal = true;
    component.assignRoleForm.patchValue({ userId: 'test' });

    component.closeAssignModal();
    expect(component.showAssignRoleModal).toBe(false);
    expect(component.assignRoleForm.get('userId')?.value).toBe(null);
  });
});
