# API 設置指南

## 📁 編輯位置

編輯 `api-config.js` 檔案來設置您的 API 配置。

## ⚙️ 主要設定

### 1. 基本 API 設定

```javascript
// 在 api-config.js 中修改以下設定：

const ApiConfig = {
    // 您的 API 基礎 URL
    baseURL: 'https://your-api-domain.com/api', // ← 修改這裡
    
    // 切換 API 模式
    useRealAPI: false, // ← 改為 true 使用真實 API
    
    // API 端點...
};
```

### 2. 快速設置步驟

1. **設置 API URL**
   ```javascript
   baseURL: 'https://api.yourwebsite.com/api'
   ```

2. **啟用真實 API**
   ```javascript
   useRealAPI: true
   ```

3. **測試連線**
   - 打開管理面板
   - 嘗試登入
   - 查看控制台確認 API 呼叫

## 🔧 API 端點配置

預設端點包括：

- **登入**: `/admin/login`
- **商品**: `/admin/products`
- **訂單**: `/admin/orders`
- **用戶**: `/admin/users`
- **儀表板**: `/admin/dashboard/stats`

## 🚀 測試 API

### 登入測試
```
POST /admin/login
{
  "username": "admin",
  "password": "password"
}
```

### 商品 API 測試
```
GET /admin/products
POST /admin/products
PUT /admin/products/{id}
DELETE /admin/products/{id}
```

## 💡 故障排除

1. **CORS 錯誤**
   - 確保您的 API 允許來自網站域名的跨域請求

2. **認證錯誤**
   - 檢查 API 是否正確返回 token
   - 確認 token 格式符合預期

3. **網路錯誤**
   - 確認 API URL 正確
   - 測試 API 是否可達

## 📝 API 回應格式

管理面板預期的回應格式：

```javascript
// 成功回應
{
  "success": true,
  "data": {...},
  "message": "操作成功"
}

// 錯誤回應
{
  "success": false,
  "error": "錯誤訊息",
  "code": "ERROR_CODE"
}
```

## 🔒 認證機制

- 使用 JWT Token 認證
- Token 儲存在 localStorage
- 請求標頭: `Authorization: Bearer <token>`
