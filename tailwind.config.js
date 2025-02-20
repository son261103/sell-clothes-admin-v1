/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				// Màu nền cho dark mode và light mode
				darkBackground: '#262626',     // Nền đen cho dark mode
				lightBackground: '#fcf4f4',    // Nền sáng (màu kem) cho light mode

				// Màu chủ đạo
				primary: '#bd8790',            // Màu hồng nhạt chủ đạo

				// Màu phụ và nhấn
				secondary: '#4e4b56',          // Màu xám đậm cho phần văn bản phụ
				accent: '#f5a623',             // Màu vàng cam cho các điểm nhấn

				// Màu cho văn bản
				textLight: '#d8e2dc',          // Màu xám nhạt cho văn bản chính trên nền tối
				textDark: '#262626',           // Màu đen cho văn bản chính trên nền sáng

				// Màu cho các chi tiết khác
				highlight: '#d8e2dc',          // Màu xám nhạt để làm nổi bật các phần tử nhỏ

				// Các màu sắc cho các thành phần khác (nếu có)
				background: '#fcf4f4',         // Nền sáng
				foreground: '#262626',         // Nền tối
				card: '#f5f5f5',               // Màu nền của thẻ (card)
				popover: '#ffffff',            // Màu nền của popover
				muted: '#f3f4f6',              // Màu nhạt (thường cho văn bản phụ)
				destructive: '#e11d48',        // Màu đỏ cho các thành phần huỷ bỏ
				border: '#d1d5db',             // Màu cho viền (border)
				input: '#f3f4f6',              // Màu nền của input
				ring: '#f5a623',               // Màu viền khi focus
				chart: {
					'1': '#f5a623',           // Màu cho biểu đồ
					'2': '#bd8790',           // Màu thứ 2 cho biểu đồ
					'3': '#4e4b56',           // Màu thứ 3 cho biểu đồ
					'4': '#262626',           // Màu thứ 4 cho biểu đồ
					'5': '#d8e2dc'            // Màu thứ 5 cho biểu đồ
				}
			},
		},
	},
	darkMode: 'class',
	plugins: [
		require('daisyui'),
		require('tailwind-scrollbar'),
	],
}