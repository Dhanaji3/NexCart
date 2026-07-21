import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhone,
  validateZipCode,
  validatePrice,
  validateAddress,
} from '../src/utils/validators'

describe('Validator Utils', () => {
  describe('validateEmail', () => {
    it('accepts valid emails', () => {
      expect(validateEmail('user@example.com').valid).toBe(true)
      expect(validateEmail('name.last@domain.co').valid).toBe(true)
    })

    it('rejects empty email', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Email is required')
    })

    it('rejects invalid format', () => {
      expect(validateEmail('notanemail').valid).toBe(false)
      expect(validateEmail('@domain.com').valid).toBe(false)
      expect(validateEmail('user@').valid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('accepts valid passwords', () => {
      expect(validatePassword('password123').valid).toBe(true)
      expect(validatePassword('123456').valid).toBe(true)
    })

    it('rejects empty password', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Password is required')
    })

    it('rejects short passwords', () => {
      const result = validatePassword('12345')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('at least 6')
    })

    it('rejects too long passwords', () => {
      const result = validatePassword('a'.repeat(129))
      expect(result.valid).toBe(false)
      expect(result.message).toContain('less than 128')
    })
  })

  describe('validateRequired', () => {
    it('accepts non-empty values', () => {
      expect(validateRequired('hello').valid).toBe(true)
    })

    it('rejects empty strings', () => {
      const result = validateRequired('', 'Name')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Name is required')
    })

    it('rejects whitespace-only', () => {
      expect(validateRequired('   ', 'Field').valid).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('accepts valid phone numbers', () => {
      expect(validatePhone('555-1234567').valid).toBe(true)
      expect(validatePhone('+1 (555) 123-4567').valid).toBe(true)
    })

    it('rejects empty phone', () => {
      expect(validatePhone('').valid).toBe(false)
    })

    it('rejects invalid phone', () => {
      expect(validatePhone('abc').valid).toBe(false)
      expect(validatePhone('123').valid).toBe(false)
    })
  })

  describe('validateZipCode', () => {
    it('accepts valid US zip codes', () => {
      expect(validateZipCode('10001').valid).toBe(true)
      expect(validateZipCode('90210-1234').valid).toBe(true)
    })

    it('rejects invalid zip codes', () => {
      expect(validateZipCode('123').valid).toBe(false)
      expect(validateZipCode('abcde').valid).toBe(false)
    })
  })

  describe('validatePrice', () => {
    it('accepts valid prices', () => {
      expect(validatePrice(29.99).valid).toBe(true)
      expect(validatePrice(0).valid).toBe(true)
    })

    it('rejects negative prices', () => {
      expect(validatePrice(-10).valid).toBe(false)
    })

    it('rejects NaN', () => {
      expect(validatePrice(NaN).valid).toBe(false)
    })
  })

  describe('validateAddress', () => {
    it('returns no errors for valid address', () => {
      const errors = validateAddress({
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        phone: '555-1234567',
      })
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns errors for empty address', () => {
      const errors = validateAddress({})
      expect(errors.fullName).toBeDefined()
      expect(errors.street).toBeDefined()
      expect(errors.city).toBeDefined()
      expect(errors.state).toBeDefined()
      expect(errors.zipCode).toBeDefined()
      expect(errors.country).toBeDefined()
      expect(errors.phone).toBeDefined()
    })

    it('returns specific field errors', () => {
      const errors = validateAddress({
        fullName: 'John',
        street: '123 Main St',
        city: '',
        state: 'NY',
        zipCode: 'bad',
        country: 'US',
        phone: '555-1234567',
      })
      expect(errors.city).toBeDefined()
      expect(errors.zipCode).toBeDefined()
      expect(errors.fullName).toBeUndefined()
    })
  })
})
