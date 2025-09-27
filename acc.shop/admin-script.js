// Admin Panel JavaScript
class AdminAPI {
    constructor() {
        // 使用統一的 API 配置
        this.config = window.ApiConfig || {
            baseURL: 'https://chenyou0907.github.io/cy.shop/acc.shop/api',
            useRealAPI: true, // 預設使用模擬 API
            endpoints: {},
            defaultHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        this.baseURL = this.config.baseURL;
        this.token = localStorage.getItem('adminToken');
        console.log('AdminAPI initialized with:', {
            baseURL: this.baseURL,
            useRealAPI: this.config.useRealAPI,
            token: this.token ? 'Available' : 'Not available'
        });
        
        // API 請求預設設定
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // 初始化本地數據存儲
        this.initializeLocalData();
    }
    
    initializeLocalData() {
        // 初始化產品數據
        if (!localStorage.getItem('adminProducts')) {
            const defaultProducts = [
                {
                    id: 1,
                    name: 'Valorant 黃金段位帳號',
                    category: 'game-accounts',
                    price: 299,
                    originalPrice: 399,
                    stock: 5,
                    status: 'active',
                    createdAt: '2024-01-15',
                    description: '高品質 Valorant 黃金段位帳號',
                    image: null,
                    tags: ['熱門', '推薦']
                },
                {
                    id: 2,
                    name: 'Instagram 10K 粉絲帳號',
                    category: 'social-platforms',
                    price: 199,
                    originalPrice: 299,
                    stock: 3,
                    status: 'active',
                    createdAt: '2024-01-14',
                    description: '真實活躍粉絲的 Instagram 帳號',
                    image: null,
                    tags: ['熱門']
                },
                {
                    id: 3,
                    name: 'LOL 鑽石段位帳號',
                    category: 'game-accounts',
                    price: 599,
                    originalPrice: null,
                    stock: 0,
                    status: 'active',
                    createdAt: '2024-01-10',
                    description: '英雄聯盟鑽石段位帳號',
                    image: null,
                    tags: ['稀有']
                }
            ];
            localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
        }
    }
    
    getStoredProducts() {
        try {
            return JSON.parse(localStorage.getItem('adminProducts')) || [];
        } catch (e) {
            console.error('Failed to parse stored products:', e);
            return [];
        }
    }
    
    saveProducts(products) {
        try {
            localStorage.setItem('adminProducts', JSON.stringify(products));
            return true;
        } catch (e) {
            console.error('Failed to save products:', e);
            return false;
        }
    }

    // Authentication
    async login(username, password) {
        try {
            // 使用配置中的 useRealAPI 設定
            const useRealAPI = this.config.useRealAPI;
            console.log(`登入模式: ${useRealAPI ? '真實 API' : '模擬 API'}`);
            
            const response = useRealAPI 
                ? await this.apiCall(this.config.endpoints.login || '/admin/login', {
                    method: 'POST',
                    body: { username, password }
                })
                : await this.mockApiCall('/admin/login', {
                    method: 'POST',
                    body: { username, password }
                });
            
            if (response.success || response.token) {
                this.token = response.token;
                localStorage.setItem('adminToken', this.token);
                localStorage.setItem('adminUser', JSON.stringify(response.user || response.data));
                return response;
            } else {
                throw new Error(response.message || '登入失敗');
            }
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await this.mockApiCall('/admin/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            location.reload();
        }
    }

    // Products API
    async getProducts(page = 1, limit = 10, filters = {}) {
        return this.config.useRealAPI 
            ? await this.apiCall('/admin/products', {
                method: 'GET',
                params: { page, limit, ...filters }
            })
            : await this.mockApiCall('/admin/products', {
                method: 'GET',
                params: { page, limit, ...filters }
            });
    }

    async createProduct(productData) {
        return this.config.useRealAPI 
            ? await this.apiCall('/admin/products', {
                method: 'POST',
                body: productData
            })
            : await this.mockApiCall('/admin/products', {
                method: 'POST',
                body: productData
            });
    }

    async updateProduct(id, productData) {
        return this.config.useRealAPI 
            ? await this.apiCall(`/admin/products/${id}`, {
                method: 'PUT',
                body: productData
            })
            : await this.mockApiCall(`/admin/products/${id}`, {
                method: 'PUT',
                body: productData
            });
    }

    async deleteProduct(id) {
        return this.config.useRealAPI 
            ? await this.apiCall(`/admin/products/${id}`, {
                method: 'DELETE'
            })
            : await this.mockApiCall(`/admin/products/${id}`, {
                method: 'DELETE'
            });
    }

    // Orders API
    async getOrders(page = 1, limit = 10, filters = {}) {
        return await this.mockApiCall('/admin/orders', {
            method: 'GET',
            params: { page, limit, ...filters }
        });
    }

    async updateOrderStatus(orderId, status) {
        return await this.mockApiCall(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: { status }
        });
    }

    async getOrderDetails(orderId) {
        return await this.mockApiCall(`/admin/orders/${orderId}`, {
            method: 'GET'
        });
    }

    // Users API
    async getUsers(page = 1, limit = 10) {
        return await this.mockApiCall('/admin/users', {
            method: 'GET',
            params: { page, limit }
        });
    }

    async updateUserStatus(userId, status) {
        return await this.mockApiCall(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: { status }
        });
    }

    // Analytics API
    async getDashboardStats() {
        return await this.mockApiCall('/admin/dashboard/stats', {
            method: 'GET'
        });
    }

    async getSalesAnalytics(period = '30d') {
        return await this.mockApiCall('/admin/analytics/sales', {
            method: 'GET',
            params: { period }
        });
    }

    // Settings API
    async getSettings() {
        return await this.mockApiCall('/admin/settings', {
            method: 'GET'
        });
    }

    async updateSettings(settings) {
        return await this.mockApiCall('/admin/settings', {
            method: 'PUT',
            body: settings
        });
    }

    // 真實的 API 調用方法
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // 準備請求標頭
        const headers = { ...this.defaultHeaders };
        
        // 添加認證標頭 (除了登入請求)
        if (endpoint !== '/admin/login' && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        // 準備請求參數
        const fetchOptions = {
            method: options.method || 'GET',
            headers
        };
        
        // 添加請求體 (POST/PUT 請求)
        if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
            fetchOptions.body = JSON.stringify(options.body);
        }
        
        // 添加查詢參數 (GET 請求)
        if (options.params && options.method === 'GET') {
            const searchParams = new URLSearchParams(options.params);
            url += `?${searchParams.toString()}`;
        }
        
        try {
            console.log(`API Request: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, fetchOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }
            
            console.log(`API Response:`, data);
            return data;
            
        } catch (error) {
            console.error(`API Error for ${endpoint}:`, error);
            throw error;
        }
    }

    // Mock API implementation - 替換為實際的 API 調用
    async mockApiCall(endpoint, options = {}) {
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 300));

        // 檢查認證 (除了登入請求)
        if (endpoint !== '/admin/login' && !this.token) {
            console.error('API call failed: No token available');
            throw new Error('未授權的請求');
        }

        // 模擬不同的 API 響應
        switch (endpoint) {
            case '/admin/login':
                return this.mockLogin(options.body);
            
            case '/admin/products':
                if (options.method === 'GET') {
                    return this.mockGetProducts(options.params);
                } else if (options.method === 'POST') {
                    return this.mockCreateProduct(options.body);
                }
                break;
            
            case '/admin/orders':
                return this.mockGetOrders(options.params);
            
            case '/admin/users':
                return this.mockGetUsers(options.params);
            
            case '/admin/dashboard/stats':
                return this.mockGetDashboardStats();
            
            default:
                if (endpoint.includes('/admin/products/') && options.method === 'PUT') {
                    const productId = endpoint.split('/').pop();
                    return this.mockUpdateProduct(productId, options.body);
                } else if (endpoint.includes('/admin/products/') && options.method === 'DELETE') {
                    const productId = endpoint.split('/').pop();
                    return this.mockDeleteProduct(productId);
                } else if (endpoint.includes('/admin/orders/') && endpoint.includes('/status')) {
                    return this.mockUpdateOrderStatus(options.body);
                }
                return { success: true, message: '操作成功' };
        }
    }

    // Mock data methods
    mockLogin(credentials) {
        // 設置管理員帳號密碼
        const validCredentials = [
            { 
                username: 'root0907', 
                password: 'Justin20080907',
                name: '超級管理員',
                id: 1
            },
            { 
                username: 'admin', 
                password: 'admin123',
                name: '系統管理員',
                id: 2
            }
        ];
        
        const user = validCredentials.find(cred => 
            cred.username === credentials.username && cred.password === credentials.password
        );
        
        if (user) {
            return {
                success: true,
                token: 'mock-admin-token-' + Date.now(),
                user: {
                    id: user.id,
                    username: user.username,
                    role: 'admin',
                    name: user.name
                }
            };
        } else {
            throw new Error('帳號或密碼錯誤');
        }
    }

    mockGetProducts(params = {}) {
        const storedProducts = this.getStoredProducts();

        return {
            success: true,
            data: storedProducts,
            pagination: {
                page: params.page || 1,
                limit: params.limit || 10,
                total: storedProducts.length,
                totalPages: Math.ceil(storedProducts.length / (params.limit || 10))
            }
        };
    }

    mockGetOrders(params = {}) {
        const mockOrders = [
            {
                id: 'ORD-2024-001',
                userId: 1,
                userEmail: 'user@example.com',
                products: [
                    { name: 'Valorant 黃金段位帳號', price: 299, quantity: 1 }
                ],
                total: 299,
                status: 'completed',
                paymentMethod: 'credit-card',
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'ORD-2024-002',
                userId: 2,
                userEmail: 'user2@example.com',
                products: [
                    { name: 'Instagram 10K 粉絲帳號', price: 199, quantity: 1 }
                ],
                total: 199,
                status: 'processing',
                paymentMethod: 'paypal',
                createdAt: '2024-01-14T15:20:00Z'
            }
        ];

        return {
            success: true,
            data: mockOrders,
            pagination: {
                page: params.page || 1,
                limit: params.limit || 10,
                total: mockOrders.length,
                totalPages: 1
            }
        };
    }

    mockGetUsers(params = {}) {
        const mockUsers = [
            {
                id: 1,
                username: 'user123',
                email: 'user@example.com',
                createdAt: '2024-01-10',
                lastLogin: '2024-01-15',
                status: 'active'
            },
            {
                id: 2,
                username: 'user456',
                email: 'user2@example.com',
                createdAt: '2024-01-12',
                lastLogin: '2024-01-14',
                status: 'active'
            }
        ];

        return {
            success: true,
            data: mockUsers,
            pagination: {
                page: params.page || 1,
                limit: params.limit || 10,
                total: mockUsers.length,
                totalPages: 1
            }
        };
    }

    mockGetDashboardStats() {
        return {
            success: true,
            data: {
                totalProducts: 25,
                totalOrders: 150,
                totalUsers: 89,
                totalRevenue: 45680,
                recentActivities: [
                    {
                        type: 'order',
                        message: '新訂單 #ORD-2024-003',
                        time: '5分鐘前',
                        icon: 'fas fa-shopping-cart'
                    },
                    {
                        type: 'user',
                        message: '新用戶註冊: user789',
                        time: '15分鐘前',
                        icon: 'fas fa-user-plus'
                    },
                    {
                        type: 'product',
                        message: '商品庫存不足: Valorant 帳號',
                        time: '1小時前',
                        icon: 'fas fa-exclamation-triangle'
                    }
                ]
            }
        };
    }

    mockCreateProduct(productData) {
        const products = this.getStoredProducts();
        
        // 生成新 ID
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        
        // 創建新產品
        const newProduct = {
            id: newId,
            ...productData,
            createdAt: new Date().toISOString().split('T')[0], // 只保留日期部分
            image: productData.image || null,
            tags: productData.tags || []
        };
        
        // 添加到產品列表
        products.push(newProduct);
        
        // 保存到 localStorage
        const saved = this.saveProducts(products);
        
        if (saved) {
            console.log('新產品已保存:', newProduct);
            return {
                success: true,
                data: newProduct,
                message: '商品新增成功'
            };
        } else {
            throw new Error('保存商品失敗');
        }
    }

    mockUpdateProduct(productId, productData) {
        const products = this.getStoredProducts();
        const productIndex = products.findIndex(p => p.id == productId);
        
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                ...productData,
                updatedAt: new Date().toISOString().split('T')[0]
            };
            
            const saved = this.saveProducts(products);
            if (saved) {
                return {
                    success: true,
                    data: products[productIndex],
                    message: '商品更新成功'
                };
            } else {
                throw new Error('保存商品更新失敗');
            }
        } else {
            throw new Error('找不到指定的商品');
        }
    }

    mockDeleteProduct(productId) {
        const products = this.getStoredProducts();
        const productIndex = products.findIndex(p => p.id == productId);
        
        if (productIndex !== -1) {
            const deletedProduct = products.splice(productIndex, 1)[0];
            const saved = this.saveProducts(products);
            
            if (saved) {
                return {
                    success: true,
                    data: deletedProduct,
                    message: '商品刪除成功'
                };
            } else {
                throw new Error('保存商品刪除失敗');
            }
        } else {
            throw new Error('找不到指定的商品');
        }
    }

    mockUpdateOrderStatus(data) {
        return {
            success: true,
            message: '訂單狀態更新成功'
        };
    }
}

// Admin Panel Manager
class AdminPanel {
    constructor() {
        this.api = new AdminAPI();
        this.currentSection = 'dashboard';
        this.currentProductId = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        
        // Only load dashboard if authenticated
        const token = localStorage.getItem('adminToken');
        if (token) {
            this.loadDashboard();
        }
    }

    checkAuth() {
        const token = localStorage.getItem('adminToken');
        const loginModal = document.getElementById('admin-login-modal');
        const adminContent = document.getElementById('admin-content-container');
        
        console.log('🔍 檢查認證狀態:', { hasToken: !!token, tokenValue: token });
        
        if (!token) {
            // 未認證：顯示登入模態框，隱藏管理內容
            console.log('❌ 未認證 - 顯示登入界面');
            loginModal.classList.add('active');
            loginModal.classList.remove('hidden');
            adminContent.style.display = 'none';
        } else {
            // 已認證：隱藏登入模態框，顯示管理內容
            console.log('✅ 已認證 - 顯示管理界面');
            loginModal.classList.remove('active');
            loginModal.classList.add('hidden');
            adminContent.style.display = 'block';
            this.updateAdminUser();
        }
    }

    updateAdminUser() {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const usernameElement = document.getElementById('admin-username');
        if (usernameElement && adminUser.name) {
            usernameElement.textContent = adminUser.name;
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        // Admin login
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // 添加輸入框監聽器來追蹤值的變化
            const usernameInput = document.getElementById('admin-username-input');
            const passwordInput = document.getElementById('admin-password-input');
            
            if (usernameInput) {
                usernameInput.addEventListener('input', (e) => {
                    console.log('🔤 用戶名輸入:', e.target.value);
                    usernameInput._lastValue = e.target.value;
                });
            }
            
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => {
                    console.log('🔐 密碼輸入長度:', e.target.value.length);
                    passwordInput._lastValue = e.target.value;
                });
            }
        }

        // Product form
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
            
            // 添加實時值監聽器來追蹤商品名稱輸入
            const nameInput = document.getElementById('product-name');
            if (nameInput) {
                nameInput.addEventListener('input', (e) => {
                    console.log('📝 商品名稱輸入變化:', e.target.value);
                    // 將值存儲在元素上作為備份
                    nameInput._backupValue = e.target.value;
                });
                
                nameInput.addEventListener('blur', (e) => {
                    console.log('👁️ 商品名稱失去焦點:', e.target.value);
                    nameInput._backupValue = e.target.value;
                });
            }
            
            // 添加分類選擇監聽器
            const categorySelect = document.getElementById('product-category');
            if (categorySelect) {
                categorySelect.addEventListener('change', (e) => {
                    console.log('🏷️ 商品分類選擇變化:', e.target.value);
                    categorySelect._backupValue = e.target.value;
                });
                
                categorySelect.addEventListener('blur', (e) => {
                    console.log('👁️ 商品分類失去焦點:', e.target.value);
                    categorySelect._backupValue = e.target.value;
                });
            }
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Filter buttons
        const filterBtn = document.querySelector('[onclick="filterProducts()"]');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.filterProducts());
        }

        const orderFilterBtn = document.querySelector('[onclick="filterOrders()"]');
        if (orderFilterBtn) {
            orderFilterBtn.addEventListener('click', () => this.filterOrders());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        console.log('🔍 開始登入處理...');
        
        // 延遲一小段時間確保所有輸入都已完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 最簡單直接的讀取方式
        let username = '';
        let password = '';
        
        try {
            // 方法1: 最基本的 document.querySelector
            const usernameEl = document.querySelector('#admin-username-input');
            const passwordEl = document.querySelector('#admin-password-input');
            
            console.log('📍 找到的元素:', {
                username: !!usernameEl,
                password: !!passwordEl,
                usernameValue: usernameEl?.value,
                passwordValue: passwordEl?.value ? '***masked***' : 'empty'
            });
            
            if (usernameEl && passwordEl) {
                // 首先嘗試從監聽器存儲的值讀取
                username = usernameEl._lastValue || usernameEl.value || '';
                password = passwordEl._lastValue || passwordEl.value || '';
                
                console.log('🔄 讀取結果:', {
                    username: username,
                    passwordLength: password.length,
                    fromListener: {
                        username: usernameEl._lastValue,
                        passwordLength: passwordEl._lastValue ? passwordEl._lastValue.length : 0
                    },
                    fromValue: {
                        username: usernameEl.value,
                        passwordLength: passwordEl.value ? passwordEl.value.length : 0
                    }
                });
            }
            
            // 方法2: 如果方法1失敗，使用表單查詢
            if (!username || !password) {
                const form = document.getElementById('admin-login-form');
                if (form) {
                    const inputs = form.getElementsByTagName('input');
                    for (let input of inputs) {
                        if (input.name === 'username' || input.id === 'admin-username-input') {
                            username = input.value || '';
                        }
                        if (input.name === 'password' || input.id === 'admin-password-input') {
                            password = input.value || '';
                        }
                    }
                }
            }
            
            // 方法3: 如果還是失敗，使用事件目標
            if (!username || !password) {
                const targetInputs = e.target.elements;
                for (let i = 0; i < targetInputs.length; i++) {
                    const input = targetInputs[i];
                    if (input.type === 'text' && !username) {
                        username = input.value || '';
                    }
                    if (input.type === 'password' && !password) {
                        password = input.value || '';
                    }
                }
            }
            
            // 方法4: 最後手段 - 遍歷所有文檔中的輸入框
            if (!username || !password) {
                const allInputs = document.querySelectorAll('input');
                allInputs.forEach(input => {
                    if ((input.id === 'admin-username-input' || input.name === 'username') && !username) {
                        username = input.value || '';
                    }
                    if ((input.id === 'admin-password-input' || input.name === 'password') && !password) {
                        password = input.value || '';
                    }
                });
            }
            
        } catch (error) {
            console.error('讀取輸入框時發生錯誤:', error);
        }
        
        // 清理值
        username = (username || '').trim();
        password = (password || '').trim();
        
        // 只在開發模式顯示調試信息
        if (console.debug) {
            console.log('登入數據:', { username, passwordLength: password.length });
        }
        
        // 驗證 - 如果讀取失敗，提供手動輸入選項
        if (!username || !password) {
            console.warn('⚠️ 自動讀取失敗，提供手動輸入選項');
            
            // 手動輸入作為最後的備援
            const manualUsername = prompt('自動讀取失敗，請手動輸入用戶名:', 'root0907') || '';
            const manualPassword = prompt('請手動輸入密碼:', '') || '';
            
            if (manualUsername && manualPassword) {
                username = manualUsername.trim();
                password = manualPassword.trim();
                console.log('✅ 使用手動輸入:', { username, passwordLength: password.length });
            } else {
                this.showNotification('請輸入用戶名和密碼', 'error');
                return;
            }
        }
        
        // 獲取提交按鈕
        const submitBtn = e.target.querySelector('button[type="submit"]') || 
                         document.querySelector('#admin-login-form button[type="submit"]') ||
                         document.querySelector('.admin-login-btn');
        
        // 設置加載狀態
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }
        
        try {
            await this.api.login(username, password);
            this.checkAuth();
            this.showNotification('登入成功！', 'success');
            
            setTimeout(() => {
                this.loadDashboard();
            }, 500);
            
        } catch (error) {
            this.showNotification(error.message || '登入失敗', 'error');
            
            // 確保登入模態框保持可見
            const loginModal = document.getElementById('admin-login-modal');
            if (loginModal) {
                loginModal.classList.add('active');
                loginModal.classList.remove('hidden');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        }
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    async loadDashboard() {
        try {
            console.log('Loading dashboard data...');
            const response = await this.api.getDashboardStats();
            console.log('Dashboard response:', response);
            
            if (response && response.success) {
                this.updateDashboardStats(response.data);
                console.log('Dashboard data loaded successfully');
            } else {
                throw new Error('API 響應格式錯誤');
            }
        } catch (error) {
            console.error('Dashboard loading error:', error);
            this.showNotification(`載入儀表板數據失敗: ${error.message}`, 'error');
        }
    }

    updateDashboardStats(data) {
        document.getElementById('total-products').textContent = data.totalProducts;
        document.getElementById('total-orders').textContent = data.totalOrders;
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('total-revenue').textContent = `$${data.totalRevenue.toLocaleString()}`;

        // Update recent activities
        const activitiesList = document.getElementById('recent-activities-list');
        activitiesList.innerHTML = data.recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: var(--admin-accent);">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }

    async loadProducts() {
        try {
            const response = await this.api.getProducts();
            if (response.success) {
                this.renderProductsTable(response.data);
            }
        } catch (error) {
            this.showNotification('載入商品數據失敗', 'error');
        }
    }

    renderProductsTable(products) {
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id || '---'}</td>
                <td>${product.name || '未命名商品'}</td>
                <td>${this.getCategoryName(product.category)}</td>
                <td>NT$${product.price || 0}</td>
                <td>${product.stock !== undefined && product.stock !== null ? product.stock : '---'}</td>
                <td>
                    <span class="status-badge status-${product.status || 'inactive'}">
                        ${product.status === 'active' ? '啟用' : '停用'}
                    </span>
                </td>
                <td>${product.createdAt || '---'}</td>
                <td>
                    <button class="btn-secondary btn-sm" onclick="adminPanel.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-sm" onclick="adminPanel.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadOrders() {
        try {
            const response = await this.api.getOrders();
            if (response.success) {
                this.renderOrdersTable(response.data);
            }
        } catch (error) {
            this.showNotification('載入訂單數據失敗', 'error');
        }
    }

    renderOrdersTable(orders) {
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.userEmail}</td>
                <td>${order.products.map(p => p.name).join(', ')}</td>
                <td>$${order.total}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${this.getOrderStatusName(order.status)}
                    </span>
                </td>
                <td>${this.getPaymentMethodName(order.paymentMethod)}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary btn-sm" onclick="adminPanel.viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadUsers() {
        try {
            const response = await this.api.getUsers();
            if (response.success) {
                this.renderUsersTable(response.data);
            }
        } catch (error) {
            this.showNotification('載入用戶數據失敗', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.createdAt}</td>
                <td>${user.lastLogin}</td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status === 'active' ? '啟用' : '停用'}
                    </span>
                </td>
                <td>
                    <button class="btn-secondary btn-sm" onclick="adminPanel.toggleUserStatus(${user.id}, '${user.status}')">
                        ${user.status === 'active' ? '停用' : '啟用'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadAnalytics() {
        // 載入分析數據 - 可以整合圖表庫
        this.showNotification('分析功能開發中', 'info');
    }

    // Product management
    openAddProductModal() {
        this.currentProductId = null;
        document.getElementById('product-modal-title').textContent = '新增商品';
        document.getElementById('product-submit-text').textContent = '新增商品';
        document.getElementById('product-form').reset();
        document.getElementById('add-product-modal').style.display = 'flex';
    }

    editProduct(id) {
        this.currentProductId = id;
        document.getElementById('product-modal-title').textContent = '編輯商品';
        document.getElementById('product-submit-text').textContent = '更新商品';
        
        // 載入商品數據到表單
        // 這裡應該調用 API 獲取商品詳情
        
        document.getElementById('add-product-modal').style.display = 'flex';
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        console.log('🚀 表單提交開始', e.target);
        
        // 使用 FormData - 這是標準且可靠的方法
        const formData = new FormData(e.target);
        
        // 構建產品數據對象 - 使用多重備援讀取
        const getFieldValue = (fieldName, inputId) => {
            // 方法1: FormData
            const formValue = formData.get(fieldName);
            if (formValue && formValue.trim()) {
                return formValue.trim();
            }
            
            // 方法2: 直接從 DOM 讀取
            const element = document.getElementById(inputId);
            if (element && element.value && element.value.trim()) {
                return element.value.trim();
            }
            
            // 方法3: 從備份值讀取
            if (element && element._backupValue && element._backupValue.trim()) {
                return element._backupValue.trim();
            }
            
            return '';
        };
        
        const productData = {
            name: getFieldValue('name', 'product-name'),
            category: (() => {
                // 多重讀取分類值
                let categoryValue = formData.get('category');
                if (!categoryValue) {
                    const categorySelect = document.getElementById('product-category');
                    categoryValue = categorySelect?.value || categorySelect?._backupValue || '';
                }
                return categoryValue;
            })(),
            price: parseFloat(formData.get('price') || document.getElementById('product-price')?.value) || 0,
            originalPrice: (() => {
                const val = formData.get('originalPrice') || document.getElementById('product-original-price')?.value;
                return val ? parseFloat(val) : null;
            })(),
            stock: parseInt(formData.get('stock') || document.getElementById('product-stock')?.value) || 0,
            status: formData.get('status') || document.getElementById('product-status')?.value || 'active',
            description: getFieldValue('description', 'product-description'),
            image: getFieldValue('image', 'product-image'),
            tags: (() => {
                const tagsValue = formData.get('tags') || document.getElementById('product-tags')?.value || '';
                return tagsValue ? tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            })()
        };
        
        // 詳細調試信息
        console.log('📋 FormData 收集的數據:', productData);
        console.log('📝 所有 FormData 條目:', Object.fromEntries(formData.entries()));
        
        // 額外的輸入框直接讀取調試
        const nameInput = document.getElementById('product-name');
        console.log('🔍 直接讀取商品名稱輸入框:', {
            element: !!nameInput,
            value: nameInput?.value,
            backupValue: nameInput?._backupValue,
            trimmedValue: nameInput?.value?.trim(),
            length: nameInput?.value?.length,
            backupLength: nameInput?._backupValue?.length
        });
        
        // 數據驗證 - 如果讀取失敗，提供緊急手動輸入
        if (!productData.name) {
            console.error('❌ 商品名稱驗證失敗');
            console.error('❌ 詳細調試信息:', {
                formDataName: formData.get('name'),
                directInputValue: nameInput?.value,
                productDataName: productData.name
            });
            
            // 緊急手動輸入作為最後的解決方案
            const manualName = prompt('系統無法讀取商品名稱，請手動輸入商品名稱:');
            if (manualName && manualName.trim()) {
                productData.name = manualName.trim();
                console.log('✅ 使用手動輸入的商品名稱:', productData.name);
            } else {
                this.showNotification('請輸入商品名稱', 'error');
                return;
            }
        }
        
        if (!productData.category) {
            console.error('❌ 商品分類驗證失敗');
            const categorySelect = document.getElementById('product-category');
            console.error('❌ 分類選擇調試信息:', {
                formDataCategory: formData.get('category'),
                selectValue: categorySelect?.value,
                selectedIndex: categorySelect?.selectedIndex,
                options: categorySelect ? Array.from(categorySelect.options).map(opt => ({ value: opt.value, text: opt.text, selected: opt.selected })) : []
            });
            
            // 提供手動分類選擇
            const manualCategory = prompt(`請手動選擇商品分類：
1. game-accounts (遊戲帳號)
2. social-platforms (社交平台) 
3. professional-services (專業服務)
            
請輸入 1、2 或 3:`);
            
            const categoryMap = {
                '1': 'game-accounts',
                '2': 'social-platforms', 
                '3': 'professional-services'
            };
            
            if (manualCategory && categoryMap[manualCategory]) {
                productData.category = categoryMap[manualCategory];
                console.log('✅ 使用手動選擇的分類:', productData.category);
            } else {
                this.showNotification('請選擇商品分類', 'error');
                return;
            }
        }
        
        if (productData.price < 0) {
            this.showNotification('價格不能為負數', 'error');
            return;
        }
        
        if (productData.stock < 0) {
            this.showNotification('庫存不能為負數', 'error');
            return;
        }

        const submitBtn = document.querySelector('#product-form + .modal-footer button.btn-primary') || 
                          document.querySelector('button[form="product-form"]') ||
                          e.target.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> 處理中...';
        }

        try {
            let response;
            if (this.currentProductId) {
                response = await this.api.updateProduct(this.currentProductId, productData);
            } else {
                response = await this.api.createProduct(productData);
            }

            if (response.success) {
                this.showNotification(response.message, 'success');
                this.closeProductModal();
                this.loadProducts();
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = this.currentProductId ? '更新商品' : '新增商品';
            }
        }
    }

    async deleteProduct(id) {
        if (confirm('確定要刪除這個商品嗎？')) {
            try {
                const response = await this.api.deleteProduct(id);
                if (response.success) {
                    this.showNotification(response.message, 'success');
                    this.loadProducts();
                }
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    closeProductModal() {
        document.getElementById('add-product-modal').style.display = 'none';
    }

    filterProducts() {
        // 實現商品過濾邏輯
        const category = document.getElementById('category-filter').value;
        const status = document.getElementById('status-filter').value;
        const search = document.getElementById('product-search').value;
        
        // 重新載入商品列表，傳入過濾參數
        this.loadProducts({ category, status, search });
    }

    filterOrders() {
        // 實現訂單過濾邏輯
        const status = document.getElementById('order-status-filter').value;
        const dateFrom = document.getElementById('order-date-from').value;
        const dateTo = document.getElementById('order-date-to').value;
        const search = document.getElementById('order-search').value;
        
        this.loadOrders({ status, dateFrom, dateTo, search });
    }

    // Order management
    async viewOrderDetails(orderId) {
        try {
            // 這裡應該調用 API 獲取訂單詳情
            const orderDetails = `
                <div class="order-details">
                    <h4>訂單編號: ${orderId}</h4>
                    <p>詳細信息載入中...</p>
                </div>
            `;
            
            document.getElementById('order-detail-content').innerHTML = orderDetails;
            document.getElementById('order-detail-modal').style.display = 'flex';
        } catch (error) {
            this.showNotification('載入訂單詳情失敗', 'error');
        }
    }

    async toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        try {
            const response = await this.api.updateUserStatus(userId, newStatus);
            if (response.success) {
                this.showNotification('用戶狀態更新成功', 'success');
                this.loadUsers();
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // Utility methods
    getCategoryName(category) {
        const names = {
            'game-accounts': '遊戲帳號',
            'social-platforms': '社交平台',
            'professional-services': '專業服務',
            'gaming': '遊戲帳號',  // 舊版本兼容
            'social': '社交平台',  // 舊版本兼容
            'streaming': '直播平台'  // 舊版本兼容
        };
        return names[category] || (category || '未分類');
    }

    getOrderStatusName(status) {
        const names = {
            'pending': '待處理',
            'processing': '處理中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return names[status] || status;
    }

    getPaymentMethodName(method) {
        const names = {
            'credit-card': '信用卡',
            'paypal': 'PayPal',
            'bank-transfer': '銀行轉帳'
        };
        return names[method] || method;
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // 移除現有通知
        const existingNotifications = document.querySelectorAll('.admin-notification');
        existingNotifications.forEach(n => {
            n.style.transform = 'translateX(400px)';
            setTimeout(() => n.remove(), 300);
        });

        // 根據類型設置圖標和顏色
        const config = {
            success: { icon: '✅', bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16, 185, 129, 0.3)' },
            error: { icon: '❌', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: 'rgba(239, 68, 68, 0.3)' },
            warning: { icon: '⚠️', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245, 158, 11, 0.3)' },
            info: { icon: 'ℹ️', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: 'rgba(59, 130, 246, 0.3)' }
        };
        
        const notificationConfig = config[type] || config.info;

        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.25rem;">${notificationConfig.icon}</span>
                <span style="flex: 1;">${message}</span>
            </div>
            <button onclick="this.parentElement.style.transform='translateX(400px)'; setTimeout(() => this.parentElement.remove(), 300)" 
                    style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; opacity: 0.8; transition: opacity 0.2s;"
                    onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">&times;</button>
        `;

        // 添加樣式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1.25rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 100002;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            min-width: 380px;
            max-width: 500px;
            box-shadow: 0 8px 32px ${notificationConfig.shadow};
            background: ${notificationConfig.bg};
            transform: translateX(400px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        // 添加動畫 CSS 如果還沒有
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .admin-notification {
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .admin-notification:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
                }
            `;
            document.head.appendChild(style);
        }

        // 添加到頁面
        document.body.appendChild(notification);
        
        // 觸發滑入動畫
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // 自動移除 - 錯誤通知顯示更久一些
        const autoRemoveTime = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, autoRemoveTime);
    }
}

// Export functions for global access
function adminLogout() {
    adminPanel.api.logout();
}

function openAddProductModal() {
    adminPanel.openAddProductModal();
}

function filterProducts() {
    adminPanel.filterProducts();
}

function filterOrders() {
    adminPanel.filterOrders();
}

function exportOrders() {
    adminPanel.showNotification('匯出功能開發中', 'info');
}

function exportUsers() {
    adminPanel.showNotification('匯出功能開發中', 'info');
}

function saveSettings() {
    adminPanel.showNotification('設定已保存', 'success');
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 頁面載入完成，開始初始化管理面板');
    
    // 立即隱藏管理內容，直到認證完成
    const adminContent = document.getElementById('admin-content-container');
    const loginModal = document.getElementById('admin-login-modal');
    
    console.log('🔍 檢查DOM元素:', {
        adminContent: !!adminContent,
        loginModal: !!loginModal
    });
    
    if (adminContent) {
        adminContent.style.display = 'none';
        console.log('✅ 管理內容已隱藏');
    }
    
    if (loginModal) {
        console.log('✅ 登入模態框已找到，當前類別:', loginModal.className);
    }
    
    try {
        // 如果需要清除現有 token 進行測試，取消註釋下面的行
        // localStorage.removeItem('adminToken');
        
        adminPanel = new AdminPanel();
        console.log('✅ 管理員面板初始化成功');
    } catch (error) {
        console.error('❌ 管理員面板初始化失敗:', error);
        
        // 顯示錯誤信息給用戶
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #f5c6cb;
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.innerHTML = `
            <strong>🚨 初始化錯誤</strong><br>
            ${error.message}<br>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; border: none; background: #721c24; color: white; border-radius: 4px; cursor: pointer;">
                重新載入
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// 密碼切換功能
function toggleAdminPassword() {
    const passwordInput = document.getElementById('admin-password-input');
    const toggleBtn = document.querySelector('.password-toggle-btn');
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// 將函數添加到全域範圍
window.toggleAdminPassword = toggleAdminPassword;
