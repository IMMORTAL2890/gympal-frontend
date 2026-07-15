export function buildWaLink(mobile: string, text: string): string {
  // Strip all non-digit characters
  const digits = mobile.replace(/\D/g, '');
  
  // Ensure leading country code for India (91) is present
  let formattedPhone = digits;
  if (digits.length === 10) {
    formattedPhone = `91${digits}`;
  } else if (digits.length > 10 && !digits.startsWith('91')) {
    // If it's a long number but does not start with 91, we prepend 91 for safety
    formattedPhone = `91${digits.slice(-10)}`;
  } else if (digits.length < 10) {
    // If too short, just use digits
    formattedPhone = `91${digits}`;
  }

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}
