// src/modules/users/validators/permissionValidators.js

import { object, string } from 'joi';

import permissions from '../../../shared/constants/permissions';


const {MODULES} = permissions

const createPermissionSchema = object({
  code: string().uppercase().pattern(/^[A-Z_]+\.[A-Z_]+$/).required().messages({
    'string.pattern.base': 'Permission code must be in format MODULE.ACTION (e.g., DOCUMENTS.CREATE)',
    'any.required': 'Permission code is required'
  }),
  description: string().min(5).max(255).required().messages({
    'string.min': 'Description must be at least 5 characters long',
    'any.required': 'Description is required'
  }),
  module: string().valid(...Object.values(MODULES)).required().messages({
    'any.only': 'Invalid module specified',
    'any.required': 'Module is required'
  })
});

const permissionIdSchema = object({
  id: string().uuid().required().messages({
    'string.uuid': 'Invalid permission ID format',
    'any.required': 'Permission ID is required'
  })
});

export default {
  createPermissionSchema,
  permissionIdSchema
};