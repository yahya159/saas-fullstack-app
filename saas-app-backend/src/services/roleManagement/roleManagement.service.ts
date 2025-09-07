import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  SaasRole,
  SaasRolePOJO,
  SaasRoleDocument,
  RoleType,
  AccessLevel,
} from '@Data/models/saasRole/saasRole.pojo.model';
import {
  SaasUserRole,
  SaasUserRolePOJO,
  SaasUserRoleDocument,
} from '@Data/models/saasUserRole/saasUserRole.pojo.model';
import { CacheService } from '../../common/services/cache.service';

export interface CreateRoleDto {
  roleType: RoleType;
  name: string;
  description: string;
  responsibilities?: string[];
  permissions?: Record<string, AccessLevel>;
  restrictions?: Record<string, any>;
}

export interface AssignUserRoleDto {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  expiresAt?: Date;
  customPermissions?: Record<string, any>;
  assignedBy?: mongoose.Types.ObjectId;
}

@Injectable()
export class RoleManagementService {
  constructor(
    @InjectModel(SaasRolePOJO.name)
    private roleModel: Model<SaasRoleDocument>,
    @InjectModel(SaasUserRolePOJO.name)
    private userRoleModel: Model<SaasUserRoleDocument>,
    private cacheService: CacheService,
  ) {
    this.initializeDefaultRoles();
  }

  // Initialize default roles based on the specification
  private async initializeDefaultRoles() {
    const defaultRoles = [
      {
        roleType: RoleType.SAAS_PLATFORM_ADMIN,
        name: 'SaaS Platform Admin',
        description: 'Administrateur Système avec supervision complète de la plateforme',
        responsibilities: [
          'Supervision complète de la plateforme',
          'Monitoring global',
          'Gestion des incidents critiques',
          'Configuration système avancée',
          "Gestion de l'infrastructure",
        ],
        permissions: {
          systemConfiguration: AccessLevel.FULL_CONTROL,
          platformMetrics: AccessLevel.FULL_CONTROL,
          infrastructureManagement: AccessLevel.FULL_CONTROL,
          clientRelations: AccessLevel.ADMIN,
          commercialMetrics: AccessLevel.READ,
          technicalConfiguration: AccessLevel.FULL_CONTROL,
          marketingDashboard: AccessLevel.ADMIN,
          apiDocumentation: AccessLevel.FULL_CONTROL,
        },
      },
      {
        roleType: RoleType.SAAS_PLATFORM_MANAGER,
        name: 'SaaS Platform Manager',
        description: 'Gestionnaire Commercial avec focus sur les relations clients',
        responsibilities: [
          'Relations clients et support commercial',
          'Onboarding des nouveaux clients',
          'CRM intégré',
          'Métriques commerciales',
          'Outils de support client',
        ],
        permissions: {
          clientRelations: AccessLevel.FULL_CONTROL,
          commercialMetrics: AccessLevel.ADMIN,
          customerSupport: AccessLevel.FULL_CONTROL,
          platformMetrics: AccessLevel.READ,
          marketingDashboard: AccessLevel.READ,
        },
      },
      {
        roleType: RoleType.CUSTOMER_ADMIN,
        name: 'Customer Admin',
        description: 'Administrateur Client (CTO, Directeur Technique, Architecte Senior)',
        responsibilities: [
          'Gouvernance technique',
          "Stratégie d'intégration",
          'Validation sécurité',
          'Configuration avancée',
          'Gestion des équipes',
        ],
        permissions: {
          technicalConfiguration: AccessLevel.ADMIN,
          securityValidation: AccessLevel.FULL_CONTROL,
          teamManagement: AccessLevel.FULL_CONTROL,
          marketingDashboard: AccessLevel.READ,
          apiDocumentation: AccessLevel.ADMIN,
        },
        restrictions: {
          maxApplications: 10,
          maxCampaigns: 50,
        },
      },
      {
        roleType: RoleType.CUSTOMER_MANAGER,
        name: 'Customer Manager',
        description: 'Chef de Projet SaaS (Product Manager, Chef de projet technique)',
        responsibilities: [
          'Configuration opérationnelle',
          'Pilotage des campagnes',
          'Analyse des métriques',
          'Dashboard marketing',
          'Configuration des A/B tests',
        ],
        permissions: {
          marketingDashboard: AccessLevel.ADMIN,
          abTestConfiguration: AccessLevel.FULL_CONTROL,
          userAnalytics: AccessLevel.ADMIN,
          technicalConfiguration: AccessLevel.READ,
          apiDocumentation: AccessLevel.READ,
        },
        restrictions: {
          maxApplications: 5,
          maxCampaigns: 20,
        },
      },
      {
        roleType: RoleType.CUSTOMER_DEVELOPER,
        name: 'Customer Developer',
        description: 'Développeur Intégrateur (Développeur Senior, Ingénieur Full-Stack)',
        responsibilities: [
          'Intégration technique',
          'Développement des connecteurs',
          'Maintenance des APIs',
          'Documentation',
          'Tests et debugging',
        ],
        permissions: {
          apiDocumentation: AccessLevel.ADMIN,
          sandboxAccess: AccessLevel.FULL_CONTROL,
          debuggingTools: AccessLevel.FULL_CONTROL,
          technicalConfiguration: AccessLevel.WRITE,
          marketingDashboard: AccessLevel.READ,
        },
        restrictions: {
          maxApplications: 3,
          maxApiCalls: 10000,
        },
      },
    ];

    for (const roleData of defaultRoles) {
      await this.createRoleIfNotExists(roleData);
    }
  }

  private async createRoleIfNotExists(roleData: any) {
    const existingRole = await this.roleModel.findOne({ roleType: roleData.roleType });
    if (!existingRole) {
      const role = new this.roleModel(roleData);
      await role.save();
    }
  }

  // Role Management
  async createRole(createRoleDto: CreateRoleDto): Promise<SaasRole> {
    const existingRole = await this.roleModel.findOne({
      roleType: createRoleDto.roleType,
    });

    if (existingRole) {
      throw new ConflictException(`Role ${createRoleDto.roleType} already exists`);
    }

    const role = new this.roleModel(createRoleDto);
    return await role.save();
  }

  async getAllRoles(): Promise<SaasRole[]> {
    return await this.roleModel.find({ isActive: true }).exec();
  }

  async getRoleById(roleId: mongoose.Types.ObjectId): Promise<SaasRole> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return role;
  }

  async getRoleByType(roleType: RoleType): Promise<SaasRole> {
    const role = await this.roleModel.findOne({ roleType, isActive: true }).exec();
    if (!role) {
      throw new NotFoundException(`Role ${roleType} not found`);
    }
    return role;
  }

  async updateRole(
    roleId: mongoose.Types.ObjectId,
    updateData: Partial<SaasRole>,
  ): Promise<SaasRole> {
    const role = await this.roleModel
      .findByIdAndUpdate(roleId, { ...updateData, updatedAt: new Date() }, { new: true })
      .exec();

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return role;
  }

  // User Role Assignment
  async assignUserRole(assignDto: AssignUserRoleDto): Promise<SaasUserRole> {
    // Check if user already has a role for this application
    const existingAssignment = await this.userRoleModel.findOne({
      user: assignDto.userId,
      application: assignDto.applicationId,
      isActive: true,
    });

    if (existingAssignment) {
      throw new ConflictException(`User already has a role assigned for this application`);
    }

    // Verify role exists
    await this.getRoleById(assignDto.roleId);

    const userRole = new this.userRoleModel({
      user: assignDto.userId,
      role: assignDto.roleId,
      application: assignDto.applicationId,
      workspace: assignDto.workspaceId,
      expiresAt: assignDto.expiresAt,
      customPermissions: assignDto.customPermissions || {},
      assignedBy: assignDto.assignedBy,
    });

    const savedRole = await userRole.save();

    // Invalidate cache
    const cacheKey = CacheService.getRolePermissionKey(
      assignDto.userId.toString(),
      assignDto.applicationId.toString(),
    );
    this.cacheService.delete(cacheKey);

    return savedRole;
  }

  async getUserRoles(
    userId: mongoose.Types.ObjectId,
    applicationId?: mongoose.Types.ObjectId,
  ): Promise<SaasUserRole[]> {
    const query: any = { user: userId, isActive: true };
    if (applicationId) {
      query.application = applicationId;
    }

    return await this.userRoleModel
      .find(query)
      .populate('role')
      .populate('application')
      .populate('workspace')
      .exec();
  }

  async getUserPermissions(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
  ): Promise<Record<string, AccessLevel>> {
    // Check cache first
    const cacheKey = CacheService.getRolePermissionKey(userId.toString(), applicationId.toString());
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const userRoles = await this.getUserRoles(userId, applicationId);

    if (userRoles.length === 0) {
      return {};
    }

    // Get the most recent active role
    const activeRole = userRoles[0];
    const role = await this.getRoleById(activeRole.role as mongoose.Types.ObjectId);

    // Merge role permissions with custom permissions
    const permissions = {
      ...role.permissions,
      ...activeRole.customPermissions,
    };

    // Cache for 15 minutes
    this.cacheService.set(cacheKey, permissions, 15 * 60 * 1000);
    return permissions;
  }

  async checkUserPermission(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
    permission: string,
    requiredLevel: AccessLevel,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, applicationId);
    const userLevel = permissions[permission];

    if (!userLevel) {
      return false;
    }

    const levelHierarchy = {
      [AccessLevel.READ]: 1,
      [AccessLevel.WRITE]: 2,
      [AccessLevel.ADMIN]: 3,
      [AccessLevel.FULL_CONTROL]: 4,
    };

    return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel];
  }

  async revokeUserRole(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const result = await this.userRoleModel.updateMany(
      { user: userId, application: applicationId },
      { isActive: false },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('No active role assignments found for this user');
    }
  }

  async updateUserRole(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
    newRoleId: mongoose.Types.ObjectId,
  ): Promise<SaasUserRole> {
    // Revoke existing role
    await this.revokeUserRole(userId, applicationId);

    // Assign new role
    return await this.assignUserRole({
      userId,
      roleId: newRoleId,
      applicationId,
    });
  }

  // Permission Helpers
  async canAccessMarketingDashboard(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    return await this.checkUserPermission(
      userId,
      applicationId,
      'marketingDashboard',
      AccessLevel.READ,
    );
  }

  async canConfigureABTests(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    return await this.checkUserPermission(
      userId,
      applicationId,
      'abTestConfiguration',
      AccessLevel.WRITE,
    );
  }

  async canAccessAPIDocumentation(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    return await this.checkUserPermission(
      userId,
      applicationId,
      'apiDocumentation',
      AccessLevel.READ,
    );
  }

  async canManageTeam(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    return await this.checkUserPermission(
      userId,
      applicationId,
      'teamManagement',
      AccessLevel.ADMIN,
    );
  }
}
