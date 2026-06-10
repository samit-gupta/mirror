export function getAuthErrorMessage(error) {
  if (!error?.message) {
    return 'Something went wrong. Please try again.'
  }

  return error.message
}

export function validateEmail(email) {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.'
  }

  return null
}

export function validatePassword(password, { minLength = 6 } = {}) {
  if (!password) {
    return 'Password is required.'
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`
  }

  return null
}
