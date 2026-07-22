export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return { valid: false, message: "Email is required" };
  if (!emailRegex.test(email))
    return { valid: false, message: "Invalid email format" };
  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 6)
    return { valid: false, message: "Password must be at least 6 characters" };
  if (password.length > 128)
    return {
      valid: false,
      message: "Password must be less than 128 characters",
    };
  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: string,
  fieldName = "Field",
): ValidationResult {
  if (!value || !value.trim())
    return { valid: false, message: `${fieldName} is required` };
  return { valid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
  if (!phone.trim())
    return { valid: false, message: "Phone number is required" };
  if (!phoneRegex.test(phone))
    return { valid: false, message: "Invalid phone number format" };
  return { valid: true };
}

/**
 * Validate zip/postal code
 */
export function validateZipCode(zip: string): ValidationResult {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zip.trim()) return { valid: false, message: "Zip code is required" };
  if (!zipRegex.test(zip))
    return { valid: false, message: "Invalid zip code format" };
  return { valid: true };
}

/**
 * Validate price (positive number)
 */
export function validatePrice(price: number): ValidationResult {
  if (price === null || price === undefined)
    return { valid: false, message: "Price is required" };
  if (isNaN(price)) return { valid: false, message: "Price must be a number" };
  if (price < 0) return { valid: false, message: "Price must be positive" };
  return { valid: true };
}

/**
 * Validate a full address
 */
export function validateAddress(address: {
  fullName?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameResult = validateRequired(address.fullName || "", "Full name");
  if (!nameResult.valid) errors.fullName = nameResult.message!;

  const streetResult = validateRequired(address.street || "", "Street address");
  if (!streetResult.valid) errors.street = streetResult.message!;

  const cityResult = validateRequired(address.city || "", "City");
  if (!cityResult.valid) errors.city = cityResult.message!;

  const stateResult = validateRequired(address.state || "", "State");
  if (!stateResult.valid) errors.state = stateResult.message!;

  const zipResult = validateZipCode(address.zipCode || "");
  if (!zipResult.valid) errors.zipCode = zipResult.message!;

  const countryResult = validateRequired(address.country || "", "Country");
  if (!countryResult.valid) errors.country = countryResult.message!;

  const phoneResult = validatePhone(address.phone || "");
  if (!phoneResult.valid) errors.phone = phoneResult.message!;

  return errors;
}
