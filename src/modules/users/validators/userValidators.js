// src/modules/users/validators/userValidators.js

import { object, string, number, boolean, ref } from 'joi';

const createUserSchema = object({
  email: string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  name: string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  department: string().max(100).optional().allow(null),
  clearanceLevel: number().integer().min(1).max(5).default(1),
  roleId: string().uuid().required().messages({
    'string.uuid': 'Invalid role ID format',
    'any.required': 'Role ID is required'
  }),
  active: boolean().default(true)
});

const updateUserSchema = object({
  email: string().email().optional(),
  name: string().min(2).max(100).optional(),
  department: string().max(100).optional().allow(null),
  clearanceLevel: number().integer().min(1).max(5).optional(),
  roleId: string().uuid().optional(),
  active: boolean().optional()
}).min(1);

const changePasswordSchema = object({
  currentPassword: string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: string().valid(ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required'
  })
});

const userIdSchema = object({
  id: string().uuid().required().messages({
    'string.uuid': 'Invalid user ID format',
    'any.required': 'User ID is required'
  })
});

export default {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userIdSchema
};