import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Import your constants (adjust path as necessary)
// Assuming the first code block you shared is in src/shared/constants/permissions.js
import permissions from '../../../shared/constants/permissions';

const { PERMISSIONS, ROLE_PERMISSIONS } = permissions

async function seedPermissions() {
  console.log('🌱 Starting Permission Seeding...');

  // 1. Sync Permissions
  // We iterate through all permission strings defined in your constants
  for (const permissionCode of Object.values(PERMISSIONS)) {
    const [module, action] = permissionCode.split('.');
    
    await prisma.permission.upsert({
      where: { code: permissionCode },
      update: {}, // If it exists, do nothing
      create: {
        code: permissionCode,
        module: module.toLowerCase(),
        description: `Permission to ${action.toLowerCase()} ${module.toLowerCase()}`
      }
    });
  }
  console.log('✅ Permissions synced.');

  // 2. Sync Roles and Assign Permissions
  for (const [roleName, rolePermissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
    
    // Find all permission records in DB that match the codes for this role
    const permissionsInDb = await prisma.permission.findMany({
      where: {
        code: { in: rolePermissionCodes }
      }
    });

    const permissionConnect = permissionsInDb.map(p => ({ id: p.id }));

    // Create or Update the Role
    await prisma.role.upsert({
      where: { name: roleName },
      update: {
        // Re-sync permissions every time seed runs to match your code constants
        permissions: {
          set: [], // Disconnect all existing
          connect: permissionConnect // Connect the current list
        }
      },
      create: {
        name: roleName,
        description: `System role for ${roleName}`,
        isSystem: true,
        permissions: {
          connect: permissionConnect
        }
      }
    });
    console.log(`   > Synced Role: ${roleName} with ${permissionConnect.length} permissions`);
  }

  console.log('✅ Seeding completed successfully.');
}

// Execute if running directly
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedPermissions;