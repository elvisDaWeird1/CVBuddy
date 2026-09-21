# Prompt cho Codex: bổ sung mục “Nhận xét của AI về CV vừa được chấm”

Bạn đang làm việc trong project `D:\KI 7\cvbuddy\frontend`.

## Mục tiêu

Cập nhật trang AI để sau khi người dùng chọn một CV và bấm **Analyze CV**, giao diện hiển thị rõ một mục riêng có tiêu đề chính xác:

**Nhận xét của AI về CV vừa được chấm**

Mục này phải hiển thị nhận xét tổng quan mà AI trả về cho đúng CV và đúng lần chấm hiện tại, đặt gần khu vực điểm tổng thể để người dùng dễ nhận biết.

## Contract AI cần dùng

Đọc và đối chiếu các file sau trước khi sửa:

- `D:\KI 7\cvbuddy\cvbuddy\cvbuddy-ai\app\schemas\cv.py`
- `D:\KI 7\cvbuddy\cvbuddy\cvbuddy-ai\docs\AI_CONTRACT.md`
- `D:\KI 7\cvbuddy\backend\src\modules\ai\ai.service.ts`
- `D:\KI 7\cvbuddy\backend\src\modules\ai\clients\ai-service.client.ts`

Response phân tích CV từ AI có dạng chính:

```json
{
  "overall_score": 0,
  "dimensions": {
    "layout_ats": { "score": 0, "issues": [], "fixes": [] },
    "language": { "score": 0, "issues": [], "fixes": [] },
    "keywords": { "score": 0, "missing": [], "suggested_bullets": [] },
    "jd_fit": { "score": 0, "gaps": [] }
  },
  "rewrites": [],
  "company_model_feedback": "Nhận xét tổng quan của AI về CV",
  "confidence": 0.0,
  "disclaimer": "...",
  "meta": {}
}
```

Backend Node trả response qua `aiResult`. Khi lấy chi tiết, JSON phân tích có thể nằm ở:

- `aiResult.result` dưới dạng object;
- hoặc `aiResult.resultText` dưới dạng JSON string cần parse.

Frontend đang gọi các endpoint hiện có trong `src/modules/ai/aiApi.ts`:

- `POST /ai/cvs/:cvId/score`
- `POST /ai/cvs/:cvId/feedback`
- `GET /ai/results/:id`

Không tạo endpoint mới và không thay đổi backend contract.

## Phạm vi đọc trước khi coding

Đọc:

- `AGENTS.md`
- `package.json`
- `docs/api-contract.md`
- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/aiApi.ts`
- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/components/ScoreOverview.tsx`
- `src/modules/ai/components/FeedbackPanel.tsx`
- `src/modules/ai/components/AiResultHistoryDetail.tsx`
- `src/index.css`

## Yêu cầu triển khai

1. Dùng `company_model_feedback` làm nguồn dữ liệu chính cho mục nhận xét. Adapter phải đọc được cả `result` object và `resultText` JSON string; không hiển thị raw JSON cho người dùng.

2. Có thể bổ sung một field rõ nghĩa trong view model, ví dụ `aiComment`, nhưng phải giữ type-safe và tái sử dụng adapter hiện tại. Không đọc trực tiếp dữ liệu API rải rác trong nhiều component nếu có thể gom ở `aiResultAdapter.ts`.

3. Hiển thị một card/section riêng, gần `ScoreOverview`, với tiêu đề:

   `Nhận xét của AI về CV vừa được chấm`

   Nội dung nhận xét cần:

   - giữ nguyên nội dung AI trả về, bao gồm xuống dòng nếu có;
   - dùng React rendering an toàn, không render HTML từ chuỗi AI;
   - dùng các design token và component hiện có (`Card`, `CardHeader`, `CardContent`), responsive trên mobile;
   - có cấu trúc semantic/accessibility phù hợp, ví dụ `section` và `aria-live` khi kết quả vừa hoàn tất.

4. Với kết quả hiện tại, ưu tiên comment trong kết quả `scoreCv`. Nếu score response không có comment nhưng feedback response có `company_model_feedback`, dùng feedback response làm fallback. Nếu cả hai không có comment thì hiển thị trạng thái trung lập như “AI chưa trả về nhận xét cho lần chấm này”, tuyệt đối không tự bịa nội dung.

5. Tránh hiển thị cùng một `company_model_feedback` hai lần. Nếu đã có card riêng, điều chỉnh `ScoreOverview`/`FeedbackPanel` để không lặp lại comment dưới các nhãn cũ như “Overall feedback”, “Additional result note” hoặc “Analysis notes”. Các chi tiết khác như strengths, improvements, rewrites, missing sections và dimension scores vẫn phải được giữ lại.

6. Khi mở một bản ghi trong AI history:

   - `CV_SCORING` phải hiển thị điểm và mục nhận xét riêng;
   - `CV_FEEDBACK` phải vẫn hiển thị nhận xét cùng các góp ý chi tiết;
   - dữ liệu đọc từ `GET /ai/results/:id` phải hoạt động giống kết quả vừa chấm.

7. Giữ đúng các trạng thái hiện có:

   - loading khi đang gọi AI;
   - score thành công nhưng feedback lỗi: vẫn hiển thị comment lấy được từ score;
   - score lỗi nhưng feedback thành công: vẫn hiển thị comment lấy được từ feedback;
   - cả hai lỗi hoặc payload malformed: hiển thị empty/error state thân thiện, không làm crash trang.

8. Không đổi route, auth flow, biến môi trường, endpoint, API helper dùng chung hoặc thêm thư viện mới. Giữ ngôn ngữ, layout và style hiện tại của trang AI ngoài mục mới được yêu cầu.

## Tiêu chí nghiệm thu

- Khi AI trả về `company_model_feedback: "CV có nền tảng tốt nhưng cần bổ sung kết quả định lượng."`, đúng chuỗi này xuất hiện dưới tiêu đề **Nhận xét của AI về CV vừa được chấm** sau khi chấm CV.
- Comment vẫn hiển thị khi nó chỉ có trong `resultText` dạng JSON string.
- Comment của bản ghi lịch sử cũng hiển thị khi mở chi tiết.
- Comment chỉ xuất hiện một lần trong mỗi kết quả.
- Empty, loading, partial và error state không làm vỡ layout.
- Các nội dung score/dimensions/strengths/improvements/rewrites hiện có không bị mất.
- Chạy và xử lý các lỗi phát hiện được bằng:

  ```bash
  npm run lint
  npm run build
  ```

Khi hoàn tất, báo cáo ngắn gọn các file đã sửa, cách map `company_model_feedback`, các fallback đã xử lý và kết quả validation.
