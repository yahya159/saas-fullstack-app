import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleManagementService, SaasRole, UserRole } from '../services/role-management.service';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.css'],
  template: `
    <div class="team-management">
      <div class="page-header">
        <h1>Team Management & Role-Based Access Control</h1>
        <p class="subtitle">Manage user roles and permissions based on the organizational architecture</p>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="showAssignRoleModal = true">
            <i class="icon-user-plus"></i>
            Assign Role
          </button>
          <button class="btn btn-outline" (click)="loadData()">
            <i class="icon-refresh"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Role Categories -->
      <div class="role-categories">
        <h2>Role Architecture Overview</h2>

        <div class="provider-roles">
          <h3>🏢 Provider Side (Our Organization)</h3>
          <div class="roles-grid">
            <div class="role-card provider-role" *ngFor="let role of providerRoles()">
              <div class="role-header">
                <span class="role-icon">{{ getRoleInfo(role.roleType).icon }}</span>
                <div class="role-title">
                  <h4>{{ role.name }}</h4>
                  <span class="role-type">{{ getRoleInfo(role.roleType).displayName }}</span>
                </div>
              </div>

              <p class="role-description">{{ role.description }}</p>

              <div class="responsibilities">
                <h5>Key Responsibilities:</h5>
                <ul>
                  <li *ngFor="let responsibility of role.responsibilities.slice(0, 3)">
                    {{ responsibility }}
                  </li>
                  <li *ngIf="role.responsibilities.length > 3" class="more-items">
                    +{{ role.responsibilities.length - 3 }} more...
                  </li>
                </ul>
              </div>

              <div class="permissions-summary">
                <span class="permission-badge" *ngFor="let perm of getTopPermissions(role.permissions)">
                  {{ perm }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="client-roles">
          <h3>🏬 Client Side (User Organizations)</h3>
          <div class="roles-grid">
            <div class="role-card client-role" *ngFor="let role of clientRoles()">
              <div class="role-header">
                <span class="role-icon">{{ getRoleInfo(role.roleType).icon }}</span>
                <div class="role-title">
                  <h4>{{ role.name }}</h4>
                  <span class="role-type">{{ getRoleInfo(role.roleType).displayName }}</span>
                </div>
              </div>

              <div class="profile-suggestion">
                <strong>Typical Profiles:</strong> {{ getRoleInfo(role.roleType).profileSuggestion }}
              </div>

              <p class="role-description">{{ role.description }}</p>

              <div class="responsibilities">
                <h5>Key Responsibilities:</h5>
                <ul>
                  <li *ngFor="let responsibility of role.responsibilities.slice(0, 3)">
                    {{ responsibility }}
                  </li>
                </ul>
              </div>

              <div class="permissions-summary">
                <span class="permission-badge" *ngFor="let perm of getTopPermissions(role.permissions)">
                  {{ perm }}
                </span>
              </div>

              <div class="role-actions">
                <button class="btn btn-sm btn-outline" (click)="selectRoleForAssignment(role)">
                  Assign to User
                </button>
                <button class="btn btn-sm btn-secondary" (click)="viewRoleDetails(role)">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Team Assignments -->
      <div class="team-assignments" *ngIf="userRoles().length > 0">
        <h2>Current Team Assignments</h2>

        <div class="assignments-table">
          <div class="table-header">
            <div class="col-user">User</div>
            <div class="col-role">Role</div>
            <div class="col-application">Application</div>
            <div class="col-assigned">Assigned Date</div>
            <div class="col-actions">Actions</div>
          </div>

          <div class="table-row" *ngFor="let userRole of userRoles()">
            <div class="col-user">
              <div class="user-info">
                <div class="user-avatar">{{ getUserInitials(userRole.user) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ userRole.user }}</div>
                  <div class="user-status" [class]="'status-' + (userRole.isActive ? 'active' : 'inactive')">
                    {{ userRole.isActive ? 'Active' : 'Inactive' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-role">
              <div class="role-badge" [style.background-color]="getRoleInfo(userRole.role.roleType).color + '20'"
                   [style.border-color]="getRoleInfo(userRole.role.roleType).color">
                <span class="role-icon">{{ getRoleInfo(userRole.role.roleType).icon }}</span>
                {{ userRole.role.name }}
              </div>
            </div>

            <div class="col-application">{{ userRole.application }}</div>
            <div class="col-assigned">{{ formatDate(userRole.assignedAt) }}</div>

            <div class="col-actions">
              <button class="btn btn-sm btn-outline" (click)="editUserRole(userRole)">
                Edit
              </button>
              <button class="btn btn-sm btn-danger" (click)="revokeUserRole(userRole)">
                Revoke
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="userRoles().length === 0">
        <div class="empty-icon">👥</div>
        <h3>No Team Members Yet</h3>
        <p>Start building your team by assigning roles to users based on their organizational profiles.</p>
        <button class="btn btn-primary" (click)="showAssignRoleModal = true">
          Assign First Role
        </button>
      </div>
    </div>

    <!-- Assign Role Modal -->
    <div class="modal-overlay" *ngIf="showAssignRoleModal" (click)="closeAssignModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Assign User Role</h3>
          <button class="close-btn" (click)="closeAssignModal()">&times;</button>
        </div>

        <form [formGroup]="assignRoleForm" (ngSubmit)="assignRole()" class="modal-body">
          <div class="form-group">
            <label for="userId">User ID</label>
            <input
              id="userId"
              type="text"
              formControlName="userId"
              placeholder="Enter user ID"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="roleId">Role</label>
            <select id="roleId" formControlName="roleId" class="form-control">
              <option value="">Select a role</option>
              <optgroup label="Client Roles (Recommended)">
                <option *ngFor="let role of clientRoles()" [value]="role._id">
                  {{ getRoleInfo(role.roleType).icon }} {{ role.name }}
                </option>
              </optgroup>
              <optgroup label="Provider Roles" *ngIf="canAssignProviderRoles()">
                <option *ngFor="let role of providerRoles()" [value]="role._id">
                  {{ getRoleInfo(role.roleType).icon }} {{ role.name }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="form-group">
            <label for="applicationId">Application ID</label>
            <input
              id="applicationId"
              type="text"
              formControlName="applicationId"
              placeholder="Enter application ID"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="expiresAt">Expiration Date (Optional)</label>
            <input
              id="expiresAt"
              type="date"
              formControlName="expiresAt"
              class="form-control">
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeAssignModal()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" (click)="assignRole()"
                  [disabled]="!assignRoleForm.valid">
            Assign Role
          </button>
        </div>
      </div>
    </div>
  `
})
export class TeamManagementComponent implements OnInit {
  private readonly roleManagementService = inject(RoleManagementService);
  private readonly formBuilder = inject(FormBuilder);

  roles = signal<SaasRole[]>([]);
  userRoles = signal<UserRole[]>([]);
  showAssignRoleModal = false;

  assignRoleForm: FormGroup;

  constructor() {
    this.assignRoleForm = this.formBuilder.group({
      userId: ['', Validators.required],
      roleId: ['', Validators.required],
      applicationId: ['', Validators.required],
      expiresAt: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.roleManagementService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles.set(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });

    // Mock loading user roles - in real app, get from API
    // this.loadUserRoles();
  }

  providerRoles() {
    return this.roles().filter(role =>
      role.roleType === 'SAAS_PLATFORM_ADMIN' ||
      role.roleType === 'SAAS_PLATFORM_MANAGER'
    );
  }

  clientRoles() {
    return this.roles().filter(role =>
      role.roleType === 'CUSTOMER_ADMIN' ||
      role.roleType === 'CUSTOMER_MANAGER' ||
      role.roleType === 'CUSTOMER_DEVELOPER'
    );
  }

  getRoleInfo(roleType: string) {
    return this.roleManagementService.getRoleDisplayInfo(roleType);
  }

  getTopPermissions(permissions: Record<string, string>): string[] {
    return Object.keys(permissions).slice(0, 4);
  }

  selectRoleForAssignment(role: SaasRole) {
    this.assignRoleForm.patchValue({ roleId: role._id });
    this.showAssignRoleModal = true;
  }

  viewRoleDetails(role: SaasRole) {
    // Navigate to role details or show modal
    console.log('View role details:', role);
  }

  assignRole() {
    if (this.assignRoleForm.valid) {
      const formValue = this.assignRoleForm.value;
      const assignDto = {
        userId: formValue.userId,
        roleId: formValue.roleId,
        applicationId: formValue.applicationId,
        expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined
      };

      this.roleManagementService.assignUserRole(assignDto).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Role assigned successfully:', response.data);
            this.closeAssignModal();
            this.loadData();
          }
        },
        error: (error) => {
          console.error('Failed to assign role:', error);
        }
      });
    }
  }

  closeAssignModal() {
    this.showAssignRoleModal = false;
    this.assignRoleForm.reset();
  }

  editUserRole(userRole: UserRole) {
    console.log('Edit user role:', userRole);
  }

  revokeUserRole(userRole: UserRole) {
    if (confirm('Are you sure you want to revoke this role assignment?')) {
      this.roleManagementService.revokeUserRole(userRole.user, userRole.application).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Role revoked successfully');
            this.loadData();
          }
        },
        error: (error) => {
          console.error('Failed to revoke role:', error);
        }
      });
    }
  }

  canAssignProviderRoles(): boolean {
    // Only platform admins can assign provider roles
    return true; // Simplified for demo
  }

  getUserInitials(userId: string): string {
    return userId.substring(0, 2).toUpperCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getActiveUserRolesCount(): number {
    return this.userRoles().filter(ur => ur.isActive).length;
  }

  getTotalUserRolesCount(): number {
    return this.userRoles().length;
  }

  getUserRolesArray(): UserRole[] {
    return this.userRoles();
  }

  getProviderRoles(): SaasRole[] {
    return this.providerRoles();
  }

  getClientRoles(): SaasRole[] {
    return this.clientRoles();
  }
}
