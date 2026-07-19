export function getFriendlyErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  
  const rawMessage = typeof err === 'string' 
    ? err 
    : err.message || err.error || 'An unexpected error occurred';
    
  const lowerMsg = rawMessage.toLowerCase();

  // 1. Business validation & conflict rules
  if (lowerMsg.includes('email is already registered') || lowerMsg.includes('duplicate email')) {
    return 'This email address is already registered. Please log in or try another email.';
  }
  if (lowerMsg.includes('mobile number is already registered') || lowerMsg.includes('duplicate phone') || lowerMsg.includes('mobile number is already')) {
    return 'This mobile number is already registered. Please check the number or contact support.';
  }
  if (lowerMsg.includes('invalid email or password') || lowerMsg.includes('unauthorized') || lowerMsg.includes('bad credentials')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (lowerMsg.includes('password must be at least')) {
    return 'The password is too short. It must be at least 6 characters.';
  }
  if (lowerMsg.includes('mobile number must be')) {
    return 'Please enter a valid mobile number between 7 and 15 digits.';
  }
  if (lowerMsg.includes('session expired')) {
    return 'Your session has expired. Please log in again.';
  }

  // 2. Technical exceptions / backend crashes (UnexpectedRollbackException, NullPointerException, database, internal server errors)
  if (
    lowerMsg.includes('transaction') ||
    lowerMsg.includes('rollback') ||
    lowerMsg.includes('sql') ||
    lowerMsg.includes('database') ||
    lowerMsg.includes('connection') ||
    lowerMsg.includes('nullpointer') ||
    lowerMsg.includes('internal server error') ||
    lowerMsg.includes('syntax') ||
    lowerMsg.includes('hibernate') ||
    lowerMsg.includes('500') ||
    lowerMsg.includes('unexpected') ||
    lowerMsg.includes('refuse') ||
    lowerMsg.includes('failed to fetch')
  ) {
    return 'We encountered a technical issue on our server. Please try again in a few moments or contact support.';
  }

  // 3. Fallback: if it's a short validation-like message, return it directly. Otherwise return generic.
  if (rawMessage.length < 80 && !lowerMsg.includes('exception') && !lowerMsg.includes('error') && !lowerMsg.includes('fail')) {
    return rawMessage;
  }

  console.error('[FitTrack Developer Log] Technical API error occurred:', rawMessage);
  return 'An unexpected error occurred. Please try again later.';
}
