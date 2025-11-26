import { z } from 'zod'
import { user_role, record_style, record_medal } from '@prisma/client'

// Define ParentType locally since it's not exported properly
const ParentTypeEnum = z.enum(['PADRE', 'MADRE', 'TUTOR', 'ABUELO', 'ABUELA', 'OTRO'])

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'Nombre completo requerido'),
  role: z.nativeEnum(user_role),
  phone: z.string().optional(),
  isActive: z.boolean().default(true)
})

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional()
})

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password actual requerido'),
  newPassword: z.string().min(6, 'Nuevo password debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmación de password requerida')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Los passwords no coinciden",
  path: ["confirmPassword"]
})

// Child schemas
export const CreateChildSchema = z.object({
  fullName: z.string().min(2, 'Nombre completo requerido'),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  gender: z.enum(['M', 'F'], { 
    message: 'Género debe ser M o F'
  }),
  clubId: z.string().uuid('ID de club inválido'),
  emergencyContact: z.string().optional(),
  medicalNotes: z.string().optional(),
  isActive: z.boolean().default(true)
})

export const UpdateChildSchema = CreateChildSchema.partial()

// Club schemas
export const CreateClubSchema = z.object({
  name: z.string().min(2, 'Nombre del club requerido'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true)
})

export const UpdateClubSchema = CreateClubSchema.partial()

// Competition schemas
export const CreateCompetitionSchema = z.object({
  name: z.string().min(2, 'Nombre de competencia requerido'),
  date: z.string().transform((str) => new Date(str)),
  location: z.string().min(2, 'Ubicación requerida'),
  description: z.string().optional(),
  clubId: z.string().uuid('ID de club inválido'),
  isActive: z.boolean().default(true)
})

export const UpdateCompetitionSchema = CreateCompetitionSchema.partial()

// Competition Result schemas
export const CreateCompetitionResultSchema = z.object({
  childId: z.string().uuid('ID de niño inválido'),
  competitionId: z.string().uuid('ID de competencia inválido'),
  swimStyle: z.nativeEnum(record_style),
  timeInSeconds: z.number().positive('Tiempo debe ser positivo'),
  medal: z.nativeEnum(record_medal).optional(),
  position: z.number().int().positive().optional(),
  notes: z.string().optional()
})

export const UpdateCompetitionResultSchema = CreateCompetitionResultSchema.partial()

// Training schemas
export const CreateTrainingSchema = z.object({
  childId: z.string().uuid('ID de niño inválido'),
  date: z.string().transform((str) => new Date(str)),
  duration: z.number().positive('Duración debe ser positiva'),
  distance: z.number().positive('Distancia debe ser positiva'),
  swimStyle: z.nativeEnum(record_style),
  notes: z.string().optional(),
  avgHeartRate: z.number().int().positive().optional(),
  caloriesBurned: z.number().int().positive().optional()
})

export const UpdateTrainingSchema = CreateTrainingSchema.partial()

// UserChild relationship schemas
export const CreateUserChildSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  childId: z.string().uuid('ID de niño inválido'),
  parentType: ParentTypeEnum,
  isEmergencyContact: z.boolean().default(false),
  canPickUp: z.boolean().default(true),
  notes: z.string().optional()
})

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido')
})

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'Nombre completo requerido'),
  role: z.nativeEnum(user_role).default(user_role.PARENT),
  phone: z.string().optional()
})

// Query parameter schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
})

export const FilterSchema = z.object({
  clubId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  role: z.nativeEnum(user_role).optional()
})

// Generic validation utilities
export const validateUUID = (id: string) => {
  const result = z.string().uuid().safeParse(id)
  return result.success
}

export const validateEmail = (email: string) => {
  const result = z.string().email().safeParse(email)
  return result.success
}

// Type exports for better TypeScript integration
export type CreateUserData = z.infer<typeof CreateUserSchema>
export type UpdateUserData = z.infer<typeof UpdateUserSchema>
export type CreateChildData = z.infer<typeof CreateChildSchema>
export type UpdateChildData = z.infer<typeof UpdateChildSchema>
export type CreateClubData = z.infer<typeof CreateClubSchema>
export type UpdateClubData = z.infer<typeof UpdateClubSchema>
export type CreateCompetitionData = z.infer<typeof CreateCompetitionSchema>
export type UpdateCompetitionData = z.infer<typeof UpdateCompetitionSchema>
export type CreateTrainingData = z.infer<typeof CreateTrainingSchema>
export type UpdateTrainingData = z.infer<typeof UpdateTrainingSchema>
export type LoginData = z.infer<typeof LoginSchema>
export type RegisterData = z.infer<typeof RegisterSchema>