// nameHelper.js - Xử lý hiển thị tên học sinh theo chuẩn: Chữ lót + Tên (nếu trùng thì lấy Họ + Tên)

export function getShortStudentName(fullName, allStudents = []) {
  if (!fullName || typeof fullName !== 'string') return 'Học sinh';

  const cleanName = fullName.trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);

  // Nếu chỉ có 1 hoặc 2 từ (Ví dụ: "Trúc Mai", "Minh Thư") -> giữ nguyên
  if (parts.length <= 2) {
    return cleanName;
  }

  // Chữ lót + Tên = 2 từ cuối cùng (Ví dụ: "Nguyễn Minh Anh" -> "Minh Anh")
  const middleAndLast = parts.slice(-2).join(' ');
  // Họ + Tên = Từ đầu tiên + Từ cuối cùng (Ví dụ: "Nguyễn Anh")
  const firstAndLast = `${parts[0]} ${parts[parts.length - 1]}`;

  // Kiểm tra xem trong lớp có bạn nào khác cũng có cùng (Chữ lót + Tên) không
  let hasDuplicateMiddleLast = false;

  if (Array.isArray(allStudents) && allStudents.length > 0) {
    for (const other of allStudents) {
      const otherFullName = (other?.name || other?.full_name || '').trim();
      // Không so sánh với chính mình (nếu cùng id hoặc cùng full name duy nhất)
      if (!otherFullName || otherFullName === cleanName) continue;

      const otherParts = otherFullName.split(/\s+/).filter(Boolean);
      let otherMiddleAndLast = '';

      if (otherParts.length <= 2) {
        otherMiddleAndLast = otherFullName;
      } else {
        otherMiddleAndLast = otherParts.slice(-2).join(' ');
      }

      if (otherMiddleAndLast.toLowerCase() === middleAndLast.toLowerCase()) {
        hasDuplicateMiddleLast = true;
        break;
      }
    }
  }

  // Nếu bị trùng Chữ lót + Tên -> lấy Họ + Tên
  if (hasDuplicateMiddleLast) {
    // Kiểm tra tiếp nếu Họ + Tên vẫn trùng với bạn khác
    let hasDuplicateFirstLast = false;
    for (const other of allStudents) {
      const otherFullName = (other?.name || other?.full_name || '').trim();
      if (!otherFullName || otherFullName === cleanName) continue;

      const otherParts = otherFullName.split(/\s+/).filter(Boolean);
      const otherFL = otherParts.length <= 2 ? otherFullName : `${otherParts[0]} ${otherParts[otherParts.length - 1]}`;

      if (otherFL.toLowerCase() === firstAndLast.toLowerCase()) {
        hasDuplicateFirstLast = true;
        break;
      }
    }

    // Nếu trùng cả Họ + Tên thì hiển thị đầy đủ cả họ tên để phân biệt
    if (hasDuplicateFirstLast) {
      return cleanName;
    }

    return firstAndLast;
  }

  return middleAndLast;
}
