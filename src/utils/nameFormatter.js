/**
 * Smart Name Formatter for Classroom Seating Chart & Cards
 * Rule:
 * 1. Default display: Middle Name + Last Name (Chữ lót + Tên, e.g. Nguyễn Minh Bảy -> Minh Bảy)
 * 2. If duplicate Middle Name + Last Name exists in class: Display First Name + Last Name (Họ + Tên, e.g. Nguyễn Bảy / Trần Bảy)
 */
export const getSmartDisplayName = (fullName = '', allStudents = []) => {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  
  // If 1 or 2 words (e.g. "Mai Anh", "Văn Hải"), return as is
  if (parts.length <= 2) return fullName.trim();

  // Extract Middle Name + Last Name (Chữ lót + Tên)
  const middleAndLast = parts.slice(parts.length - 2).join(' ');

  // Count how many students in the class have the same middleAndLast
  const duplicates = allStudents.filter(s => {
    if (!s.full_name) return false;
    const sParts = s.full_name.trim().split(/\s+/);
    if (sParts.length <= 2) return s.full_name.trim().toLowerCase() === fullName.trim().toLowerCase();
    const sMiddleAndLast = sParts.slice(sParts.length - 2).join(' ');
    return sMiddleAndLast.toLowerCase() === middleAndLast.toLowerCase();
  });

  // If duplicate middleAndLast exists, fallback to First Name + Last Name (Họ + Tên)
  if (duplicates.length > 1) {
    const firstWord = parts[0]; // Họ (e.g. "Nguyễn")
    const lastWord = parts[parts.length - 1]; // Tên (e.g. "Bảy")
    return `${firstWord} ${lastWord}`; // e.g. "Nguyễn Bảy"
  }

  return middleAndLast; // e.g. "Minh Bảy"
};
