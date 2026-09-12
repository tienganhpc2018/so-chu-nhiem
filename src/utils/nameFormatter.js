/**
 * Smart Name Formatter for Classroom Seating Chart & Cards
 * Quy tắc rút gọn tên thông minh cho sơ đồ lớp học Việt Nam:
 * 1. Mặc định hiển thị: Chữ lót (tên đệm) + Tên (ví dụ: Nguyễn Minh Bảy -> "Minh Bảy", Lê Thị Thanh Thảo -> "Thanh Thảo")
 * 2. Nếu có học sinh khác trong lớp trùng cả Chữ lót + Tên: Hiển thị Họ + Tên (ví dụ: "Nguyễn Bảy" / "Trần Bảy")
 * 3. Nếu vẫn trùng cả Họ + Tên: Hiển thị 3 chữ (ví dụ: "Thị Ngọc Mai" / "Hoàng Ngọc Mai")
 */
export const getSmartDisplayName = (fullName = '', allStudents = []) => {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  
  // Nếu chỉ có 1 hoặc 2 từ (ví dụ: "Mai Anh", "Văn Hải"), trả về nguyên vẹn
  if (parts.length <= 2) return fullName.trim();

  // Chữ lót + Tên (2 từ cuối cùng, ví dụ: "Thái An", "Thanh Thảo")
  const middleAndLast = parts.slice(parts.length - 2).join(' ');

  // Đếm số lượng học sinh trong lớp có cùng chữ lót + tên
  const dupMiddle = allStudents.filter(s => {
    if (!s || !s.full_name) return false;
    const sParts = s.full_name.trim().split(/\s+/);
    if (sParts.length <= 2) return s.full_name.trim().toLowerCase() === middleAndLast.toLowerCase();
    const sMiddleAndLast = sParts.slice(sParts.length - 2).join(' ');
    return sMiddleAndLast.toLowerCase() === middleAndLast.toLowerCase();
  });

  // Nếu bị trùng chữ lót + tên, chuyển sang lấy Họ + Tên
  if (dupMiddle.length > 1) {
    const firstWord = parts[0]; // Họ (ví dụ: "Nguyễn", "Trần")
    const lastWord = parts[parts.length - 1]; // Tên (ví dụ: "An", "Mai")
    const firstAndLast = `${firstWord} ${lastWord}`;

    // Kiểm tra xem Họ + Tên có bị trùng tiếp không
    const dupFirstLast = allStudents.filter(s => {
      if (!s || !s.full_name) return false;
      const sParts = s.full_name.trim().split(/\s+/);
      const sFirst = sParts[0];
      const sLast = sParts[sParts.length - 1];
      return `${sFirst} ${sLast}`.toLowerCase() === firstAndLast.toLowerCase();
    });

    if (dupFirstLast.length > 1) {
      // Nếu trùng cả Họ + Tên thì lấy 3 chữ cuối
      return parts.slice(-3).join(' ');
    }

    return firstAndLast;
  }

  return middleAndLast;
};
