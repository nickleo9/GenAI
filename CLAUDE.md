# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

**iPAS AI應用規劃師練習系統** — 部署於 GitHub Pages (`nickleo9.github.io/GenAI/`)，供用戶練習 iPAS 認證考試題目的前端網頁應用。

## 相關帳號與 Repo

| 帳號 | 用途 |
|------|------|
| `nickleo9` | 主要 GitHub 帳號，本 repo (`nickleo9/GenAI`) |
| `nickleo051216` | ZN Studio 帳號，`znstudioquotation` 等其他 repo |

存取 `nickleo051216` 的 repo 需用 curl + `$GITHUB_ZN_TOKEN`（存於 `~/.claude/settings.json`），因 GitHub MCP 只允許 `nickleo9/genai`。

## 架構

### 核心檔案

- **`index.html`** — 主頁面（1064行），Bootstrap 5 + Font Awesome UI
- **`script.js`** — 所有業務邏輯（3455行），三大物件：
  - `iPASQuizApp` — 題庫選擇、出題、作答、成績計算、錯題管理
  - `UsageManager` — 會員等級判斷、使用次數限制（localStorage 計數）
  - `LoginManager` — LINE OAuth / Google (Supabase) 登入、會員狀態同步
- **`style.css`** — 自定義樣式（833行）
- **`web.html`** — 舊版單檔備用系統（4301行），功能部分重疊，標記為備用版本

### 題庫檔案（JSON）

| 檔案 | 對應 key |
|------|---------|
| `generative_ai_exam.json` | `generative-ai` |
| `daily_answers_basis.json` | `ai-basis` |
| `daily_answers_apply.json` | `ai-application` |
| `ipas_exam.json` | `ipas` |

`ipas-combined` 是 `ai-basis` + `ai-application` 合併後動態生成，不是獨立檔案。

題目格式：
```json
{
  "question": "題目",
  "options": ["A", "B", "C", "D"],
  "correct_answer_index": 1,
  "correct_answer_letter": "B",
  "explanation": "解析",
  "topic": "主題",
  "subtopic": "子主題"
}
```

### 後端服務

後端為 **n8n**，部署於 `https://nickleo9.zeabur.app`，相關 webhook：

| Webhook 路徑 | 用途 |
|-------------|------|
| `/webhook/line-login` | LINE OAuth 登入處理 |
| `/webhook/check-member-status` | 查詢/同步會員狀態 |
| `/webhook/save-practice-record` | 儲存練習記錄 |
| `/webhook/update-wrong-questions` | 更新錯題雲端同步 |
| `/webhook/money` | 綠界 ECPay 金流，取得 ecpayParams |

n8n workflow 定義存於 `n8n-workflow-editor.json`（25個節點）。

### 會員系統

三層會員：`遊客`（未登入）、`免費會員`、`付費會員`

`UsageManager.getMemberLevel()` 讀取順序：
1. `localStorage['user_data']`（Google 登入）
2. `localStorage['ipas_user_data']`（LINE 登入）
3. 有 `paid_until` 欄位時才驗證是否過期（舊資料向下相容，無此欄位直接信任 `member_level`）

使用限制（依功能）：
- 模擬考試：免費會員 5 天冷卻
- AI 解析：免費會員 3 次/天
- 錯題匯出：免費會員 5 次/月

### 登入流程

- **LINE 登入** → `login-callback.html` → 儲存至 `localStorage['ipas_user_data']` → 跳回 `index.html`
- **Google 登入** → Supabase OAuth → `google-callback.html` → 儲存至 `localStorage['user_data']` → 跳回 `index.html`
- 付款成功 → `payment-success.html` → 呼叫 `/webhook/verify-payment` 驗證後更新 localStorage

## 部署

靜態網站，直接 push 到 `main` branch 即上線（GitHub Pages 自動部署）。無 build 步驟。

## 常用 curl 存取 ZN repo

```bash
# 列出 znstudioquotation 檔案
curl -s https://api.github.com/repos/nickleo051216/znstudioquotation/contents/

# 讀取特定檔案（Base64 解碼）
curl -s https://api.github.com/repos/nickleo051216/znstudioquotation/contents/index.html \
  | python3 -c "import sys,json,base64; print(base64.b64decode(json.load(sys.stdin)['content']).decode())"
```

（Repo 為 public，不需 token；若變 private 則加 `-H "Authorization: token $GITHUB_ZN_TOKEN"`）
