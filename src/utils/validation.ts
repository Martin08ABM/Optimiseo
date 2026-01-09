export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos una letra minúscula' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos una letra mayúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos un número' };
  }
  if (!/[@#$%^&*()_+\-=\[\]{}|;:'",.<>?]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos un símbolo especial' };
  }
  return { isValid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string, maxLength: number = 50): string {
  if (!input) return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>&"']/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[char] || char;
    });
}
