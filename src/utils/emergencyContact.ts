import type { FormRules } from 'element-plus'

export interface EmergencyContact {
  emergencyContactName: string
  emergencyContactPhone: string
}

export const DEFAULT_EMERGENCY_CONTACT: EmergencyContact = {
  emergencyContactName: '',
  emergencyContactPhone: ''
}

export const EMERGENCY_CONTACT_FIELDS = Object.keys(
  DEFAULT_EMERGENCY_CONTACT
) as (keyof EmergencyContact)[]

export const EMERGENCY_CONTACT_VALIDATION_RULES: FormRules = {
  emergencyContactName: [
    { required: true, message: '请填写紧急联系人姓名', trigger: 'blur' }
  ],
  emergencyContactPhone: [
    { required: true, message: '请填写紧急联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

export function displayContactName(contact: Partial<EmergencyContact>): string {
  return contact.emergencyContactName || '-'
}

export function displayContactPhone(contact: Partial<EmergencyContact>): string {
  return contact.emergencyContactPhone || '-'
}

export function extractEmergencyContact<T extends EmergencyContact>(
  source: T
): EmergencyContact {
  return {
    emergencyContactName: source.emergencyContactName,
    emergencyContactPhone: source.emergencyContactPhone
  }
}

export function withEmergencyContactDefaults<T extends Partial<EmergencyContact>>(
  source: T
): T & EmergencyContact {
  return {
    ...DEFAULT_EMERGENCY_CONTACT,
    ...source
  }
}
