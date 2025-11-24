import { basename } from 'path';
import { fileURLToPath } from 'url';


import permissions from '../../../shared/constants/permissions.js';
import prisma from '../../index.js'; 


const { PERMISSIONS, ROLE_PERMISSIONS } = permissions;

async function seedPermissions() {
  console.log('🌱 Starting Permission Seeding...');

  // 1. Sync Permissions
  for (const permissionCode of Object.values(PERMISSIONS)) {
    const [module, action] = permissionCode.split('.');

    await prisma.permission.upsert({
      where: { code: permissionCode },
      update: {},
      create: {
        code: permissionCode,
        module: module.toLowerCase(),
        description: `Permission to ${action.toLowerCase()} ${module.toLowerCase()}`,
      },
    });
  }
  console.log('✅ Permissions synced.');

  // 2. Sync Roles and Assign Permissions
  for (const [roleName, rolePermissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const permissionsInDb = await prisma.permission.findMany({
      where: { code: { in: rolePermissionCodes } },
    });

    const permissionConnect = permissionsInDb.map((p) => ({ id: p.id }));

    await prisma.role.upsert({
      where: { name: roleName },
      update: {
        permissions: {
          set: [],
          connect: permissionConnect,
        },
      },
      create: {
        name: roleName,
        description: `System role for ${roleName}`,
        isSystem: true,
        permissions: { connect: permissionConnect },
      },
    });
    console.log(`   > Synced Role: ${roleName} with ${permissionConnect.length} permissions`);
  }

  console.log('✅ Seeding completed successfully.');
}

// Run if executed directly
const isMain = basename(fileURLToPath(import.meta.url)) === basename(process.argv[1]);
if (isMain) {
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
