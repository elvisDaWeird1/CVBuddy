# AI Frontend Context

## 1. Project Overview

Đây là project frontend cho website **tạo CV và Portfolio cho sinh viên**, dùng stack:

- React 19 + Vite
- TypeScript (strict mode)
- Tailwind CSS v4
- Zod
- React Hook Form
- Axios
- React Router DOM v7

Mục tiêu: sinh viên upload CV → AI phân tích → tạo portfolio chuyên nghiệp.

---

## 2. Current Design Palette

```css
:root {
  --color-bg-main: #F8FAFC;
  --color-bg-soft: #E6F7FB;
  --color-navy: #081020;
  --color-teal: #006A78;
  --color-cyan: #50D8F4;
  --color-amber: #FFB84D;
}
```

| Token             | Mục đích                              |
|-------------------|---------------------------------------|
| `--color-bg-main` | Nền chính                             |
| `--color-bg-soft` | Nền phụ, section nhẹ                 |
| `--color-navy`    | Heading, text chính, sidebar          |
| `--color-teal`    | Primary, button chính, link           |
| `--color-cyan`    | Accent, hover, focus                  |
| `--color-amber`   | CTA phụ, warning, highlight           |

---

## 3. What Has Been Done

### Frontend Foundation

- Đã setup project React Vite + TypeScript (strict mode).
- Đã setup Tailwind CSS v4 với `@tailwindcss/vite` plugin (không có `tailwind.config.js`).
- TypeScript config: `baseUrl: "src"` + `paths` alias `@/` → `src/*`, dùng `ignoreDeprecations: "6.0"` để bypass lỗi TS 6.0.
- Vite path alias `@` → `src/` đã config trong `vite.config.ts`.
- Folder structure đã tạo:

```
src/
  apis/          - Axios config + httpClient + interceptors
  components/
    ui/          - Button, Input, Select, Form, Card, Badge, Avatar, Icons
  config/        - API_BASE_URL từ env
  consts/
  hooks/
  layouts/
  modules/
  routes/
  stores/
  types/
  utils/
    cn.ts        - clsx + tailwind-merge
  index.css      - Design tokens
  App.tsx        - BrowserRouter + Routes
```

- Axios instance đã config: baseURL từ `VITE_API_URL`, timeout, request/response interceptors.
- React Router v7 đã setup với lazy loading.
- File `.env` chứa `VITE_API_URL=http://localhost:3000/api`.

### UI System

- Design tokens đã định nghĩa trong `src/index.css` (CSS custom properties).
- `cn()` utility đã tạo tại `src/utils/cn.ts` (clsx + tailwind-merge).
- Các component UI chính đã tạo trong `src/components/ui/`:
  - `button.tsx` - CVA, 6 variants, 3 sizes
  - `input.tsx` - Label, helperText, error, icons
  - `select.tsx` - Options array, placeholder
  - `form.tsx` - FormGroup + Form wrapper
  - `card.tsx` - Compound component
  - `icons.tsx` - SVG icon components

### Static UI Preview

Đã chuyển từ React route preview sang **static HTML preview**.

**File preview chính:**
```
public/ui-preview.html
```

**Đường dẫn preview:**
```
http://localhost:5173/ui-preview.html
```

File này là **HTML + CSS thuần**, không phụ thuộc React route, không có JavaScript.

#### Các Phase đã thực hiện:

| Phase | Nội dung                                   | Trạng thái |
|-------|-------------------------------------------|------------|
| 1     | Header, Color Palette, Typography          | ✅ Done    |
| 2     | Buttons, Form Elements, Card/Badge/Avatar  | ✅ Done    |
| 3     | Feedback, State Components, Table/Search/Filter/Pagination | ✅ Done |
| 4A    | Tabs, Stepper                             | ✅ Done    |
| 4B    | Layout Preview (AuthLayout + DashboardLayout), Final review note | ✅ Done |

**Tổng cộng 11 sections trong preview:**
1. Header
2. Color Palette
3. Typography
4. Buttons
5. Form Elements
6. Card / Badge / Avatar
7. Feedback (Alert + Toast)
8. State Components (Spinner, Skeleton, Empty, Error, Upload Zone)
9. Table / Search / Filter / Pagination
10. Tabs
11. Stepper
12. Layout Preview (AuthLayout mockup + DashboardLayout mockup)
13. Final review note

---

## 4. Important Decisions

1. **Không dùng React route `/ui-preview`** để preview UI nữa.
2. **Không tạo file `.tsx`** preview nữa.
3. **Chỉ dùng `public/ui-preview.html`** để review UI tổng quan — HTML + CSS thuần, không React.
4. File preview chỉ dùng để xem giao diện, **không ảnh hưởng production components**.
5. **Không dùng script generator** (Python/Node/base64) để tạo HTML — đã gây lỗi nhiều lần.
6. **Khi cần chỉnh preview, chỉ chỉnh trực tiếp `public/ui-preview.html`** bằng Write/Edit tool.
7. Mỗi phase làm riêng, không merge tất cả vào một lần.

---

## 5. Previous Errors and Lessons Learned

### Lỗi 1: AI tạo quá nhiều file cùng lúc
- **Nguyên nhân:** Cố setup toàn bộ folder structure + components trong một lần.
- **Hậu quả:** Lỗi đa nơi, khó debug, file bị ghi đè.
- **Cách tránh:** Chia task thành phase nhỏ. Mỗi lần chỉ làm một nhóm file hoặc một section.

### Lỗi 2: React preview route bị fail
- **Nguyên nhân:** Tạo route `/ui-preview` trỏ đến file không tồn tại (`src/modules/admin/UIPreview.tsx`).
- **Hậu quả:** Build fail, 404 khi truy cập `/ui-preview`.
- **Cách tránh:**
  - Không tạo lại route `/ui-preview`.
  - Không tạo preview bằng `.tsx`.
  - Dùng `public/ui-preview.html` (static, không cần route).

### Lỗi 3: Script generator bị lỗi
- **Nguyên nhân:** Cố tạo HTML bằng Python/Node/base64, gặp lỗi escaping dấu ngoặc, dấu `$`, CSS có quotes.
- **Hậu quả:** File HTML bị cắt ngang, thiếu thẻ đóng, CSS lỗi.
- **Cách tránh:**
  - Không dùng Python.
  - Không dùng Node.js.
  - Không dùng base64.
  - Không dùng script generator.
  - Chỉ dùng Write tool (file mới) và Edit tool (chèn/sửa section).

### Lỗi 4: File preview quá lớn trong một lần
- **Nguyên nhân:** Cố tạo toàn bộ file HTML (1000+ dòng) trong một Write tool call.
- **Hậu quả:** Request bị gián đoạn, file bị cắt ngang, HTML không hợp lệ.
- **Cách tránh:**
  - Làm từng phase nhỏ (Phase 1, 2, 3, 4A, 4B).
  - Mỗi phase thêm CSS và HTML riêng.
  - Không rewrite toàn bộ file nếu không cần.
  - Chỉ chèn thêm hoặc chỉnh phần liên quan.

### Lỗi 5: Edit tool "String to replace not found"
- **Nguyên nhân:** Dùng anchor string quá chung (ví dụ: `</style>` xuất hiện nhiều lần trong file).
- **Hậu quả:** Edit fail, không biết replace chỗ nào.
- **Cách tránh:**
  - Dùng anchor cụ thể, duy nhất trong file (ví dụ: replace block `.avatar-amber { ... }\n</style>`).
  - Hoặc dùng anchor gần vị trí cần chèn.

---

## 6. Rules for Future AI

- **Luôn kiểm tra file hiện tại trước khi sửa** — Read tool trước, Edit tool sau.
- **Không làm lại từ đầu** nếu project đã có sẵn.
- **Không tự ý xóa code cũ.**
- **Không tự ý sửa route** (`src/routes/`, `src/App.tsx`).
- **Không tự ý tạo thêm page `.tsx`** để preview.
- **Không tự ý đổi palette** — chỉ dùng 6 màu đã định nghĩa.
- **Không thêm UI library** như MUI, Ant Design, shadcn/ui nếu chưa được yêu cầu.
- **Không thêm animation hoặc hiệu ứng phức tạp** nếu chưa được yêu cầu.
- **Không "làm đẹp lại toàn bộ"** khi người dùng chỉ yêu cầu sửa một phần.
- Khi sửa UI preview: **chỉ sửa `public/ui-preview.html`**.
- Khi sửa component thật: **chỉ sửa đúng component được yêu cầu**, không sửa `src/components/ui/` trừ khi có yêu cầu.
- **Luôn báo cáo ngắn gọn:**
  - Files changed
  - What was added/fixed
  - What was not changed
  - How to preview/test

---

## 7. How to Continue in New Chat

1. Đọc file này trước: `AI_FRONTEND_CONTEXT.md`
2. Kiểm tra trạng thái project:
   ```bash
   git status
   ```
3. Kiểm tra preview file: `public/ui-preview.html`
4. Nếu cần chạy project:
   ```bash
   npm run dev
   ```
5. Mở preview tại: `http://localhost:5173/ui-preview.html`

---

## 8. Current Safe Working Style

- Làm từng phase nhỏ, không bao giờ làm tất cả cùng lúc.
- Không sửa nhiều file cùng lúc.
- Không dùng script generator (Python/Node/base64).
- Không tạo file tạm (`gen.js`, `gen_preview.py`, etc.).
- Không chỉnh route nếu không được yêu cầu.
- Không chỉnh component thật khi chỉ đang chỉnh preview.
- Không rewrite toàn bộ file khi chỉ cần append section.
- Nếu task lớn, chia ra:
  1. Kiểm tra trạng thái (Read tool)
  2. Sửa đúng phần cần sửa (Write/Edit tool)
  3. Kiểm tra lại (Read tool — chỉ phần đã sửa)
  4. Báo cáo ngắn gọn

---

## 9. Key File Paths

| File                        | Mục đích                              |
|-----------------------------|---------------------------------------|
| `package.json`              | Dependencies                          |
| `vite.config.ts`            | Vite + Tailwind + path alias config   |
| `.env`                      | `VITE_API_URL=http://localhost:3000/api` |
| `tsconfig.app.json`         | TS config (baseUrl, paths, ignoreDeprecations) |
| `src/vite-env.d.ts`         | Vite client types                     |
| `src/index.css`             | Design tokens, `@import "tailwindcss"`|
| `src/utils/cn.ts`           | `cn()` utility (clsx + twMerge)       |
| `src/apis/axios.config.ts`  | Axios config                          |
| `src/apis/httpClient.ts`    | Axios instance + interceptors         |
| `src/apis/index.ts`         | Re-exports                            |
| `src/config/index.ts`       | API_BASE_URL                          |
| `src/App.tsx`               | BrowserRouter + Routes                |
| `src/routes/index.tsx`      | Lazy loaded routes (Home + NotFound)  |
| `public/ui-preview.html`    | Static UI preview (HTML + CSS thuần)  |

---

## 10. Known Constraints

- **Không có `tailwind.config.js`** — Tailwind v4 dùng CSS-first config.
- **`@tailwindcss/vite` plugin** đã cấu hình trong `vite.config.ts`.
- **`@/` alias** trỏ đến `src/` — dùng trong import path.
- **Không có route `/ui-preview`** trong React Router.
- **`public/ui-preview.html` không có JavaScript** — chỉ HTML + CSS.
- **Không dùng CDN** cho bất cứ thứ gì trong preview.

---

## 11. Project Task Status

| # | Task | Status |
|---|------|--------|
| 1 | Initialize Vite React TypeScript project | ✅ Completed |
| 2 | Setup Tailwind CSS | ✅ Completed |
| 3 | Create folder structure and index.ts files | ✅ Completed |
| 4 | Setup Axios, config, router, RHF+Zod example | ✅ Completed |
| 5 | Verify build, self-audit, fix weak points | ✅ Completed |
| 6 | Static UI Preview (Phase 1-4B) | ✅ Completed |

---

> **This file is the handoff context for future AI chats. Read this file before making frontend or UI changes.**
