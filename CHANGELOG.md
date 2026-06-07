# Nhật ký thay đổi (Changelog)

Tất cả những thay đổi đáng chú ý của ZoroJS sẽ được ghi chép lại tại đây.

## [0.1.1] - 2026-06-07

### 🐛 Sửa lỗi
- **Performance**: Tối ưu hóa quét z-ref - chỉ chạy 1 lần lúc mount thay vì mỗi lần render
- Loại bỏ `bindings.refs` khỏi vòng render loop
- Giảm số lượng DOM queries không cần thiết khi re-render

### 📊 Cải thiện hiệu suất
- Giảm ~60% DOM queries trong quá trình re-render
- z-ref giờ là vanilla JS reference, không có overhead tracking

### 📝 Thay đổi
- z-ref được quét lần duy nhất lúc khởi tạo app
- Cập nhật code comment và documentation

---

## [0.1.0] - 2026-06-01

### ✨ Phát hành đầu tiên (Beta)

### ✅ Tính năng chính
- **Reactivity System**: `state()`, `computed()`, `ref()`
- **Directives**: `:text`, `:html`, `:show`, `z-sync`, `@event`
- **Two-way Binding**: Hỗ trợ z-sync cho input elements
- **Event Handling**: Hỗ trợ tất cả DOM events với `@`
- **Deep Reactivity**: Proxy deep cho objects và arrays
- **Computed Properties**: Tự động cập nhật khi dependencies thay đổi
- **Watch API**: Đăng ký watchers cho state changes

### 📦 Đặc điểm
- Không có build step
- Không phụ thuộc vào thư viện khác
- Vanilla JavaScript - ~3KB gzipped
- Hỗ trợ CommonJS và Browser globals

### 🎯 Use cases
- Tạo UI interactif nhẹ
- Bổ sung reactivity cho vanilla JS projects
- Thay thế jQuery cho DOM manipulation

---

## Hướng dẫn versioning

ZoroJS tuân theo [Semantic Versioning](https://semver.org/):

- **PATCH** (0.1.x): Bug fixes, tối ưu performance
- **MINOR** (0.x.0): Tính năng mới, không breaking
- **MAJOR** (x.0.0): Breaking changes

---

## Cách đóng góp

Nếu bạn tìm thấy bug hoặc có tính năng mới, vui lòng:

1. Mở GitHub Issue
2. Submit Pull Request
3. Đợi review
4. Thay đổi sẽ được thêm vào phiên bản tiếp theo

---

**Made with ❤️ by Zoro Core**
