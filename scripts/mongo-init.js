// MongoDB initialization script for production deployment
// This script creates the initial database structure and default roles

db = db.getSiblingDB('saas_platform_prod');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        name: {
          bsonType: "string",
          minLength: 2
        },
        password: {
          bsonType: "string"
        },
        isActive: {
          bsonType: "bool"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection('saasroles', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description", "permissions", "createdAt"],
      properties: {
        name: {
          bsonType: "string",
          enum: ["CUSTOMER_ADMIN", "CUSTOMER_MANAGER", "CUSTOMER_DEVELOPER", "SAAS_PLATFORM_ADMIN", "SAAS_PLATFORM_MANAGER"]
        },
        description: {
          bsonType: "string"
        },
        permissions: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        }
      }
    }
  }
});

db.createCollection('saasuserroles');
db.createCollection('saasapplications');
db.createCollection('saasmarketingcampaigns');
db.createCollection('saasplanfeatures');
db.createCollection('saasanalyticsevents');

// Create indexes for performance
print('Creating indexes...');

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "isActive": 1 });

// Role indexes
db.saasroles.createIndex({ "name": 1 }, { unique: true });

// User role assignment indexes
db.saasuserroles.createIndex({ "userId": 1, "applicationId": 1 });
db.saasuserroles.createIndex({ "applicationId": 1, "roleType": 1 });
db.saasuserroles.createIndex({ "assignedAt": 1 });
db.saasuserroles.createIndex({ "userId": 1 });

// Application indexes
db.saasapplications.createIndex({ "ownerId": 1 });
db.saasapplications.createIndex({ "name": 1 });
db.saasapplications.createIndex({ "createdAt": 1 });

// Marketing campaign indexes
db.saasmarketingcampaigns.createIndex({ "applicationId": 1, "status": 1 });
db.saasmarketingcampaigns.createIndex({ "type": 1, "createdAt": 1 });
db.saasmarketingcampaigns.createIndex({ "userId": 1 });
db.saasmarketingcampaigns.createIndex({ "createdAt": 1 });

// Plan feature indexes
db.saasplanfeatures.createIndex({ "planId": 1, "featureType": 1 }, { unique: true });
db.saasplanfeatures.createIndex({ "applicationId": 1 });
db.saasplanfeatures.createIndex({ "planId": 1 });

// Analytics event indexes
db.saasanalyticsevents.createIndex({ "eventType": 1, "timestamp": 1 });
db.saasanalyticsevents.createIndex({ "userId": 1, "timestamp": 1 });
db.saasanalyticsevents.createIndex({ "applicationId": 1, "timestamp": 1 });
db.saasanalyticsevents.createIndex({ "timestamp": 1 });

// Insert default roles following French specification
print('Inserting default roles...');

db.saasroles.insertMany([
  {
    name: 'CUSTOMER_ADMIN',
    description: 'CTO, Directeur Technique, Architecte Senior',
    permissions: [
      'technicalConfiguration',
      'marketingDashboard', 
      'planConfiguration',
      'apiDocumentation',
      'teamManagement',
      'userManagement',
      'applicationSettings',
      'analyticsAccess'
    ],
    level: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'CUSTOMER_MANAGER',
    description: 'Product Manager, Chef de projet technique',
    permissions: [
      'marketingDashboard',
      'planConfiguration:READ',
      'apiDocumentation:READ',
      'analyticsAccess',
      'campaignManagement',
      'reportingAccess'
    ],
    level: 'MANAGER', 
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'CUSTOMER_DEVELOPER',
    description: 'Développeur Senior, Ingénieur Full-Stack',
    permissions: [
      'apiDocumentation:READ',
      'technicalDocumentation',
      'integrationTesting',
      'developmentTools'
    ],
    level: 'DEVELOPER',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'SAAS_PLATFORM_ADMIN',
    description: 'Administrateur de la plateforme SaaS',
    permissions: [
      'platformManagement',
      'systemConfiguration',
      'userManagement:GLOBAL',
      'applicationManagement:GLOBAL',
      'systemMonitoring',
      'backupManagement'
    ],
    level: 'PLATFORM_ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'SAAS_PLATFORM_MANAGER',
    description: 'Gestionnaire de la plateforme SaaS',
    permissions: [
      'platformAnalytics',
      'customerSupport',
      'reportingAccess:GLOBAL',
      'billingManagement'
    ],
    level: 'PLATFORM_MANAGER',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create default admin user (should be changed in production)
print('Creating default admin user...');

db.users.insertOne({
  email: 'admin@saasplatform.com',
  name: 'Platform Administrator',
  password: '$2b$12$defaultHashedPasswordChangeThis',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create sample application for testing
print('Creating sample application...');

const adminUser = db.users.findOne({ email: 'admin@saasplatform.com' });

if (adminUser) {
  const sampleApp = {
    name: 'Sample SaaS Application',
    description: 'Application exemple pour démonstration',
    ownerId: adminUser._id,
    status: 'ACTIVE',
    settings: {
      allowRegistration: true,
      requireEmailVerification: true,
      enableAnalytics: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.saasapplications.insertOne(sampleApp);
  
  // Assign admin role to the admin user for the sample application
  db.saasuserroles.insertOne({
    userId: adminUser._id,
    applicationId: sampleApp._id,
    roleType: 'CUSTOMER_ADMIN',
    assignedAt: new Date(),
    assignedBy: adminUser._id,
    isActive: true
  });
}

// Create database admin user for application
db.createUser({
  user: 'saas_app_user',
  pwd: 'change_this_password_in_production',
  roles: [
    { role: 'readWrite', db: 'saas_platform_prod' },
    { role: 'dbAdmin', db: 'saas_platform_prod' }
  ]
});

print('Database initialization completed successfully!');
print('');
print('IMPORTANT SECURITY REMINDERS:');
print('1. Change the default admin password immediately');
print('2. Update database user password');
print('3. Configure proper MongoDB authentication');
print('4. Set up SSL/TLS for database connections');
print('5. Configure firewall rules');
print('');
print('Default admin login:');
print('Email: admin@saasplatform.com');
print('Password: Must be set manually in production');
print('');
print('Collections created:');
print('- users (with email validation)');
print('- saasroles (with 5 default roles)');
print('- saasuserroles (role assignments)');
print('- saasapplications (customer applications)');
print('- saasmarketingcampaigns (marketing tools)');
print('- saasplanfeatures (subscription features)');
print('- saasanalyticsevents (usage tracking)');
print('');
print('Indexes created for optimal performance');
print('French role architecture implemented');
print('Ready for production deployment!');