# CY.SHOP API 配置說明

## 🔗 **當前配置**

**前端網站**: https://chenyou0907.github.io/cy.shop/acc.shop/index.html  
**API 基礎 URL**: https://chenyou0907.github.io/cy.shop/acc.shop/api

## ⚙️ **API 設定選項**

### 1. 模擬 API (當前設定)
```javascript
// api-config.js
useRealAPI: false  // 使用本地模擬數據
```

### 2. 真實 API
```javascript
// api-config.js
useRealAPI: true   // 連接到真實後端 API
```

## 🛠️ **API 端點結構**

管理員功能需要以下 API 端點：

### 認證端點
- `POST /admin/login` - 管理員登入
- `POST /admin/logout` - 管理員登出

### 商品管理
- `GET /admin/products` - 獲取商品列表
- `POST /admin/products` - 新增商品
- `PUT /admin/products/:id` - 更新商品
- `DELETE /admin/products/:id` - 刪除商品

### 訂單管理
- `GET /admin/orders` - 獲取訂單列表
- `PUT /admin/orders/:id/status` - 更新訂單狀態

### 用戶管理
- `GET /admin/users` - 獲取用戶列表
- `PUT /admin/users/:id/status` - 更新用戶狀態

## 🔧 **如何啟用真實 API**

1. **部署後端 API** - 確保您的後端服務器運行在正確的域名上
2. **更新 baseURL** - 在 `api-config.js` 中設定正確的 API URL
3. **啟用真實 API** - 將 `useRealAPI` 設為 `true`

### 範例配置：
```javascript
const ApiConfig = {
    baseURL: 'https://your-backend-domain.com/api',
    useRealAPI: true,
    // ... 其他配置
};
```

## 📝 **API 請求格式範例**

### 登入請求
```json
POST /admin/login
{
    "username": "admin",
    "password": "password123"
}
```

### 成功回應
```json
{
    "success": true,
    "token": "jwt-token-here",
    "user": {
        "id": 1,
        "name": "Administrator"
    }
}
```

## 🔐 **安全性考慮**

- 使用 HTTPS 協議
- JWT Token 驗證
- CORS 設定正確
- 輸入驗證和清理

## 📞 **需要協助？**

如果您需要設定真實的後端 API，請提供：
1. 您的後端服務器域名
2. API 的具體端點路徑
3. 認證機制詳情
