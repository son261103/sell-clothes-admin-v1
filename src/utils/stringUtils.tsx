// Bảng chuyển đổi các ký tự tiếng Việt có dấu sang không dấu
const VIETNAMESE_MAP: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    // Chữ hoa
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
};

/**
 * Chuyển đổi ký tự có dấu thành không dấu
 * @param str Chuỗi cần chuyển đổi
 * @returns Chuỗi đã được chuyển đổi
 */
const removeVietnameseTones = (str: string): string => {
    return str.split('').map(char => VIETNAMESE_MAP[char] || char).join('');
};

/**
 * Tạo slug từ chuỗi đầu vào
 * @param text Chuỗi cần chuyển đổi thành slug
 * @returns Slug đã được tạo
 */
export const generateSlug = (text: string): string => {
    if (!text) return '';

    return removeVietnameseTones(text)
        // Chuyển về chữ thường
        .toLowerCase()
        // Thay thế các ký tự đặc biệt bằng dấu gạch ngang
        .replace(/[^\w\s-]/g, '')
        // Thay thế khoảng trắng bằng dấu gạch ngang
        .replace(/\s+/g, '-')
        // Loại bỏ các dấu gạch ngang liên tiếp
        .replace(/-+/g, '-')
        // Cắt bỏ dấu gạch ngang ở đầu và cuối
        .trim()
        .replace(/^-+|-+$/g, '');
};

/**
 * Kiểm tra chuỗi có phải là slug hợp lệ không
 * @param slug Chuỗi cần kiểm tra
 * @returns true nếu là slug hợp lệ, false nếu không
 */
export const isValidSlug = (slug: string): boolean => {
    // Slug chỉ chứa chữ thường, số và dấu gạch ngang
    // Không bắt đầu hoặc kết thúc bằng dấu gạch ngang
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
};

/**
 * Chuẩn hóa slug
 * @param slug Slug cần chuẩn hóa
 * @returns Slug đã được chuẩn hóa
 */
export const normalizeSlug = (slug: string): string => {
    return slug
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
};

/**
 * Tạo slug từ text với optional suffix để tránh trùng lặp
 * @param text Text cần tạo slug
 * @param suffix Suffix để thêm vào slug (optional)
 * @returns Slug đã được tạo
 */
export const generateUniqueSlug = (text: string, suffix?: number): string => {
    const baseSlug = generateSlug(text);
    if (typeof suffix === 'number') {
        return `${baseSlug}-${suffix}`;
    }
    return baseSlug;
};