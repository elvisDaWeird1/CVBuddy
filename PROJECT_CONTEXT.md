# PROJECT_CONTEXT

## 1. Project Overview

Dự án **CV Buddy** là một ứng dụng web **frontend-only** (React + TypeScript + Vite) đang trong giai đoạn xây dựng nền tảng. Mục tiêu chính là tạo hệ thống **quản lý hồ sơ sinh viên / CV builder** với các tính năng:
- Quản lý hồ sơ sinh viên
- Tạo CV (CV Builder)
- Tạo Portfolio cá nhân
- AI Review (phân tích & gợi ý cải thiện CV)
- Upload CV / Upload file đính kèm

Sản phẩm dành cho sinh viên làm CV và portfolio khi đi xin việc thực tập (OJT). Backend chưa được xây dựng — API hiện mock hoặc đang chờ triển khai.

---

## 2. Current Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 (TypeScript, JSX) |
| Build tool | Vite 8.0 |
| Router | react-router-dom 7.16 |
| Styling | Tailwind CSS 4.3 (`@tailwindcss/vite` plugin) |
| CSS approach | CSS Custom Properties (design tokens) trong `index.css` + Tailwind utility classes |
| Form handling | react-hook-form 7.77 + zod 4.4 + @hookform/resolvers |
| Validation | zod |
| HTTP client | axios 1.16 (config sẵn, interceptor cơ bản) |
| Class name utils | clsx + tailwind-merge (qua hàm `cn()`) |
| Component primitives | class-variance-authority (CVA) |
| Linting | ESLint 10 + TypeScript-ESLint + react-hooks |
| UI components | Custom components (không dùng shadcn/ui hay MUI) |

**Môi trường:** Chỉ frontend, chạy cục bộ. Backend API endpoint hiện là `http://localhost:3000/api` (có thể override qua `.env` → `VITE_API_URL`).

---

## 3. Folder Structure

```
D:\exe\CV Buddy\
└── frontend\                    ← Toàn bộ code nằm trong thư mục này
    ├── public\                  ← Static assets
    │   ├── favicon.svg
    │   ├── icons.svg
    │   └── ui-preview.html      ← File HTML preview design system (không cần build)
    ├── dist\                    ← Build output (đã build trước)
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src\                     ← Source code
    │   ├── main.tsx             ← Entry point, render App vào #root
    │   ├── App.tsx              ← Root component, BrowserRouter + Routes
    │   ├── App.css              ← CSS dư (còn phần hero/ticks từ template Vite ban đầu)
    │   ├── index.css            ← DESIGN TOKENS (CSS variables) + base/reset + typography
    │   ├── vite-env.d.ts        ← Type declaration cho Vite env
    │   │
    │   ├── apis\                ← HTTP layer
    │   │   ├── index.ts         ← Barrel export
    │   │   ├── axios.config.ts  ← Axios base config
    │   │   ├── httpClient.ts    ← Axios instance + interceptors (request/response)
    │   │   └── http.types.ts    ← HttpResponse<T> interface
    │   │
    │   ├── components\          ← Shared UI components
    │   │   ├── index.ts
    │   │   └── ui\              ← Primitive components
    │   │       ├── button.tsx   ← Button (6 variants: primary/secondary/outline/ghost/danger/cta)
    │   │       ├── card.tsx     ← Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
    │   │       ├── form.tsx     ← Form, FormGroup (wrapper có label/error/helper)
    │   │       ├── icons.tsx    ← SVG icons: ChevronDown, Search, X, Plus, Check, Upload
    │   │       ├── input.tsx    ← Input (có variants: default/error/success + sizes)
    │   │       └── select.tsx   ← Select (có placeholder, options array, variants)
    │   │
    │   ├── config\              ← App config
    │   │   └── index.ts         ← API_BASE_URL từ env VITE_API_URL
    │   │
    │   ├── consts\              ← Constants (placeholder barrels)
    │   │   └── index.ts
    │   ├── hooks\               ← Custom hooks (placeholder barrels)
    │   │   └── index.ts
    │   ├── layouts\             ← Layouts (placeholder barrels)
    │   │   └── index.ts
    │   ├── models\              ← Data models/types (placeholder barrels)
    │   │   └── index.ts
    │   ├── modules\             ← Feature modules
    │   │   └── admin\           ← Module "admin" (hiện đang dùng cho các trang chính)
    │   │       ├── Home.tsx     ← Trang chủ (placeholder, chỉ text đơn giản)
    │   │       └── NotFound.tsx ← Trang 404
    │   ├── routes\              ← Route config
    │   │   └── index.tsx        ← routeConfig array, lazy loading
    │   ├── stores\              ← State management (placeholder barrels)
    │   │   └── index.ts
    │   ├── types\               ← Type definitions (placeholder barrels)
    │   │   └── index.ts
    │   └── utils\               ← Utilities
    │       ├── index.ts
    │       └── cn.ts            ← cn() = clsx + twMerge (merge Tailwind classes)
    │
    ├── node_modules\
    ├── package.json
    ├── vite.config.ts           ← Vite config (alias @ → src, tailwindcss + react plugins)
    ├── tsconfig.json            ← TS project references
    ├── tsconfig.app.json        ← TS config cho src (strict-ish, path alias @/ )
    ├── tsconfig.node.json       ← TS config cho vite.config.ts
    ├── eslint.config.js         ← ESLint flat config
    └── .gitignore
```

---

## 4. UI / Design System

### Color Palette (Design Tokens — CSS Custom Properties)

| Token | Giá trị | Mục đích |
|-------|---------|----------|
| `--color-bg-main` | `#F8FAFC` | Background chính toàn app |
| `--color-bg-soft` | `#E6F7FB` | Background section nhẹ, hover row, input error bg |
| `--color-navy` | `#081020` | Màu chữ chính, heading, sidebar, label |
| `--color-teal` | `#006A78` | Màu chủ đạo (primary, link active, badge, button primary) |
| `--color-cyan` | `#50D8F4` | Hover, focus, highlight, link hover |
| `--color-amber` | `#FFB84D` | CTA button, warning |
| `--color-white` | `#FFFFFF` | Card, surface |
| `--color-gray-*` | `#F9FAFB → #111827` | Neutral palette (border, muted text, disabled) |
| `--color-success` | `#10B981` | Success state, badge |
| `--color-error` | `#EF4444` | Error state, badge |
| `--color-warning` | `#F59E0B` | Warning state, badge |
| `--color-info` | `#3B82F6` | Info state, badge |

### Typography
- Font: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- Mono: `ui-monospace, 'Fira Code', Consolas, monospace`
- Size scale: `--text-xs(12px) → --text-4xl(36px)`
- Line heights: `--leading-tight(1.25)`, `--leading-normal(1.5)`, `--leading-relaxed(1.75)`
- Weights: `--font-normal(400) → --font-bold(700)`

### Spacing
- Scale: `--sp-1(4px) → --sp-16(64px)`

### Border Radius
- `--radius-sm(4px)` → `--radius-full(9999px)`

### Shadow
- `--shadow-sm` → `--shadow-xl` (4 levels, dựa trên rgba(8,16,32,...))

### Button Variants (component `button.tsx`)
- `primary` — teal bg, white text
- `secondary` — bg-soft, teal border, teal text
- `outline` — transparent bg, navy text, gray border
- `ghost` — transparent bg, gray text, hover gray-100
- `danger` — red bg, white text
- `cta` — amber bg, navy text, semibold

### Input Variants (component `input.tsx`)
- `state`: `default | error | success`
- `size`: `sm | md | lg`
- Có hỗ trợ `label`, `helperText`, `error`, `leftIcon`, `rightIcon`

### Form Group (component `form.tsx`)
- Wrapper với `label`, `required *`, `helperText`, `error`

### Card (component `card.tsx`)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Layout Pattern (từ ui-preview.html)
- Dashboard: Sidebar (navy) + Main content area
- Auth: Centered card on soft background
- Table: Wrapper border, header gray-50, striped rows, hover highlight

---

## 5. Completed Work

### Phase 1 — Project Scaffolding
- Khởi tạo Vite + React + TypeScript
- Cấu hình Tailwind CSS v4 với `@tailwindcss/vite`
- Thiết lập path alias `@/` → `src/`
- Tạo cấu trúc thư mục modules theo kiến trúc modular

### Phase 2 — Design System & Core Components
- Xây dựng design tokens trong `index.css` (CSS Custom Properties đầy đủ)
- Base/reset styles, typography helpers, focus ring, scrollbar styling
- Tạo file `ui-preview.html` — static HTML preview cho toàn bộ design system (không cần build, mở trực tiếp được)
- Các component UI primitives: `Button`, `Input`, `Select`, `Card`, `Form`

### Phase 3 — HTTP Layer & Routing
- Cấu hình Axios instance (`httpClient.ts`) với baseURL, timeout, interceptors
- `axios.config.ts` đọc API_BASE_URL từ `.env`
- `HttpResponse<T>` type definition
- Routing với react-router-dom v7, lazy loading cho modules
- Route config: `/` → Home, `*` → NotFound

### Phase 4 — Layout & Header/Footer
- Tạo `src/layouts/ClientLayout/`: `Header.tsx`, `Footer.tsx`, `ClientLayout.tsx`
- Header: sticky, logo `/icons.svg`, nav links 6 trang, button Đăng nhập/Đăng kí
- Footer: 3 cột (brand + liên hệ placeholder + dự án), navy background
- MainLayout đổi tên thành ClientLayout, nằm ở `src/layouts/ClientLayout/`
- Tạo 6 page placeholder: Home, AboutUs, Project, AiBuddy, FormPage, ComingSoon
- Route config thêm: `/home`, `/about-us`, `/project`, `/ai-buddy`, `/form`, `/coming-soon`
- Folder cũ `src/components/layout/` đã xóa sau khi di chuyển xong

---

## 6. Current State

| Trạng thái | Chi tiết |
|-----------|---------|
| **Chạy được** | `npm run dev` → Vite dev server chạy React app. Header + Footer hiển thị đầy đủ, 6 route hoạt động (Home, AboutUs, Project, AiBuddy, Form, ComingSoon). File `ui-preview.html` mở trực tiếp được. |
| **Preview/Static** | `public/ui-preview.html` — Static HTML showcase đầy đủ design system (buttons, forms, cards, badges, avatars, alerts, toasts, skeleton, spinner, table, tabs, stepper, layout mockups). Chỉ dùng để xem thử, không có React. |
| **Chưa hoàn thiện** | Các file barrel (`modules/index.ts`, `consts/index.ts`, `hooks/index.ts`, `models/index.ts`, `stores/index.ts`, `types/index.ts`) đều rỗng. Các page hiện là placeholder. `components/index.ts` đã bỏ export layout (đã chuyển sang `layouts/`). Không có backend. |
| **Chưa có** | Pages thực tế (Login, Dashboard, CV Builder, Portfolio, Settings), state management, form validation thực tế, các API service functions, dark mode, responsive layout đầy đủ |

---

## 7. Known Issues

| Vấn đề | Mô tả |
|--------|-------|
| Barrel files rỗng | `src/modules/index.ts`, `src/consts/index.ts`, `src/hooks/index.ts`, `src/models/index.ts`, `src/stores/index.ts`, `src/types/index.ts` đều trống — chỉ là placeholder |
| Home.tsx chưa có nội dung | Chỉ hiển thị text placeholder, chưa có nội dung thực tế |
| NotFound.tsx dùng `a` thay vì `Link` | Sử dụng thẻ `<a href="/">` thay vì `<Link to="/">` từ react-router-dom — click sẽ trigger full page reload |
| `src/components/index.ts` chưa cập nhật | Layout exports đã bị xóa (đã chuyển sang `src/layouts/ClientLayout/`) nhưng barrel file chưa được bổ sung export mới |
| App.css chứa CSS dư từ template Vite | Có phần `.counter`, `.hero`, `#center`, `#next-steps`, `#docs`, `#spacer`, `.ticks` — là style từ template ban đầu của Vite, không dùng trong app hiện tại |
| Backend chưa có | `API_BASE_URL` mặc định là `http://localhost:3000/api` — backend không tồn tại, mọi API call sẽ fail nếu chưa mock |
| Chưa có `.env` file | Chưa có file `.env` hay `.env.local` trong frontend |
| Không có page thực tế nào | Chưa có login form, dashboard, CV builder, table danh sách sinh viên, v.v. |

---

## 8. Rules for Future AI Work

1. **Không màu mè** — Giữ nguyên style hiện tại, không thêm animation, gradient, hoặc hiệu ứng không cần thiết
2. **Không tự ý refactor lớn** — Chỉ sửa/chỉnh code cần thiết cho feature được yêu cầu
3. **Không tự ý đổi design** — Tuân theo design tokens đã định nghĩa, không thêm màu/font mới ngoài yêu cầu
4. **Không xóa code sẵn nếu không cần** — Khi thêm feature mới, thêm vào chứ không xóa phần cũ
5. **Chỉ làm đúng mục tiêu được giao** — Không tự động mở rộng scope
6. **Trước khi sửa phải kiểm tra file liên quan** — Đọc file trước khi edit, hiểu rõ context
7. **Sau khi sửa phải báo rõ** — Nêu rõ file nào đã sửa, sửa gì
8. **Ưu tiên giữ cấu trúc hiện tại** — Giữ nguyên thư mục `modules/admin/`, pattern barrel files, CVA variants, design tokens
9. **Không dùng MUI / shadcn/ui / AntD** — Chỉ dùng các component custom đã có
10. **Khi cần backend mock** — Dùng data tĩnh trong component, không tạo fake API service phức tạp
11. **NotFound.tsx** — Nếu cần sửa, dùng `<Link to="/">` thay vì `<a href>`
12. **Path alias `@/`** — Luôn dùng `@/` thay vì relative path phức tạp
13. **Layout components** — Tất cả layout (Header, Footer, ClientLayout) phải nằm trong `src/layouts/ClientLayout/`, không đặt trong `src/components/layout/`

---

## 9. Next Recommended Steps

Theo thứ tự ưu tiên:

1. **Login page** — Tạo trang đăng nhập (AuthLayout mock từ ui-preview.html) với form email/password, validation bằng react-hook-form + zod
2. **Dashboard page** — Tạo trang dashboard với sidebar nav + stat cards + activity feed (layout mock từ ui-preview.html)
3. **Layout components** — Tạo `AuthLayout` và `DashboardLayout` component thực tế (thay vì mock trong HTML)
4. **Student list page** — Table danh sách sinh viên với search, filter, pagination (mock data)
5. **API mock data** — Tạo file mock data cho các trang, thay vì hardcode trong component
6. **State management** — Thêm React Context hoặc Zustand cho auth state (user, token)
7. **Toast/Alert system** — Tạo component Toast/Alert thực tế để thay thế static mock
8. **File upload** — Tích hợp component UploadZone vào trang thực tế

---

## 10. Handoff Prompt for Next Chat

```
Đọc file PROJECT_CONTEXT.md trong thư mục D:\exe trước khi làm bất kỳ việc gì. Đảm bảo bạn hiểu rõ: cấu trúc dự án, design system đang dùng, component library hiện có, và các quy tắc trong phần "Rules for Future AI Work". Sau khi đọc xong, hãy thực hiện yêu cầu của tôi.
```
