// src/modules/users/validators/roleValidators.js

import { object, string, boolean, array } from 'joi';

const createRoleSchema = object({
  name: string().min(2).max(50).required().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 50 characters',
    'any.required': 'Role name is required'
  }),
  description: string().max(255).optional().allow(null),
  isSystem: boolean().default(false),
  permissionIds: array().items(string().uuid()).default([])
});

const updateRoleSchema = object({
  name: string().min(2).max(50).optional(),
  description: string().max(255).optional().allow(null)
}).min(1);

const assignPermissionsSchema = object({
  permissionIds: array().items(string().uuid()).min(1).required().messages({
    'array.min': 'At least one permission ID is required',
    'any.required': 'Permission IDs are required'
  })
});

const roleIdSchema = object({
  id: string().uuid().required().messages({
    'string.uuid': 'Invalid role ID format',
    'any.required': 'Role ID is required'
  })
});

export default {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
  roleIdSchema
};