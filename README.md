# LNC PhotoStudio - Premium Landing Page

Website dành cho studio nhiếp ảnh chuyên nghiệp LNC PhotoStudio, tập trung vào dịch vụ chụp ảnh thẻ chuyên nghiệp và phục hồi ảnh cũ bằng AI. 

Được thiết kế với giao diện UI/UX chuẩn Premium (tone Đen/Vàng Gold sang trọng) mang lại cảm giác chuyên nghiệp, đẳng cấp và tối ưu tỷ lệ chuyển đổi (CRO).

## 🌟 Tính Năng Nổi Bật

- **Thiết kế Premium**: Giao diện tối (Dark mode) kết hợp màu vàng gold, hiệu ứng cuộn (scroll animations) mượt mà.
- **Before/After Slider**: Thanh trượt so sánh ảnh trước - sau trực quan cho dịch vụ phục hồi ảnh AI.
- **Thư Viện Ảnh (Gallery)**: Lưới ảnh Masonry kết hợp Lightbox để xem chi tiết ảnh.
- **Đặt Lịch Nhanh (Booking Form)**: Form liên hệ được tích hợp Google Apps Script, tự động lưu thông tin khách hàng trực tiếp về Google Sheets trong chưa tới 1 giây.
- **Admin Panel (Headless CMS)**: Tích hợp trang quản trị riêng để chủ website có thể thay đổi text, hình ảnh mà không cần biết code.

## 🛠 Kiến Trúc Kỹ Thuật

Dự án này sử dụng kiến trúc tĩnh (Static) 100% để tối ưu tốc độ và không tốn chi phí duy trì Server/Database.

- **Frontend**: HTML5, CSS3 thuần (sử dụng CSS Variables và Flexbox/Grid) và Vanilla JavaScript.
- **Lưu Trữ Dữ Liệu (CMS)**: Không dùng Database. Toàn bộ nội dung chữ được lưu trữ tại file `data.json`.
- **Quản Trị Web (Admin)**: Trang `admin.html` sử dụng **GitHub REST API** để tương tác. Người dùng dùng GitHub Token để đăng nhập, khi thay đổi text hoặc up ảnh mới, code sẽ push trực tiếp lên kho lưu trữ GitHub.
- **Triển khai (Deployment)**: Kết nối tự động qua Vercel. Mỗi khi có thay đổi trên nhánh GitHub (kể cả từ trang Admin), Vercel sẽ tự động build và cập nhật website.
- **Database Khách Hàng**: Google Sheets thông qua Google Apps Script Web App.

## 📁 Cấu Trúc Thư Mục

```text
/
├── index.html        # Trang đích (Landing page) chính
├── styles.css        # Hệ thống Design System & Style cho toàn bộ trang
├── script.js         # Logic tương tác (Slider, Animations, Form Submit, Hydration)
├── data.json         # File dữ liệu trung tâm (Nơi trang Admin lưu nội dung)
├── admin.html        # Giao diện Đăng nhập & Bảng điều khiển trang Quản trị
├── admin.css         # Style dành riêng cho Admin Panel
├── admin.js          # Logic kết nối GitHub API và xử lý Form quản trị
├── images/           # Thư mục chứa hình ảnh (Hero, Gallery, Before/After...)
└── README.md         # File tài liệu dự án này
```

## 🚀 Hướng Dẫn Vận Hành

### 1. Quản lý nội dung trang web
- Truy cập vào: `[Tên-miền-Vercel-của-bạn]/admin.html`
- Đăng nhập bằng **GitHub Personal Access Token** (loại Classic, cấp quyền `repo`).
- Thay đổi chữ, cập nhật hình ảnh trực quan trên Dashboard.
- Nhấn "Lưu & Cập nhật Web", hệ thống sẽ đẩy thẳng lên GitHub và Vercel tự update.

### 2. Quản lý khách hàng đặt lịch
- Thông tin khách đặt lịch qua Form ở cuối trang sẽ đổ trực tiếp về Google Sheets.
- Xem hướng dẫn cài đặt Google Sheets tại file `GoogleSheetsSetup.md` nếu cần cài đặt lại API.

---
*Dự án được xây dựng tự động bởi AI Coding Assistant.*
