// API 配置文件
const ApiConfig = {
    // API 基礎設定
    baseURL: 'https://chenyou0907.github.io/cy.shop/acc.shop/api', // 基於您的域名的 API URL
    
    // 是否使用真實 API (false = 使用模擬數據)
    useRealAPI: false, // 設為 true 時將使用真實 API
    
    // API 端點配置
    endpoints: {
        // 認證相關
        login: '/admin/login',
        logout: '/admin/logout',
        refreshToken: '/admin/refresh-token',
        
        // 商品管理
        products: '/admin/products',
        productById: (id) => `/admin/products/${id}`,
        
        // 訂單管理
        orders: '/admin/orders',
        orderById: (id) => `/admin/orders/${id}`,
        orderStatus: (id) => `/admin/orders/${id}/status`,
        
        // 用戶管理
        users: '/admin/users',
        userById: (id) => `/admin/users/${id}`,
        userStatus: (id) => `/admin/users/${id}/status`,
        
        // 數據分析
        dashboardStats: '/admin/dashboard/stats',
        salesAnalytics: '/admin/analytics/sales',
        
        // 系統設定
        settings: '/admin/settings'
    },
    
    // 請求預設配置
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // 請求超時設定 (毫秒)
    timeout: 30000,
    
    // 重試設定
    retry: {
        attempts: 3,
        delay: 1000 // 毫秒
    },
    
    // 快速切換函數
    switchToRealAPI() {
        this.useRealAPI = true;
        console.log('✅ 已切換到真實 API 模式');
        console.log('🔗 API URL:', this.baseURL);
    },
    
    switchToMockAPI() {
        this.useRealAPI = false;
        console.log('✅ 已切換到模擬 API 模式');
        console.log('🎭 使用本地模擬數據');
    }
};

// 匯出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiConfig;
} else if (typeof window !== 'undefined') {
    window.ApiConfig = ApiConfig;
}
