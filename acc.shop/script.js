// JavaScript for ACC.SHOP Website Functionality

// API 配置 - 與管理員面板整合
const FRONTEND_API = {
    baseURL: 'https://your-api-domain.com/api',
    useRealAPI: false, // 設為 true 使用真實 API
    
    // 從管理員面板獲取商品數據
    async getProducts(category = 'all', page = 1, limit = 12) {
        if (!this.useRealAPI) {
            return this.getMockProducts(category, page, limit);
        }
        
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                status: 'active'
            });
            
            if (category !== 'all') {
                params.append('category', category);
            }
            
            const response = await fetch(`${this.baseURL}/products?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取商品失敗:', error);
            return this.getMockProducts(category, page, limit);
        }
    },
    
    // 模擬商品數據（與管理員面板兼容）
    getMockProducts(category, page, limit) {
        const allProducts = [
            {
                id: 1,
                name: 'Valorant 黃金段位帳號',
                category: 'game-accounts',
                price: 299,
                originalPrice: 399,
                description: '高品質 Valorant 黃金段位帳號，包含稀有面板和角色',
                image: null,
                tags: ['熱門', '推薦'],
                status: 'active',
                stock: 5,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                name: 'Instagram 10K 粉絲帳號',
                category: 'social-platforms',
                price: 199,
                originalPrice: 299,
                description: '真實活躍粉絲的 Instagram 帳號',
                image: null,
                tags: ['熱門'],
                status: 'active',
                stock: 3,
                createdAt: '2024-01-14T15:20:00Z'
            },
            {
                id: 3,
                name: '英雄聯盟 鑽石帳號',
                category: 'game-accounts',
                price: 599,
                originalPrice: 799,
                description: '鑽石段位 LOL 帳號，擁有多個英雄面板',
                image: null,
                tags: ['推薦'],
                status: 'active',
                stock: 2,
                createdAt: '2024-01-13T09:45:00Z'
            },
            {
                id: 4,
                name: 'Discord Nitro 會員',
                category: 'social-platforms',
                price: 89,
                originalPrice: 120,
                description: '一年期 Discord Nitro 會員資格',
                image: null,
                tags: ['特價'],
                status: 'active',
                stock: 10,
                createdAt: '2024-01-12T11:30:00Z'
            }
        ];
        
        let filteredProducts = allProducts.filter(product => 
            product.status === 'active' && 
            (category === 'all' || product.category === category)
        );
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        return {
            success: true,
            data: paginatedProducts,
            pagination: {
                page,
                limit,
                total: filteredProducts.length,
                totalPages: Math.ceil(filteredProducts.length / limit)
            }
        };
    },
    
    // 獲取單個商品詳情
    async getProductById(id) {
        if (!this.useRealAPI) {
            const products = this.getMockProducts('all', 1, 100);
            const product = products.data.find(p => p.id === parseInt(id));
            return product ? { success: true, data: product } : { success: false, message: '商品不存在' };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取商品詳情失敗:', error);
            return { success: false, message: error.message };
        }
    }
};

// 動態商品載入和顯示功能
async function loadAndDisplayProducts(category = 'all', containerId = null) {
    try {
        console.log(`載入商品: 分類=${category}`);
        const response = await FRONTEND_API.getProducts(category, 1, 12);
        
        if (response.success && response.data) {
            updateProductDisplay(response.data, containerId);
            console.log(`成功載入 ${response.data.length} 個商品`);
        } else {
            console.error('載入商品失敗:', response.message);
        }
    } catch (error) {
        console.error('載入商品時發生錯誤:', error);
    }
}

// 更新商品顯示
function updateProductDisplay(products, containerId = null) {
    // 找到商品容器
    const containers = containerId 
        ? [document.getElementById(containerId)]
        : document.querySelectorAll('.products-grid, .product-slider, .product-grid');
    
    containers.forEach(container => {
        if (!container) return;
        
        // 清空現有商品
        container.innerHTML = '';
        
        // 生成商品卡片
        products.forEach(product => {
            const productCard = createProductCard(product);
            container.appendChild(productCard);
        });
        
        // 重新綁定事件
        bindProductEvents(container);
    });
}

// 創建商品卡片
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-product-id', product.id);
    productCard.setAttribute('data-category', product.category);
    
    // 處理標籤
    const tagsHtml = product.tags ? product.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('') : '';
    
    // 處理價格顯示
    const priceHtml = product.originalPrice && product.originalPrice > product.price
        ? `<span class="original-price">NT$${product.originalPrice}</span>
           <span class="current-price">NT$${product.price}</span>`
        : `<span class="current-price">NT$${product.price}</span>`;
    
    // 處理圖片
    const imageHtml = product.image 
        ? `<img src="${product.image}" alt="${product.name}">`
        : `<div class="placeholder-img ${getCategoryImageClass(product.category)}">
             <i class="${getCategoryIcon(product.category)}"></i>
           </div>`;
    
    // 庫存狀態
    const stockStatus = product.stock > 0 ? '' : '<div class="out-of-stock">缺貨</div>';
    
    productCard.innerHTML = `
        ${stockStatus}
        <div class="product-image">
            ${imageHtml}
            ${tagsHtml}
        </div>
        <div class="product-info">
            <h4>${product.name}</h4>
            <p class="product-description">${product.description || ''}</p>
            <div class="price">
                ${priceHtml}
            </div>
            <div class="product-actions">
                <button class="btn-primary add-to-cart" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${product.stock === 0 ? '缺貨' : '加入購物車'}
                </button>
                <button class="btn-secondary wishlist-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    return productCard;
}

// 獲取分類圖示
function getCategoryIcon(category) {
    const icons = {
        'game-accounts': 'fas fa-gamepad',
        'social-platforms': 'fas fa-users',
        'professional-services': 'fas fa-briefcase'
    };
    return icons[category] || 'fas fa-cube';
}

// 獲取分類圖片樣式
function getCategoryImageClass(category) {
    const classes = {
        'game-accounts': 'valorant',
        'social-platforms': 'instagram',
        'professional-services': 'discord'
    };
    return classes[category] || 'general';
}

// 綁定商品事件
function bindProductEvents(container) {
    // 加入購物車按鈕
    container.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
    
    // 願望清單按鈕
    container.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            toggleWishlist(productId);
        });
    });
    
    // 商品卡片點擊查看詳情
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果點擊的是按鈕，不觸發卡片點擊
            if (e.target.closest('button')) return;
            
            const productId = this.getAttribute('data-product-id');
            showProductDetail(productId);
        });
    });
}

// 加入購物車功能
function addToCart(productId) {
    console.log('加入購物車:', productId);
    // 這裡可以整合現有的購物車邏輯
    showNotification('商品已加入購物車！', 'success');
}

// 切換願望清單
function toggleWishlist(productId) {
    console.log('切換願望清單:', productId);
    // 這裡可以整合現有的願望清單邏輯
    showNotification('已加入願望清單！', 'success');
}

// 顯示商品詳情
function showProductDetail(productId) {
    console.log('查看商品詳情:', productId);
    // 這裡可以整合現有的商品詳情邏輯
}

// 簡單的通知功能
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// 分類篩選功能
function filterProductsByCategory(category) {
    loadAndDisplayProducts(category);
}

// 初始化分類篩選器
function initCategoryFilters() {
    // 綁定導航分類按鈕
    const categoryButtons = document.querySelectorAll('[data-category]');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // 更新活躍狀態
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 載入對應分類的商品
            filterProductsByCategory(category);
        });
    });
    
    // 綁定篩選下拉菜單（如果存在）
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const category = this.value;
            filterProductsByCategory(category);
        });
    }
    
    console.log('✅ 分類篩選器已初始化');
}

// Clean up expired sessions and check storage health
function cleanupExpiredSessions() {
    try {
        // Check for temporary sessions older than 1 hour
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            if (userData.tempSession) {
                const loginTime = new Date(userData.loginTime);
                const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                if (loginTime < hourAgo) {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('isLoggedIn');
                    console.log('Cleaned up expired temporary session');
                }
            }
        }
        
        // Check if remember me should persist login
        const rememberMe = localStorage.getItem('rememberMe');
        if (!rememberMe && !sessionStorage.getItem('currentUser')) {
            // No remember me and no session - clear login state
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
        }
        
    } catch (e) {
        console.error('Error during session cleanup:', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Clean up expired sessions first
    cleanupExpiredSessions();
    
    // Initialize all functionality
    initSlider();
    initModal();
    initCartFunctionality();
    initSmoothScrolling();
    initAnimations();
    initProductSlider();
    
    // 載入商品數據（與管理員面板同步）
    console.log('🔄 開始載入商品數據...');
    loadAndDisplayProducts('all').then(() => {
        console.log('✅ 商品數據載入完成');
    }).catch(error => {
        console.error('❌ 商品數據載入失敗:', error);
    });
    
    // 綁定分類篩選事件
    initCategoryFilters();
    initAuthentication();
    initUserState();
    initEmailVerification();
    
    // 初始化購物車數量顯示
    updateCartDisplay();
    
    // 初始化跨頁面登入狀態同步
    initCrossPageSync();
});

// Hero Slider Functionality
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        if (slides[index]) {
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            stopSlideshow();
            startSlideshow(); // Restart slideshow
        });
    });

    // Pause slideshow on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopSlideshow);
        sliderContainer.addEventListener('mouseleave', startSlideshow);
    }

    // Start slideshow
    startSlideshow();
}

// Modal Functionality
function initModal() {
    const cartIcon = document.querySelector('.cart-icon');
    const modal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');

    if (cartIcon && modal) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Shopping Cart Functionality (統一版本)
function initCartFunctionality() {
    // 初始化購物車顯示
    updateCartDisplay();
    
    // Add event listeners to "立即購買" buttons
    document.querySelectorAll('.btn-primary').forEach((btn, index) => {
        if (btn.textContent.includes('立即購買')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Generate unique product data based on the product card
                const productCard = btn.closest('.product-card');
                if (productCard) {
                    const h4Element = productCard.querySelector('h4');
                    const priceElement = productCard.querySelector('.current-price');
                    
                    if (!h4Element) {
                        console.error('產品名稱元素未找到');
                        return;
                    }
                    if (!priceElement) {
                        console.error('價格元素未找到');
                        return;
                    }
                    
                    const productName = h4Element.textContent;
                    const price = parseInt(priceElement.textContent.replace('$', ''));
                    const productId = `product-${index}`;
                    
                    addToCart(productId, productName, price);
                }
            });
        }
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    // 只選擇有效的錨點連結（不包括 href="#" 的連結
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // 檢查href是否有效且不是單純的 #
            if (!href || href === '#' || href.length <= 1) {
                return; // 不阻止默認行為，讓其他處理器處理
            }
            
            // 檢查是否有onclick處理器，如果有就不處理平滑滾動
            if (this.hasAttribute('onclick') || this.hasAttribute('data-action')) {
                return; // 讓其他事件處理器處理
            }
            
            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault(); // 只有在找到目標時才阻止默認行為
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                console.error('無效的選擇器:', href, error);
            }
        });
    });
}

// Scroll Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate category cards
    document.querySelectorAll('.category-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate product cards
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate trust items
    document.querySelectorAll('.trust-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// Product Slider Functionality
function initProductSlider() {
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const productsContainer = document.querySelector('.products-container');
    
    if (!arrowLeft || !arrowRight || !productsContainer) return;

    let currentIndex = 0;
    const productCards = document.querySelectorAll('.product-card');
    const cardsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
    const maxIndex = Math.max(0, productCards.length - cardsPerView);

    function updateSliderPosition() {
        const cardWidth = productCards[0]?.offsetWidth || 0;
        const gap = 24; // 1.5rem gap
        const translateX = -(currentIndex * (cardWidth + gap));
        productsContainer.style.transform = `translateX(${translateX}px)`;
    }

    arrowLeft.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1);
        updateSliderPosition();
    });

    arrowRight.addEventListener('click', () => {
        currentIndex = Math.min(maxIndex, currentIndex + 1);
        updateSliderPosition();
    });

    // Update on window resize
    window.addEventListener('resize', () => {
        const newCardsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
        const newMaxIndex = Math.max(0, productCards.length - newCardsPerView);
        if (currentIndex > newMaxIndex) {
            currentIndex = newMaxIndex;
        }
        updateSliderPosition();
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#0099FF'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Close notification
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
    }
`;
document.head.appendChild(notificationStyles);

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'white';
        header.style.backdropFilter = 'none';
    }
});

// Form validation and submission (for future contact forms)
function initFormValidation() {
    // Only apply to forms that are NOT login or register forms
    const forms = document.querySelectorAll('form:not(#login-form):not(#register-form)');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#EF4444';
                    isValid = false;
                } else {
                    field.style.borderColor = '#10B981';
                }
            });
            
            if (isValid) {
                form.reset();
            } else {
                showNotification('請填寫所有必填欄位', 'error');
            }
        });
    });
}

// Initialize form validation when forms are present (but exclude auth forms)
if (document.querySelector('form:not(#login-form):not(#register-form)')) {
    initFormValidation();
}

// Product search functionality (basic implementation)
function initSearch() {
    const searchInput = document.querySelector('#search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const h4Element = card.querySelector('h4');
            if (h4Element) {
                const productName = h4Element.textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            } else {
                console.warn('產品卡片中未找到 h4 元素');
                card.style.display = 'none';
            }
        });
    });
}

// Initialize search if search input exists
if (document.querySelector('#search-input')) {
    initSearch();
}

// Performance optimization: Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
initLazyLoading();

// Analytics tracking (placeholder for future implementation)
function trackEvent(eventName, eventData) {
    console.log('Analytics Event:', eventName, eventData);
    // Here you would integrate with analytics services like Google Analytics
}

// Track button clicks for analytics
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-primary, .btn-secondary, .btn-outline')) {
        trackEvent('button_click', {
            button_text: e.target.textContent,
            page_location: window.location.pathname
        });
    }
});

// Authentication System
function initAuthentication() {
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Open login modal
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modal functionality
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
    
    // Initialize form handlers
    initLoginForm();
    initRegisterForm();
    initSocialLogin();
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Login Form Handler
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            const rememberMe = formData.get('remember-me') === 'on';
            
            // Validate form
            if (!validateEmail(email)) {
                showFormError('login-email', '請輸入有效的電子郵件地址');
                return;
            }
            
            if (password.length < 6) {
                showFormError('login-password', '密碼長度至少需要6個字元');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('.auth-btn');
            submitBtn.classList.add('loading');
            
            try {
                // Simulate API call
                const loggedUser = await simulateLogin(email, password, rememberMe);
                
                // Success
                showNotification('登入成功！歡迎回來', 'success');
                closeModal(document.getElementById('login-modal'));
                loginForm.reset();
                
                // Update UI to show logged in state
                // 以登入回傳的用戶資料為準（包含avatarUrl�?
                updateUserInterface({
                    email: loggedUser.email,
                    username: loggedUser.username,
                    avatar: loggedUser.username?.charAt(0).toUpperCase(),
                    avatarUrl: loggedUser.avatarUrl || localStorage.getItem('userAvatar') || null
                });
                
                // 通知購物車管理系統用戶登入
                cartManager.onUserLogin(loggedUser);
                
                // 觸發跨頁面同步
                triggerLoginStateSync();
                
            } catch (error) {
                if (error.message === 'VERIFICATION_REQUIRED') {
                    // Get user data to show verification code
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find(u => u.email === email);
                    
                    closeModal(document.getElementById('login-modal'));
                    if (user && user.verificationCode) {
                        showEmailVerificationModal(email, user.verificationCode);
                    } else {
                        showEmailVerificationModal(email);
                    }
                    showNotification('請先驗證您的電子郵件地址', 'info');
                } else {
                    showNotification(error.message, 'error');
                }
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    }
}

// Register Form Handler
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const phone = formData.get('phone');
            const agreeTerms = formData.get('agree-terms') === 'on';
            
            // Validate form
            let hasErrors = false;
            
            if (username.length < 3) {
                showFormError('register-username', '使用者名稱至少需要3個字元');
                hasErrors = true;
            }
            
            if (!validateEmail(email)) {
                showFormError('register-email', '請輸入有效的電子郵件地址');
                hasErrors = true;
            }
            
            if (password.length < 8) {
                showFormError('register-password', '密碼長度至少需要8個字元');
                hasErrors = true;
            }
            
            if (password !== confirmPassword) {
                showFormError('confirm-password', '密碼確認不匹配');
                hasErrors = true;
            }
            
            if (!agreeTerms) {
                showNotification('請同意服務條款和隱私政策', 'error');
                hasErrors = true;
            }
            
            if (hasErrors) return;
            
            // Show loading state
            const submitBtn = registerForm.querySelector('.auth-btn');
            submitBtn.classList.add('loading');
            
            try {
                // Simulate API call
                const newUser = await simulateRegister({ username, email, password, phone });
                console.log('註冊成功，返回的用戶數據:', newUser);
                console.log('生成的驗證碼:', newUser.verificationCode);
                
                // Success - show verification modal
                closeModal(document.getElementById('login-modal'));
                showEmailVerificationModal(email, newUser.verificationCode);
                registerForm.reset();
                
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    }
}

// Social Login Handlers
function initSocialLogin() {
    const googleBtns = document.querySelectorAll('.google-btn');
    const facebookBtns = document.querySelectorAll('.facebook-btn');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            simulateGoogleLogin();
        });
    });
    
    facebookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            simulateFacebookLogin();
        });
    });
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.add('error');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error show';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        
        // Remove error on input
        input.addEventListener('input', () => {
            input.classList.remove('error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }, { once: true });
    }
}

// Switch between login and register forms
function switchAuthForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTitle = document.getElementById('auth-title');
    
    if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        authTitle.textContent = '會員登入';
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        authTitle.textContent = '會員註冊';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Safe localStorage management
function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn('localStorage quota exceeded, cleaning up old data...');
        
        // Clean up old or large data
        const keysToClean = ['oldUserData', 'tempData', 'cacheDaa'];
        keysToClean.forEach(k => {
            try {
                localStorage.removeItem(k);
            } catch (e) {}
        });
        
        // Try again after cleanup
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('無法保存到 localStorage:', e);
            return false;
        }
    }
}

// Simulate API calls (replace with real API calls)
async function simulateLogin(email, password, rememberMe) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate login validation
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        console.error('無法讀取用戶數據:', e);
        users = [];
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('電子郵件或密碼錯誤');
    }
    
    // Check if email is verified
    if (!user.isVerified) {
        throw new Error('VERIFICATION_REQUIRED');
    }
    
    // Store user session with minimal data
    const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.username.charAt(0).toUpperCase(),
        avatarUrl: user.avatarUrl || null,
        loginTime: new Date().toISOString()
    };
    
    // Use safe storage methods
    if (rememberMe) {
        safeSetLocalStorage('currentUser', JSON.stringify(userData));
        safeSetLocalStorage('rememberMe', 'true');
    } else {
        try {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        } catch (e) {
            console.error('無法保存到 sessionStorage:', e);
            // Fallback to localStorage with shorter expiry
            safeSetLocalStorage('currentUser', JSON.stringify({...userData, tempSession: true}));
        }
        localStorage.removeItem('rememberMe');
    }
    
    // 同步快捷存取的頭像 (only if not too large)
    if (userData.avatarUrl && userData.avatarUrl.length < 1000) {
        safeSetLocalStorage('userAvatar', userData.avatarUrl);
    } else if (!userData.avatarUrl) {
        localStorage.removeItem('userAvatar');
    }
    
    return userData;
}

async function simulateRegister(userData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if user already exists by email or username
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingEmailUser = users.find(u => u.email === userData.email);
    const existingUsernameUser = users.find(u => u.username === userData.username);
    
    if (existingEmailUser) {
        if (existingEmailUser.isVerified) {
            throw new Error('此電子郵件已被註冊且已驗證，請直接登入');
        } else {
            // If email exists but not verified, allow re-registration with new verification code
            console.log('電子郵件已存在但未驗證，更新驗證碼..');
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Update existing user
            existingEmailUser.username = userData.username;
            existingEmailUser.password = userData.password;
            existingEmailUser.phone = userData.phone;
            existingEmailUser.verificationCode = verificationCode;
            existingEmailUser.verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            
            // Update users array
            const userIndex = users.findIndex(u => u.email === userData.email);
            users[userIndex] = existingEmailUser;
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log(`新驗證碼已生成${userData.email}: ${verificationCode}`);
            return existingEmailUser;
        }
    }
    
    if (existingUsernameUser) {
        throw new Error('此使用者名稱已被使用，請選擇其他名稱');
    }
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('生成新驗證碼:', verificationCode);
    
    // Add new user with verification status
    const newUser = {
        id: Date.now(),
        ...userData,
        isVerified: false,
        verificationCode: verificationCode,
        verificationCodeExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        createdAt: new Date().toISOString()
    };
    
    console.log('創建的新用戶對象:', newUser);
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Simulate sending verification email
    console.log(`驗證碼已發送到 ${userData.email}: ${verificationCode}`);
    
    return newUser;
}

function simulateGoogleLogin() {
    showNotification('Google 登入功能開發中..', 'info');
}

function simulateFacebookLogin() {
    showNotification('Facebook 登入功能開發中..', 'info');
}

// User State Management
function initUserState() {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUserInterface(currentUser);
    }
}

// 購物車管理系統
class CartManager {
    constructor() {
        this.storagePrefix = 'acc_shop_cart_';
        this.sessionKey = 'acc_shop_session_cart';
        this.init();
    }
    
    init() {
        console.log('🛒 購物車管理系統初始化');
        this.migrateOldData();
    }
    
    // 獲取當前用戶的購物車
    getCartKey(user = null) {
        const currentUser = user || getCurrentUser();
        
        if (!currentUser) {
            // 未登入用戶使用session 存儲
            return this.sessionKey;
        }
        
        // 已登入用戶使用用戶專屬存儲
        const userId = currentUser.id || this.generateUserHash(currentUser.email);
        return `${this.storagePrefix}${userId}`;
    }
    
    // 生成用戶哈希ID
    generateUserHash(email) {
        if (!email) return 'anonymous';
        
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 轉換為2位整�?
        }
        return Math.abs(hash).toString();
    }
    
    // 獲取購物車數據
    getCart(user = null) {
        const cartKey = this.getCartKey(user);
        const cartData = localStorage.getItem(cartKey);
        
        try {
            const cart = cartData ? JSON.parse(cartData) : [];
            console.log(`🛒 獲取購物車數據[${cartKey}]:`, cart);
            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error('購物車數據解析錯誤', error);
            return [];
        }
    }
    
    // 保存購物車數據
    saveCart(cart, user = null) {
        const cartKey = this.getCartKey(user);
        const cartData = Array.isArray(cart) ? cart : [];
        
        try {
            localStorage.setItem(cartKey, JSON.stringify(cartData));
            console.log(`🛒 保存購物車數據[${cartKey}]:`, cartData);
            this.notifyCartUpdate();
            return true;
        } catch (error) {
            console.error('購物車數據保存錯誤', error);
            return false;
        }
    }
    
    // 添加商品到購物車
    addItem(productId, productName, productPrice, quantity = 1) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showNotification('請先登入後再加入購物車', 'warning');
            document.getElementById('login-modal').style.display = 'block';
            return false;
        }
        
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + quantity;
            showNotification(`商品數量已增加至 ${existingItem.quantity}`, 'success');
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: parseFloat(productPrice) || 0,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
            showNotification('商品已加入購物車', 'success');
        }
        
        return this.saveCart(cart);
    }
    
    // 更新商品數量
    updateQuantity(productId, newQuantity) {
        const cart = this.getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            console.warn('商品不在購物車中:', productId);
            return false;
        }
        
        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }
        
        cart[itemIndex].quantity = newQuantity;
        cart[itemIndex].updatedAt = new Date().toISOString();
        
        return this.saveCart(cart);
    }
    
    // 增加商品數量
    increaseQuantity(productId, amount = 1) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            const newQuantity = (item.quantity || 1) + amount;
            return this.updateQuantity(productId, newQuantity);
        }
        
        return false;
    }
    
    // 減少商品數量
    decreaseQuantity(productId, amount = 1) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            const newQuantity = (item.quantity || 1) - amount;
            return this.updateQuantity(productId, newQuantity);
        }
        
        return false;
    }
    
    // 移除商品
    removeItem(productId) {
        const cart = this.getCart();
        const filteredCart = cart.filter(item => item.id !== productId);
        
        if (filteredCart.length !== cart.length) {
            showNotification('商品已從購物車移除', 'info');
            return this.saveCart(filteredCart);
        }
        
        return false;
    }
    
    // 清空購物�?
    clearCart() {
        return this.saveCart([]);
    }
    
    // 計算購物車總價
    calculateTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return total + (price * quantity);
        }, 0);
    }
    
    // 計算商品總數據
    getTotalItems() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            return total + (parseInt(item.quantity) || 1);
        }, 0);
    }
    
    // 獲取購物車統計信息
    getCartStats() {
        const cart = this.getCart();
        const total = this.calculateTotal();
        const itemCount = this.getTotalItems();
        
        return {
            items: cart,
            itemCount: itemCount,
            total: total,
            isEmpty: cart.length === 0
        };
    }
    
    // 遷移舊數據
    migrateOldData() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const newCartKey = this.getCartKey();
        const currentCart = this.getCart();
        
        // 如果新格式已有數據，跳過遷移
        if (currentCart.length > 0) return;
        
        // 檢查舊格式數據
        const oldKeys = [
            'cart',
            `cart_${currentUser.id}`,
            `cart_${currentUser.email}`,
            `cart_${this.generateUserHash(currentUser.email)}`
        ].filter(Boolean);
        
        for (const oldKey of oldKeys) {
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                try {
                    const oldCart = JSON.parse(oldData);
                    if (Array.isArray(oldCart) && oldCart.length > 0) {
                        console.log(`🔄 遷移購物車數據[${oldKey} -> ${newCartKey}]:`, oldCart);
                        this.saveCart(oldCart);
                        localStorage.removeItem(oldKey);
                        break;
                    }
                } catch (error) {
                    console.error(`舊數據遷移失敗[${oldKey}]:`, error);
                }
            }
        }
    }
    
    // 通知購物車更新
    notifyCartUpdate() {
        // 觸發自定義事件
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: this.getCartStats()
        }));
        
        // 更新UI顯示
        if (typeof updateCartDisplay === 'function') {
            setTimeout(() => updateCartDisplay(), 0);
        }
    }
    
    // 用戶登入時的數據處理
    onUserLogin(user) {
        console.log('🔄 用戶登入，處理購物車數據');
        
        // 獲取 session 購物車（未登入時的數據）
        const sessionCart = localStorage.getItem(this.sessionKey);
        const userCart = this.getCart(user);
        
        if (sessionCart) {
            try {
                const sessionItems = JSON.parse(sessionCart);
                if (Array.isArray(sessionItems) && sessionItems.length > 0) {
                    // 合併 session 購物車到用戶購物�?
                    const mergedCart = this.mergeCartItems(userCart, sessionItems);
                    this.saveCart(mergedCart, user);
                    
                    // 清除 session 購物�?
                    localStorage.removeItem(this.sessionKey);
                    console.log('成功已合併未登入時的購物車數據');
                }
            } catch (error) {
                console.error('合併購物車數據失敗', error);
            }
        }
        
        this.notifyCartUpdate();
    }
    
    // 用戶登出時的數據處理
    onUserLogout() {
        console.log('🔄 用戶登出，清理購物車狀態');
        this.notifyCartUpdate();
    }
    
    // 合併購物車項目
    mergeCartItems(existingCart, newItems) {
        const merged = [...existingCart];
        
        newItems.forEach(newItem => {
            const existingIndex = merged.findIndex(item => item.id === newItem.id);
            if (existingIndex >= 0) {
                // 商品已存在，增加數量
                merged[existingIndex].quantity = (merged[existingIndex].quantity || 1) + (newItem.quantity || 1);
            } else {
                // 新商品，直接添加
                merged.push(newItem);
            }
        });
        
        return merged;
    }
}

// 創建全局購物車管理實例
const cartManager = new CartManager();

// 向後兼容的函數
function getCartKey(user) {
    return cartManager.getCartKey(user);
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return null;
    // 優先採用 users 資料庫中的最新頭像
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const dbUser = users.find(u => u.email === user.email);
    if (dbUser && dbUser.avatarUrl && dbUser.avatarUrl !== user.avatarUrl) {
        user.avatarUrl = dbUser.avatarUrl;
        // 寫回 session/local，保持一致
        if (localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else if (sessionStorage.getItem('currentUser')) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        localStorage.setItem('userAvatar', user.avatarUrl);
    }
    return user;
}

function updateUserInterface(user) {
    const loginBtn = document.querySelector('.login-btn');
    const navActions = document.querySelector('.nav-actions');
    
    if (loginBtn && navActions) {
        // Replace login button with user menu
        const userMenu = createUserMenu(user);
        loginBtn.replaceWith(userMenu);
    }
}

function createUserMenu(user) {
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-avatar">${user.avatar}</div>
        <div class="user-dropdown">
            <a href="#profile">個人資料</a>
            <a href="#orders">我的訂單</a>
            <a href="#favorites">我的收藏</a>
            <div class="divider"></div>
            <a href="#settings">設定</a>
            <a href="#" onclick="logout()">登出</a>
        </div>
    `;
    return userMenu;
}

function logout() {
    // 通知購物車管理系統用戶登出
    cartManager.onUserLogout();
    
    // 使用新的清理函數
    cleanupUserLogout();
    
    showNotification('已成功登出', 'info');
    
    // 觸發跨頁面同步
    triggerLoginStateSync();
    
    // 重新載入頁面來確保完全重置
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Email Verification System
function initEmailVerification() {
    const verificationModal = document.getElementById('verification-modal');
    const verifyCodeBtn = document.querySelector('.verify-code-btn');
    const backToEmailBtn = document.querySelector('.back-to-email');
    const resendBtn = document.querySelector('.resend-verification');
    const verificationForm = document.getElementById('verification-form');
    
    // Show verification code input
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', () => {
            document.querySelector('.verification-content').style.display = 'none';
            document.querySelector('.verification-code-section').style.display = 'block';
            
            // 立即初始化驗證碼輸入�?
            initVerificationCodeInput();
            
            // 額外的初始化確保
            setTimeout(() => {
                initVerificationCodeInput();
                console.log('驗證碼輸入框已重新初始化');
            }, 200);
        });
    }
    
    // Back to email view
    if (backToEmailBtn) {
        backToEmailBtn.addEventListener('click', () => {
            document.querySelector('.verification-content').style.display = 'block';
            document.querySelector('.verification-code-section').style.display = 'none';
        });
    }
    
    // Resend verification email
    if (resendBtn) {
        resendBtn.addEventListener('click', handleResendVerification);
    }
    
    // 單一輸入框驗證處理
    const singleVerifyBtn = document.getElementById('single-verify-btn');
    const singleCodeInput = document.getElementById('single-code-input');
    
    if (singleVerifyBtn && singleCodeInput) {
        singleVerifyBtn.addEventListener('click', () => {
            const code = singleCodeInput.value.trim();
            console.log('驗證碼', code);
            
            if (code.length !== 6) {
                showVerificationError('請輸入6位數驗證碼');
                return;
            }
            
            if (!/^\d{6}$/.test(code)) {
                showVerificationError('驗證碼必須是6位數字');
                return;
            }
            
            // 使用 quickVerify 函數
            quickVerify(code);
        });
        
        // Enter 鍵提�?
        singleCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                singleVerifyBtn.click();
            }
        });
        
        // 輸入時自動格式化
        singleCodeInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // 只保留數據
            if (value.length > 6) {
                value = value.substring(0, 6);
            }
            e.target.value = value;
            
            // 如果輸入�?位數，自動驗�?
            if (value.length === 6) {
                setTimeout(() => {
                    singleVerifyBtn.click();
                }, 500);
            }
        });
        
        // 自動聚焦到輸入框
        setTimeout(() => {
            singleCodeInput.focus();
        }, 300);
    }
}

async function showEmailVerificationModal(email, verificationCode) {
    console.log('顯示驗證模態�?- 郵件:', email, '驗證碼', verificationCode);
    
    const modal = document.getElementById('verification-modal');
    const emailElement = document.querySelector('.verification-email');
    
    if (emailElement) {
        emailElement.textContent = email;
        console.log('設置郵件地址:', email);
    }
    
    // Store email and code for verification
    sessionStorage.setItem('verificationEmail', email);
    sessionStorage.setItem('verificationCode', verificationCode);
    
    // Reset modal state
    const verificationContent = document.querySelector('.verification-content');
    const verificationCodeSection = document.querySelector('.verification-code-section');
    
    if (verificationContent) {
        verificationContent.style.display = 'block';
    }
    if (verificationCodeSection) {
        verificationCodeSection.style.display = 'none';
    }
    
    // Show modal
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('模態框已顯示');
        
        // 開始發送電子郵�?
        await sendVerificationEmail(email, verificationCode);
        
        // Start resend timer
        startResendTimer();
    } else {
        console.error('找不到驗證模態框元素');
    }
}

// 簡化的驗證碼處理 - 只保留單一輸入框功�?

// 移除舊的複雜函數
function handleInputChange_REMOVED(e, index, inputs) {
    const value = e.target.value;
    console.log(`輸入�?${index + 1} 輸入�?`, `"${value}"`);
    
    // Only allow digits and limit to 1 character
    if (value && !/^\d$/.test(value)) {
        console.log('非數字輸入，清除');
        e.target.value = '';
        return;
    }
    
    // 確保只保留第一個字元
    if (value.length > 1) {
        e.target.value = value.charAt(0);
        console.log('截取第一個字元', e.target.value);
    }
    
    // Add filled class
    if (e.target.value) {
        e.target.classList.add('filled');
    } else {
        e.target.classList.remove('filled');
    }
    
    // Auto focus next input
    if (e.target.value && index < inputs.length - 1) {
        setTimeout(() => {
            inputs[index + 1].focus();
        }, 10);
    }
    
    // 即時檢查所有輸入框的�?
    setTimeout(() => {
        const currentValues = Array.from(inputs).map((inp, i) => {
            const val = inp.value || '';
            console.log(`檢查輸入�?${i + 1}: "${val}"`);
            return val;
        });
        
        const code = currentValues.join('');
        console.log('當前完整驗證碼', `"${code}"`, '長度:', code.length);
        
        // Auto submit when all fields are filled
        const allFilled = currentValues.every(val => val !== '');
        console.log('所有輸入框是否填滿:', allFilled);
        
        if (allFilled && code.length === 6) {
            console.log('自動提交驗證碼', code);
            
            setTimeout(() => {
                const form = document.getElementById('verification-form');
                if (form) {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(event);
                }
            }, 300);
        }
    }, 50);
}

function handleKeyDown_REMOVED(e, index, inputs) {
    // Handle backspace
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].classList.remove('filled');
    }
}

function handlePaste_REMOVED(e, inputs) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    console.log('貼上的內�?', paste);
    
    const digits = paste.match(/\d/g);
    console.log('提取的數據', digits);
    
    if (digits) {
        digits.slice(0, inputs.length).forEach((digit, i) => {
            if (inputs[i]) {
                inputs[i].value = digit;
                inputs[i].classList.add('filled');
            }
        });
        
        // Auto submit if all filled
        if (digits.length >= inputs.length) {
            const code = digits.slice(0, inputs.length).join('');
            console.log('貼上後自動提交驗證碼:', code);
            
            setTimeout(() => {
                const form = document.getElementById('verification-form');
                if (form) {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(event);
                }
            }, 500);
        }
    }
}

async function handleVerificationSubmit_REMOVED(e) {
    e.preventDefault();
    
    console.log('=== 表單提交開始 ===');
    console.log('事件對象:', e);
    
    // 使用多種方式獲取輸入�?
    const inputs1 = document.querySelectorAll('.verification-code-input input');
    const inputs2 = document.querySelectorAll('#verification-form input[type="text"]');
    const inputs3 = [
        document.getElementById('code-1'),
        document.getElementById('code-2'),
        document.getElementById('code-3'),
        document.getElementById('code-4'),
        document.getElementById('code-5'),
        document.getElementById('code-6')
    ].filter(input => input !== null);
    
    console.log('方法1找到輸入�?', inputs1.length);
    console.log('方法2找到輸入�?', inputs2.length);
    console.log('方法3找到輸入�?', inputs3.length);
    
    // 使用找到最多輸入框的方�?
    let inputs = inputs1;
    if (inputs2.length > inputs.length) inputs = inputs2;
    if (inputs3.length > inputs.length) inputs = inputs3;
    
    console.log('使用的輸入框數量:', inputs.length);
    
    const email = sessionStorage.getItem('verificationEmail');
    
    console.log('=== 驗證提交調試 ===');
    console.log('輸入框詳�?');
    inputs.forEach((input, index) => {
        console.log(`  輸入�?${index + 1}: ID="${input?.id}", �?"${input?.value}", 類型="${input?.type}"`);
    });
    
    const code = Array.from(inputs).map(input => (input?.value || '').trim()).join('');
    console.log('拼接後的驗證碼', `"${code}"`);
    console.log('驗證碼長�?', code.length);
    console.log('電子郵件:', email);
    console.log('==================');
    
    if (code.length === 0) {
        console.error('未檢測到任何輸入值！');
        showVerificationError('請輸入驗證碼');
        return;
    }
    
    if (code.length !== 6) {
        console.warn(`驗證碼長度不正確: ${code.length}`);
        showVerificationError(`請輸入完整的6位數驗證碼（當前長度�?{code.length}）`);
        return;
    }
    
    // 檢查是否都是數字
    if (!/^\d{6}$/.test(code)) {
        console.warn('驗證碼格式不正確:', code);
        showVerificationError('驗證碼必須是6位數字');
        return;
    }
    
    console.log('驗證碼格式正確，準備提交...');
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('loading');
        }
        
        await verifyEmailCode(email, code);
        
        // Success
        showNotification('電子郵件驗證成功', 'success');
        closeModal(document.getElementById('verification-modal'));
        
        // Clear stored data
        sessionStorage.removeItem('verificationEmail');
        sessionStorage.removeItem('verificationCode');
        
        // Show login modal
        setTimeout(() => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'block';
                switchAuthForm('login');
            }
        }, 1000);
        
    } catch (error) {
        console.error('驗證錯誤:', error.message);
        showVerificationError(error.message);
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
        }
    }
}

async function verifyEmailCode(email, code) {
    console.log('=== 驗證碼驗證調�?===');
    console.log('開始驗證 - 郵件:', email, '驗證碼', code);
    
    // 也檢�?sessionStorage 中的驗證碼
    const sessionCode = sessionStorage.getItem('verificationCode');
    console.log('SessionStorage中的驗證碼', sessionCode);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('所有用戶數據', users.length);
    
    const user = users.find(u => u.email === email);
    console.log('找到的用�?', user);
    
    if (!user) {
        throw new Error('用戶不存在');
    }
    
    if (user.isVerified) {
        throw new Error('電子郵件已經驗證過了');
    }
    
    console.log('數據庫中的驗證碼:', user.verificationCode);
    console.log('用戶輸入的驗證碼:', code);
    console.log('SessionStorage驗證碼', sessionCode);
    console.log('驗證碼類型比�?', typeof user.verificationCode, typeof code);
    
    // 優先使用 sessionStorage 中的驗證碼（最新的�?
    const actualCode = sessionCode || user.verificationCode;
    console.log('實際使用的驗證碼:', actualCode);
    
    // Check verification code (確保都是字符�?
    const userCode = String(actualCode);
    const inputCode = String(code).trim(); // 去除可能的空�?
    
    console.log('字符串比�?- 期望:', JSON.stringify(userCode), '實際:', JSON.stringify(inputCode));
    console.log('長度比較 - 期望:', userCode.length, '實際:', inputCode.length);
    
    if (userCode !== inputCode) {
        console.log('驗證碼不匹配!');
        console.log('字符逐一比較:');
        for (let i = 0; i < Math.max(userCode.length, inputCode.length); i++) {
            console.log(`位置 ${i}: 期望='${userCode[i] || 'undefined'}' 實際='${inputCode[i] || 'undefined'}'`);
        }
        throw new Error(`驗證碼錯誤，請檢查並重新輸入。期�? ${userCode}, 收到: ${inputCode}`);
    }
    
    // Check if code is expired
    const expiryTime = new Date(user.verificationCodeExpiry);
    const currentTime = new Date();
    console.log('過期時間:', expiryTime);
    console.log('當前時間:', currentTime);
    
    if (currentTime > expiryTime) {
        throw new Error('驗證碼已過期，請重新發送');
    }
    
    console.log('驗證碼匹配成功！');
    
    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    
    // Update users array
    const userIndex = users.findIndex(u => u.email === email);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('驗證成功！用戶已更新:', user);
    console.log('=====================');
    return user;
}

async function handleResendVerification() {
    const email = sessionStorage.getItem('verificationEmail');
    const resendBtn = document.querySelector('.resend-verification');
    
    if (!email) return;
    
    try {
        resendBtn.disabled = true;
        resendBtn.textContent = '發送中...';
        
        const newUser = await resendVerificationEmail(email);
        
        // 重新發送郵�?
        await sendVerificationEmail(email, newUser.verificationCode);
        
        showNotification('驗證郵件已重新發送', 'success');
        startResendTimer();
        
    } catch (error) {
        showNotification(error.message, 'error');
        showEmailStatus('error');
    } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = '重新發送驗證郵件';
    }
}

async function resendVerificationEmail(email) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        throw new Error('用戶不存在');
    }
    
    if (user.isVerified) {
        throw new Error('電子郵件已經驗證過了');
    }
    
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    // Update users array
    const userIndex = users.findIndex(u => u.email === email);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update session storage
    sessionStorage.setItem('verificationCode', verificationCode);
    
    console.log(`新驗證碼已生成${email}: ${verificationCode}`);
    
    return user;
}

function initCopyCodeButton() {
    const copyBtn = document.querySelector('.copy-code-btn');
    console.log('初始化複製按�?', copyBtn);
    
    if (copyBtn) {
        // 移除之前的事件監聽器
        copyBtn.removeEventListener('click', handleCopyClick);
        
        // 添加新的事件監聽�?
        copyBtn.addEventListener('click', handleCopyClick);
        console.log('複製按鈕事件監聽器已綁定');
    }
}

async function handleCopyClick() {
    const codeElement = document.getElementById('display-code');
    const code = codeElement ? codeElement.textContent : '';
    
    console.log('點擊複製按鈕，驗證碼:', code);
    
    if (!code || code === '------') {
        showNotification('沒有可複製的驗證碼', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(code);
        
        // Visual feedback
        const copyBtn = document.querySelector('.copy-code-btn');
        codeElement.classList.add('copied');
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        showNotification('驗證碼已複製到剪貼簿', 'success');
        
        // Reset after 2 seconds
        setTimeout(() => {
            codeElement.classList.remove('copied');
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
        
    } catch (err) {
        console.log('使用fallback複製方法');
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showNotification('驗證碼已複製到剪貼簿', 'success');
    }
}

function startResendTimer() {
    const timer = document.getElementById('resend-timer');
    const timerContainer = document.querySelector('.verification-timer');
    const resendBtn = document.querySelector('.resend-verification');
    
    let seconds = 60;
    resendBtn.disabled = true;
    timerContainer.classList.remove('hidden');
    
    const interval = setInterval(() => {
        seconds--;
        if (timer) timer.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            timerContainer.classList.add('hidden');
        }
    }, 1000);
}

function showVerificationError(message) {
    console.log('顯示驗證錯誤:', message);
    
    const inputs = document.querySelectorAll('.verification-code-input input');
    console.log('錯誤時找到的輸入框數據', inputs.length);
    
    // Clear inputs and add error class
    inputs.forEach((input, index) => {
        console.log(`清除輸入�?${index}`);
        input.value = '';
        input.classList.remove('filled');
        input.classList.add('error');
    });
    
    // Remove error class after animation and focus first input
    setTimeout(() => {
        inputs.forEach(input => input.classList.remove('error'));
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }, 1000);
    
    showNotification(message, 'error');
}

// Debug function to test verification code display
function testVerificationCodeDisplay() {
    console.log('測試驗證碼顯�?..');
    showEmailVerificationModal('test@example.com', '123456');
}

// Function to manually set verification code (for debugging)
function setVerificationCodeManually(code) {
    const codeElement = document.getElementById('display-code');
    if (codeElement) {
        codeElement.textContent = code;
        console.log('手動設置驗證碼', code);
        return true;
    } else {
        console.error('找不到驗證碼元素');
        return false;
    }
}

// Debug function to check current verification data
function debugVerificationData() {
    const email = sessionStorage.getItem('verificationEmail');
    const sessionCode = sessionStorage.getItem('verificationCode');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    console.log('=== 驗證數據調試 ===');
    console.log('當前郵件:', email);
    console.log('SessionStorage驗證碼', sessionCode);
    console.log('用戶對象:', user);
    if (user) {
        console.log('用戶數據庫驗證碼:', user.verificationCode);
        console.log('是否已驗�?', user.isVerified);
        console.log('過期時間:', user.verificationCodeExpiry);
    }
    console.log('==================');
    
    return {
        email,
        sessionCode,
        user
    };
}

// Debug function to check input boxes
function debugInputBoxes() {
    const inputs = document.querySelectorAll('.verification-code-input input');
    console.log('=== 輸入框調�?===');
    console.log('找到的輸入框數量:', inputs.length);
    
    inputs.forEach((input, index) => {
        console.log(`輸入�?${index + 1}:`, {
            id: input.id,
            value: `"${input.value}"`,
            disabled: input.disabled,
            readonly: input.readOnly,
            style: input.style.display,
            classList: Array.from(input.classList),
            hasEventListeners: {
                input: input.oninput !== null,
                keydown: input.onkeydown !== null,
                paste: input.onpaste !== null
            }
        });
    });
    
    // 檢查表單
    const form = document.getElementById('verification-form');
    console.log('驗證表單:', form ? '存在' : '不存在');
    
    console.log('================');
    return inputs;
}

// Force reinitialize input boxes
function forceReinitInputs() {
    console.log('強制重新初始化輸入框...');
    
    // 清除所有現有的事件監聽�?
    const inputs = document.querySelectorAll('.verification-code-input input');
    inputs.forEach(input => {
        // 創建新元素來替換舊的，這樣可以清除所有事件監聽器
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
    });
    
    // 重新初始�?
    setTimeout(() => {
        initVerificationCodeInput();
        console.log('強制重新初始化完成');
    }, 50);
}

// Manual read current input values
function readCurrentInputs() {
    const methods = [
        () => document.querySelectorAll('.verification-code-input input'),
        () => document.querySelectorAll('#verification-form input[type="text"]'),
        () => [
            document.getElementById('code-1'),
            document.getElementById('code-2'),
            document.getElementById('code-3'),
            document.getElementById('code-4'),
            document.getElementById('code-5'),
            document.getElementById('code-6')
        ].filter(input => input !== null)
    ];
    
    console.log('=== 手動讀取輸入�?===');
    methods.forEach((method, index) => {
        const inputs = method();
        console.log(`方法 ${index + 1} 找到 ${inputs.length} 個輸入框:`);
        inputs.forEach((input, i) => {
            if (input) {
                console.log(`  [${i + 1}] ID: ${input.id}, �? "${input.value}", 長度: ${input.value.length}`);
            }
        });
        
        if (inputs.length > 0) {
            const code = Array.from(inputs).map(input => input?.value || '').join('');
            console.log(`  拼接結果: "${code}" (長度: ${code.length})`);
        }
    });
    console.log('=====================');
    
    return methods.map(method => method());
}

// Manual submit verification
function manualSubmitVerification() {
    console.log('手動提交驗證...');
    const form = document.getElementById('verification-form');
    if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
    } else {
        console.error('找不到驗證表單');
    }
}

// Set verification code manually for testing
function setVerificationCode(code) {
    console.log('手動設置驗證碼', code);
    
    if (code.length !== 6) {
        console.error('驗證碼必須是6位數字');
        return false;
    }
    
    const inputs = [
        document.getElementById('code-1'),
        document.getElementById('code-2'),
        document.getElementById('code-3'),
        document.getElementById('code-4'),
        document.getElementById('code-5'),
        document.getElementById('code-6')
    ];
    
    let success = true;
    inputs.forEach((input, index) => {
        if (input) {
            input.value = code.charAt(index);
            input.classList.add('filled');
            console.log(`設置輸入�?${index + 1}: "${input.value}"`);
            
            // 觸發輸入事件
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        } else {
            console.error(`找不到輸入框 ${index + 1}`);
            success = false;
        }
    });
    
    if (success) {
        console.log('驗證碼設置成功，準備提交...');
        setTimeout(() => {
            manualSubmitVerification();
        }, 500);
    }
    
    return success;
}

// 簡單直接的驗證函數
async function quickVerify(code) {
    console.log('=== 快速驗�?===');
    console.log('驗證碼', code);
    
    // 驗證輸入格式
    if (!code || code.length !== 6) {
        showVerificationError('請輸入6位數驗證碼');
        return;
    }
    
    if (!/^\d{6}$/.test(code)) {
        showVerificationError('驗證碼必須是6位數字');
        return;
    }
    
    // 獲取郵件地址
    const email = sessionStorage.getItem('verificationEmail');
    if (!email) {
        console.error('找不到驗證郵件地址');
        showVerificationError('驗證會話已過期，請重新註冊');
        return;
    }
    
    console.log('驗證郵件:', email);
    
    try {
        // 直接調用驗證邏輯
        await verifyEmailCode(email, code);
        
        // 驗證成功
        console.log('驗證成功');
        showNotification('電子郵件驗證成功', 'success');
        
        // 關閉驗證模態�?
        const verificationModal = document.getElementById('verification-modal');
        if (verificationModal) {
            verificationModal.style.display = 'none';
        }
        
        // 清除存儲的數據
        sessionStorage.removeItem('verificationEmail');
        sessionStorage.removeItem('verificationCode');
        
        // 顯示登入模態�?
        setTimeout(() => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'block';
                switchAuthForm('login');
            }
        }, 1000);
        
    } catch (error) {
        console.error('驗證失敗:', error.message);
        showVerificationError(error.message);
    }
}

// Email sending functionality
async function sendVerificationEmail(email, verificationCode) {
    const emailSending = document.querySelector('.email-sending');
    const emailSent = document.querySelector('.email-sent');
    const emailError = document.querySelector('.email-error');
    
    // Show sending state
    showEmailStatus('sending');
    
    try {
        // 使用 EmailJS 或其他電子郵件服�?
        await sendEmailWithEmailJS(email, verificationCode);
        
        // 成功發�?
        showEmailStatus('sent');
        console.log('驗證郵件發送成�?', email);
        
    } catch (error) {
        console.error('郵件發送失敗', error);
        showEmailStatus('error');
    }
}

async function sendEmailWithEmailJS(email, verificationCode) {
    // EmailJS 設定 - 請替換為您的實際設定
    const EMAIL_SERVICE_ID = 'ChenYou.shop'; // 替換為您的服務ID
    const EMAIL_TEMPLATE_ID = 'template_cxgkqtc'; // 替換為您的模板ID  
    const EMAIL_PUBLIC_KEY = 'c1yWRuO8irb7poGvm'; // 替換為您的公�?
    
    // 檢查 EmailJS 是否已載�?
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS 未載入，使用模擬發送');
        await simulateEmailSending(email, verificationCode);
        return;
    }
    
    // 初始�?EmailJS (如果需�?
    try {
        emailjs.init(EMAIL_PUBLIC_KEY);
        console.log('EmailJS 初始化成功');
    } catch (initError) {
        console.error('EmailJS 初始化失敗', initError);
    }
    
    const templateParams = {
        to_email: email,
        verification_code: verificationCode,
        user_email: email,
        site_name: 'CY.SHOP',
        expiry_time: '15分鐘'
    };
    
    console.log('=== EmailJS 發送調試信息===');
    console.log('服務ID:', EMAIL_SERVICE_ID);
    console.log('模板ID:', EMAIL_TEMPLATE_ID);
    console.log('公鑰:', EMAIL_PUBLIC_KEY);
    console.log('模板參數:', templateParams);
    console.log('========================');
    
    try {
        const response = await emailjs.send(
            EMAIL_SERVICE_ID,
            EMAIL_TEMPLATE_ID,
            templateParams,
            EMAIL_PUBLIC_KEY
        );
        
        console.log('EmailJS 發送成�?', response);
        console.log('響應狀�?', response.status);
        console.log('響應文本:', response.text);
        return response;
        
    } catch (error) {
        console.error('EmailJS 發送失敗', error);
        // 如果 EmailJS 失敗，使用備用方�?
        await simulateEmailSending(email, verificationCode);
    }
}

async function simulateEmailSending(email, verificationCode) {
    // 模擬發送延�?
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 創建郵件內容
    const emailContent = createEmailTemplate(email, verificationCode);
    
    // 在控制台顯示郵件內容（開發時用）
    console.log('=== 驗證郵件內容 ===');
    console.log('收件�?', email);
    console.log('驗證碼', verificationCode);
    console.log('郵件HTML內容:');
    console.log(emailContent);
    console.log('==================');
    
    // 如果可能，嘗試打開郵件客戶端
    const subject = encodeURIComponent('CY.SHOP 電子郵件驗證');
    const body = encodeURIComponent(`親愛的用戶，\n\n您的驗證碼是�?{verificationCode}\n\n此驗證碼將在15分鐘後過期。\n\n如果您沒有註�?CY.SHOP 帳號，請忽略此郵件。\n\n謝謝！\nCY.SHOP 團隊`);
    
    // 嘗試打開默認郵件客戶端（可選�?
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    console.log('郵件鏈接:', mailtoLink);
}

function createEmailTemplate(email, verificationCode) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CY.SHOP 電子郵件驗證</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0099FF, #003366); color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .verification-code { background: #0099FF; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 3px; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .button { background: #0099FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CY.SHOP</h1>
            <h2>電子郵件驗證</h2>
        </div>
        
        <div class="content">
            <h3>親愛的用戶，</h3>
            <p>感謝您註�?CY.SHOP！為了確保您帳號的安全性，請使用以下驗證碼完成電子郵件驗證碼/p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p><strong>重要提醒�?/strong></p>
            <ul>
                <li>此驗證碼將在 <strong>15分鐘</strong> 後過�?/li>
                <li>請勿將此驗證碼分享給任何�?/li>
                <li>如果您沒有註�?CY.SHOP 帳號，請忽略此郵�?/li>
            </ul>
            
            <p>如有任何問題，請聯繫我們的客服團隊�?/p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 CY.SHOP. 版權所�?</p>
            <p>這是一封自動發送的郵件，請勿直接回覆�?/p>
        </div>
    </div>
</body>
</html>`;
}

function showEmailStatus(status) {
    const emailSending = document.querySelector('.email-sending');
    const emailSent = document.querySelector('.email-sent');
    const emailError = document.querySelector('.email-error');
    
    // 隱藏所有狀�?
    if (emailSending) emailSending.style.display = 'none';
    if (emailSent) emailSent.style.display = 'none';
    if (emailError) emailError.style.display = 'none';
    
    // 顯示對應狀�?
    switch (status) {
        case 'sending':
            if (emailSending) emailSending.style.display = 'block';
            break;
        case 'sent':
            if (emailSent) emailSent.style.display = 'block';
            break;
        case 'error':
            if (emailError) emailError.style.display = 'block';
            break;
    }
}

// Make functions globally available
window.switchAuthForm = switchAuthForm;
window.togglePassword = togglePassword;
window.logout = logout;
window.showEmailVerificationModal = showEmailVerificationModal;
window.testVerificationCodeDisplay = testVerificationCodeDisplay;
window.setVerificationCodeManually = setVerificationCodeManually;
window.sendVerificationEmail = sendVerificationEmail;
// 保留必要的調試函數
window.debugVerificationData = debugVerificationData;
window.quickVerify = quickVerify;

// 使購物車相關函數全局可訪�?
window.addToCart = addToCart;
window.openCartModal = openCartModal;
window.updateCartDisplay = updateCartDisplay;
// updateQuantity �?removeFromCart 在各自定義後賦�?

// 使用戶功能全局可訪�?
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;
window.saveUserSettings = saveUserSettings;

// 導航功能
function initNavigation() {
    // 平滑滾動到指定區�?
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const isUserMenuItem = !!this.closest('.user-dropdown');
            const hasAction = this.hasAttribute('data-action') || this.hasAttribute('onclick');

            // 對以下情況不做攔截，交給各自邏輯處理
            if (!href || href === '#' || isUserMenuItem || hasAction) {
                return;
            }

            e.preventDefault();
            const targetId = href.substring(1);

            // 特殊處理
            if (targetId === 'cart') {
                openCartModal();
                return;
            }

            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 產品類別下拉菜單
    const productDropdown = document.querySelector('.dropdown');
    if (productDropdown) {
        productDropdown.addEventListener('mouseenter', () => {
            productDropdown.classList.add('active');
        });
        
        productDropdown.addEventListener('mouseleave', () => {
            productDropdown.classList.remove('active');
        });
    }
}

// 購物車功�?
function openCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.style.display = 'block';
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    // 檢查DOM是否準備就緒
    if (document.readyState === 'loading') {
        console.log('DOM仍在加載中，延遲執行 updateCartDisplay');
        document.addEventListener('DOMContentLoaded', updateCartDisplay);
        return;
    }
    
    // 使用新的購物車管理系統
    const currentUser = getCurrentUser();
    
    console.log('🛒 更新購物車顯示，用戶:', currentUser?.email || '未登入');
    
    // 獲取購物車統計信息
    const cartStats = cartManager.getCartStats();
    console.log('📊 購物車統計', cartStats);
    
    // 檢查DOM元素
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total span');
    const cartCount = document.querySelector('.cart-count');
    
    if (!cartItems && !cartTotal && !cartCount) {
        console.log('未找到購物車元素，可能不在相關頁面');
        return;
    }
    
    // 更新購物車項目顯�?
    if (cartItems) {
        if (!currentUser) {
            // 未登入用�?
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-user-lock"></i>
                    <p>請先登入查看購物�?/p>
                    <button class="btn-primary" onclick="closeModal(document.getElementById('cart-modal')); document.getElementById('login-modal').style.display = 'block';">立即登入</button>
                </div>
            `;
        } else if (cartStats.isEmpty) {
            // 已登入但購物車為�?
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>您的購物車是空的</p>
                    <button class="btn-primary" onclick="closeModal(document.getElementById('cart-modal'))">開始購物</button>
                </div>
            `;
        } else {
            // 有商品的購物�?
            cartItems.innerHTML = cartStats.items.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="item-price">💰 NT$ ${item.price}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cartManager.decreaseQuantity('${item.id}')" title="減少數量">-</button>
                        <span class="quantity-display">${item.quantity || 1}</span>
                        <button class="quantity-btn" onclick="cartManager.increaseQuantity('${item.id}')" title="增加數量">+</button>
                        <button class="remove-btn" onclick="cartManager.removeItem('${item.id}')" title="移除商品">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // 更新總價顯示
    if (cartTotal) {
        if (!currentUser) {
            cartTotal.textContent = '請先登入';
        } else {
            cartTotal.textContent = `NT$ ${cartStats.total.toLocaleString()}`;
        }
    }
    
    // 更新購物車數量顯�?
    if (cartCount) {
        if (!currentUser || cartStats.isEmpty) {
            cartCount.style.display = 'none';
        } else {
            cartCount.textContent = cartStats.itemCount;
            cartCount.style.display = 'block';
        }
    }
    
    console.log(`✅購物車更新完成 ${cartStats.items.length} 個商品類型 ${cartStats.itemCount} 件商品 總價 NT$ ${cartStats.total}`);
    
    // 確保購物車計數器正確更新
    fixCartDisplay();
}

// 強制重置購物車顯�?
function forceResetCart() {
    // 只清除舊的全局購物車數據，不影響用戶專屬購物車
    localStorage.removeItem('cart');
    console.log('已清除舊的全局購物車數據');
    
    // 重新初始化顯�?
    setTimeout(() => {
        updateCartDisplay();
    }, 100);
}

function addToCart(productId, productName, productPrice) {
    console.log('🛒 添加商品到購物車:', { productId, productName, productPrice });
    
    // 使用新的購物車管理系統
    const success = cartManager.addItem(productId, productName, productPrice, 1);
    
    if (success) {
        // 添加成功動畫效果
        const addButton = document.querySelector(`[onclick*="addToCart('${productId}"]`);
        if (addButton) {
            addButton.classList.add('add-to-cart-success');
            setTimeout(() => {
                addButton.classList.remove('add-to-cart-success');
            }, 1000);
        }
        
        console.log('商品已成功添加到購物車');
        
        // 自動跳轉到付款方式選擇
        setTimeout(() => {
            openPaymentSelection();
        }, 1500); // 延遲1.5秒讓用戶看到添加成功的動畫
    } else {
        console.error('添加商品到購物車失敗');
    }
}

// 向後兼容的數量更新函數
function updateQuantity(id, change) {
    console.log('📦 更新商品數量 - ID:', id, '變化:', change);
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('用戶未登入，無法更新數量');
        return;
    }
    
    // 使用新的購物車管理系統
    if (change > 0) {
        cartManager.increaseQuantity(id, change);
    } else if (change < 0) {
        cartManager.decreaseQuantity(id, Math.abs(change));
    }
}

// 向後兼容的移除函數
function removeFromCart(id) {
    console.log('🗑�?移除商品 ID:', id);
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('用戶未登入，無法移除商品');
        return;
    }
    
    // 使用新的購物車管理系統
    cartManager.removeItem(id);
}

// 將函數掛載到 window (向後兼容)
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

// 調試函數：檢查購物車狀�?
window.debugCart = function() {
    const currentUser = getCurrentUser();
    const cartKey = getCartKey(currentUser);
    
    console.log('=== 購物車調試信息===');
    console.log('當前用戶:', currentUser);
    console.log('購物車鍵:', cartKey);
    
    // 檢查所有可能的購物車鍵
    const allKeys = Object.keys(localStorage);
    const cartKeys = allKeys.filter(k => k.includes('cart'));
    console.log('所有購物車相關�?', cartKeys);
    
    cartKeys.forEach(key => {
        const data = localStorage.getItem(key);
        const parsed = JSON.parse(data || '[]');
        console.log(`�?"${key}":`, parsed);
    });
    
    // 當前使用的購物車
    const currentCart = localStorage.getItem(cartKey);
    console.log('當前購物車數據', currentCart);
    console.log('解析�?', JSON.parse(currentCart || '[]'));
    
    console.log('=== 調試結束 ===');
    
    return {
        user: currentUser,
        cartKey: cartKey,
        cartData: JSON.parse(currentCart || '[]'),
        allCartKeys: cartKeys
    };
};

// 測試函數：添加測試商品到購物�?
window.testAddToCart = function() {
    console.log('🧪 測試新的購物車系統..');
    
    const testProducts = [
        { id: 'test-lol-1', name: 'LOL 鑽石段位帳號', price: 599 },
        { id: 'test-val-1', name: 'Valorant 白金帳號', price: 799 },
        { id: 'test-cs-1', name: 'CS2 黃金帳號', price: 699 }
    ];
    
    testProducts.forEach((product, index) => {
        setTimeout(() => {
            cartManager.addItem(product.id, product.name, product.price, 1);
            console.log(`�?添加測試商品 ${index + 1}:`, product.name);
        }, index * 500);
    });
    
    setTimeout(() => {
        console.log('🛒 測試完成，購物車統計:', cartManager.getCartStats());
    }, 2000);
};

// 測試函數：完整的購物車流程測�?
window.testCartFlow = function() {
    console.log('🔄 開始完整購物車流程測�?..');
    
    // 1. 清空購物�?
    cartManager.clearCart();
    console.log('1️⃣ 購物車已清空');
    
    // 2. 添加商品
    cartManager.addItem('flow-test-1', '測試商品A', 100, 2);
    cartManager.addItem('flow-test-2', '測試商品B', 200, 1);
    console.log('2️⃣ 已添加測試商品');
    
    // 3. 修改數量
    setTimeout(() => {
        cartManager.increaseQuantity('flow-test-1', 1);
        console.log('3️⃣ 已增加商品A數量');
        
        // 4. 移除商品
        setTimeout(() => {
            cartManager.removeItem('flow-test-2');
            console.log('4️⃣ 已移除商品B');
            
            // 5. 顯示最終統�?
            setTimeout(() => {
                const stats = cartManager.getCartStats();
                console.log('5️⃣ 最終購物車統計:', stats);
                console.log('✅ 流程測試完成');
            }, 500);
        }, 1000);
    }, 1000);
};


// 產品互動功能
function initProductInteractions() {
    // 立即購買按鈕
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.textContent.includes('立即購買')) {
            btn.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                if (productCard) {
                    const h4Element = productCard.querySelector('h4');
                    const priceElement = productCard.querySelector('.price');
                    
                    if (!h4Element || !priceElement) {
                        console.error('產品元素未找到', { h4: !!h4Element, price: !!priceElement });
                        return;
                    }
                    
                    const productName = h4Element.textContent;
                    const productPrice = priceElement.textContent.replace('NT$ ', '');
                    const productId = productName.replace(/\s+/g, '-').toLowerCase();
                    
                    addToCart(productId, productName, productPrice);
                }
            });
        }
    });
    
    // 查看更多按鈕
    document.querySelectorAll('.btn-outline').forEach(btn => {
        if (btn.textContent.includes('查看更多')) {
            btn.addEventListener('click', function() {
                const categoryCard = this.closest('.category-card');
                if (categoryCard) {
                    const h3Element = categoryCard.querySelector('h3');
                    if (h3Element) {
                        const category = h3Element.textContent;
                        showNotification(`正在載入 ${category} 更多商品...`, 'info');
                    } else {
                        console.error('分類標題元素未找到');
                    }
                } else {
                    console.error('分類卡片元素未找到');
                }
                // 這裡可以實現分類頁面跳轉
            });
        }
    });
}

// 輪播圖控�?
function initSliderControls() {
    const heroSlider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        currentSlide = index;
    }
    
    // 點擊圓點切換
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // 自動輪播
    setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        showSlide(nextSlide);
    }, 5000);
    
    // 產品輪播控制
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const productsContainer = document.querySelector('.products-container');
    
    if (arrowLeft && arrowRight && productsContainer) {
        let scrollPosition = 0;
        const scrollAmount = 320; // 產品卡片寬度 + margin
        
        arrowLeft.addEventListener('click', () => {
            scrollPosition = Math.max(0, scrollPosition - scrollAmount);
            productsContainer.style.transform = `translateX(-${scrollPosition}px)`;
        });
        
        arrowRight.addEventListener('click', () => {
            const maxScroll = (productsContainer.children.length - 3) * scrollAmount;
            scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
            productsContainer.style.transform = `translateX(-${scrollPosition}px)`;
        });
    }
}

// 搜索功能
function initSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        function performSearch() {
            const query = searchInput.value.trim().toLowerCase();
            if (query === '') {
                showNotification('請輸入搜索關鍵字', 'warning');
                return;
            }
            
            // 模擬搜索結果
            const searchResults = [
                'Valorant 帳號',
                'Instagram 帳號', 
                'LOL 帳號',
                'Discord 帳號'
            ].filter(item => item.toLowerCase().includes(query));
            
            if (searchResults.length > 0) {
                showNotification(`找到 ${searchResults.length} 個相關產�? ${searchResults.join(', ')}`, 'success');
                // 滾動到產品區�?
                document.getElementById('products').scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                showNotification('未找到相關產品', 'info');
            }
        }
        
        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    console.log('搜索功能已初始化');
}

// Hero區域按鈕功�?
function initHeroButtons() {
    const startShoppingBtn = document.querySelector('.hero-buttons .btn-primary');
    const learnMoreBtn = document.querySelector('.hero-buttons .btn-secondary');
    
    if (startShoppingBtn) {
        startShoppingBtn.addEventListener('click', () => {
            document.getElementById('products').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            document.getElementById('about').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

// 結帳功能
function initCheckoutFunctionality() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            console.log('🛒 開始結帳流程');
            
            // 檢查用戶登入狀�?
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showNotification('請先登入再進行結帳', 'warning');
                closeModal(document.getElementById('cart-modal'));
                setTimeout(() => {
                    document.getElementById('login-modal').style.display = 'block';
                }, 500);
                return;
            }
            
            // 獲取購物車統計信息
            const cartStats = cartManager.getCartStats();
            
            if (cartStats.isEmpty) {
                showNotification('購物車是空的', 'warning');
                return;
            }
            
            // 模擬結帳流程
            showNotification('正在處理您的訂單...', 'info');
            setTimeout(() => {
                // 創建訂單記錄 - 按用戶存儲
                const userOrdersKey = `userOrders_${currentUser.id}`;
                const orders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
                const cart = cartStats.items;
                
                // Valorant帳號�?- 預設不同的帳號資�?
                const valorantAccounts = [
                    {
                        username: 'ValorantPro#2024',
                        rank: '黃金段位',
                        level: '等級 87',
                        skins: '15+ 武器造型',
                        region: 'AP 亞太'
                    },
                    {
                        username: 'EliteAgent#7799',
                        rank: '黃金段位',
                        level: '等級 92',
                        skins: '20+ 武器造型',
                        region: 'AP 亞太'
                    },
                    {
                        username: 'ShadowRecon#4455',
                        rank: '黃金段位',
                        level: '等級 78',
                        skins: '12+ 武器造型',
                        region: 'AP 亞太'
                    },
                    {
                        username: 'PhoenixRise#8821',
                        rank: '黃金段位',
                        level: '等級 95',
                        skins: '18+ 武器造型',
                        region: 'AP 亞太'
                    }
                ];
                
                // 為每個購物車項目創建單獨的訂�?
                let accountIndex = 0;
                cart.forEach((item, index) => {
                    let orderItems = [item];
                    
                    // 如果是Valorant相關產品，分配不同帳�?
                    if (item.name && item.name.toLowerCase().includes('valorant')) {
                        const account = valorantAccounts[accountIndex % valorantAccounts.length];
                        orderItems = [{
                            ...item,
                            accountDetails: {
                                username: account.username,
                                rank: account.rank,
                                level: account.level,
                                skins: account.skins,
                                region: account.region
                            }
                        }];
                        accountIndex++;
                    }
                    
                    const newOrder = {
                        id: 'ORDER-' + (Date.now() + index),
                        items: orderItems,
                        total: parseInt(item.price) * (item.quantity || 1),
                        date: new Date().toISOString(),
                        status: '已完成'
                    };
                    orders.push(newOrder);
                });
                
                localStorage.setItem(userOrdersKey, JSON.stringify(orders));
                
                // 清空當前用戶的購物車
                cartManager.clearCart();
                closeModal(document.getElementById('cart-modal'));
                showNotification('訂單已成功提交！', 'success');
            }, 2000);
        });
    }
}

// 清除舊的測試數據
function clearOldTestData() {
    // 清除舊的全局訂單數據
    localStorage.removeItem('userOrders');
    
    // 清除舊的全局購物車數據
    localStorage.removeItem('cart');
    
    console.log('已清除舊的測試數據');
}

// 社交媒體連結
function initSocialLinks() {
    const socialLinks = {
        'fa-facebook': 'https://facebook.com',
        
        'fa-instagram': 'https://www.instagram.com/chenyou.shop?igsh=MThkd29jbXc3bDg2OQ%3D%3D&utm_source=qr',
        'fa-discord': 'https://discord.gg/SZkyeKJ4wp'
    };
    
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const iconClass = this.querySelector('i').className;
            
            for (const [key, url] of Object.entries(socialLinks)) {
                if (iconClass.includes(key)) {
                    window.open(url, '_blank');
                    break;
                }
            }
        });
    });
}

// 用戶菜單功能
function initUserMenu() {
    console.log('初始化用戶菜�?..');
    
    const userMenu = document.querySelector('.user-menu');
    const userAvatar = document.querySelector('.user-avatar');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    console.log('用戶菜單元素:', userMenu);
    console.log('用戶頭像:', userAvatar);
    console.log('下拉菜單項目數量:', dropdownItems.length);
    
    // 先移除舊監聽，避免重複綁�?
    if (userAvatar) {
        const newAvatar = userAvatar.cloneNode(true);
        userAvatar.parentNode.replaceChild(newAvatar, userAvatar);
        newAvatar.addEventListener('click', (e) => {
            console.log('點擊用戶頭像');
            e.stopPropagation();
            if (userMenu) {
                userMenu.classList.toggle('active');
                console.log('用戶菜單active狀�?', userMenu.classList.contains('active'));
            }
        });
    }
    
    // 點擊其他地方關閉下拉菜單
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
    
    // 處理下拉菜單項目點擊
    dropdownItems.forEach((item, index) => {
        console.log(`綁定菜單項目 ${index}:`, item.getAttribute('data-action'));
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        newItem.addEventListener('click', (e) => {
            console.log('點擊菜單項目:', newItem.getAttribute('data-action'));
            e.preventDefault();
            e.stopPropagation();
            const action = newItem.getAttribute('data-action');
            handleUserMenuAction(action);
            if (userMenu) userMenu.classList.remove('active');
        });
    });
    
    // 也嘗試直接綁定到用戶下拉菜單
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        console.log('找到用戶下拉菜單，添加點擊處理');
        userDropdown.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-item')) {
                const item = e.target.closest('.dropdown-item');
                const action = item.getAttribute('data-action');
                console.log('通過事件委託點擊:', action);
                handleUserMenuAction(action);
                
                if (userMenu) {
                    userMenu.classList.remove('active');
                }
            }
        });
    }
}

// 處理用戶菜單動作
function handleUserMenuAction(action) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showNotification('請先登入', 'warning');
        document.getElementById('login-modal').style.display = 'block';
        return;
    }
    
    switch (action) {
        case 'profile':
            showUserProfile();
            break;
        case 'orders':
            showUserOrders();
            break;
        case 'favorites':
            showUserFavorites();
            break;
        case 'settings':
            showUserSettings();
            break;
        case 'logout':
            handleLogout();
            break;
    }
}

// 顯示個人資料
function showUserProfile() {
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userName = localStorage.getItem('userName') || '用戶';
    const userAvatar = localStorage.getItem('userAvatar');
    const registerDate = localStorage.getItem('registerDate') || new Date().toLocaleDateString();
    
    // 填入個人資料數據
    document.getElementById('profile-username').value = userName;
    document.getElementById('profile-email').value = userEmail;
    document.getElementById('profile-register-date').value = registerDate;
    
    // 更新頭像
    const profileAvatarText = document.querySelector('.profile-avatar-text');
    const profileAvatarImg = document.querySelector('.profile-avatar-img');
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');
    
    if (userAvatar && profileAvatarImg) {
        // 顯示用戶上傳的頭像
        profileAvatarImg.src = userAvatar;
        profileAvatarImg.style.display = 'block';
        if (profileAvatarText) {
            profileAvatarText.style.display = 'none';
        }
        if (removeAvatarBtn) {
            removeAvatarBtn.style.display = 'inline-block';
        }
    } else {
        // 顯示文字頭像
        if (profileAvatarText) {
            profileAvatarText.textContent = userName.charAt(0).toUpperCase();
            profileAvatarText.style.display = 'flex';
        }
        if (profileAvatarImg) {
            profileAvatarImg.style.display = 'none';
        }
        if (removeAvatarBtn) {
            removeAvatarBtn.style.display = 'none';
        }
    }
    
    // 顯示模態�?
    document.getElementById('profile-modal').style.display = 'block';
}

// 顯示我的訂單
function showUserOrders() {
    // 檢查是否已登入並獲取當前用戶
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        document.getElementById('orders-modal').style.display = 'block';
        document.getElementById('orders-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-lock"></i>
                <p>請先登入查看訂單</p>
                <button class="btn-primary" onclick="closeModal(document.getElementById('orders-modal')); document.getElementById('login-modal').style.display = 'block';">立即登入</button>
            </div>
        `;
        return;
    }
    
    // 根據當前用戶的ID獲取訂單
    const userOrdersKey = `userOrders_${currentUser.id}`;
    const orders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>您還沒有任何訂單</p>
                <button class="btn-primary" onclick="closeModal(document.getElementById('orders-modal'))">開始購物</button>
            </div>
        `;
    } else {
        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status completed">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => {
                        let itemHtml = `<div class="order-item-detail">�?${item.name}`;
                        if (item.accountDetails) {
                            itemHtml += `
                                <div class="account-info">
                                    <div class="account-row">
                                        <strong>帳號�?/strong> ${item.accountDetails.username}
                                    </div>
                                    <div class="account-row">
                                        <strong>段位�?/strong> ${item.accountDetails.rank} | ${item.accountDetails.level}
                                    </div>
                                    <div class="account-row">
                                        <strong>造型�?/strong> ${item.accountDetails.skins} | ${item.accountDetails.region}
                                    </div>
                                </div>`;
                        }
                        itemHtml += `</div>`;
                        return itemHtml;
                    }).join('')}
                </div>
                <div class="order-total">總計: NT$ ${order.total}</div>
                <div class="order-date">訂購日期: ${new Date(order.date).toLocaleDateString()}</div>
            </div>
        `).join('');
    }
    
    // 顯示模態�?
    document.getElementById('orders-modal').style.display = 'block';
}

// 顯示我的收藏
function showUserFavorites() {
    // 檢查是否已登入並獲取當前用戶
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        document.getElementById('favorites-modal').style.display = 'block';
        document.getElementById('favorites-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-lock"></i>
                <p>請先登入查看收藏</p>
                <button class="btn-primary" onclick="closeModal(document.getElementById('favorites-modal')); document.getElementById('login-modal').style.display = 'block';">立即登入</button>
            </div>
        `;
        return;
    }
    
    // 根據當前用戶的ID獲取收藏
    const userFavoritesKey = `userFavorites_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(userFavoritesKey) || '[]');
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>您還沒有收藏任何商品</p>
                <button class="btn-primary" onclick="closeModal(document.getElementById('favorites-modal'))">瀏覽商品</button>
            </div>
        `;
    } else {
        favoritesList.innerHTML = favorites.map(item => `
            <div class="favorite-item">
                <div class="favorite-placeholder" style="width: 60px; height: 60px; background: linear-gradient(135deg, #007bff, #66B2FF); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px;">
                    ${item.name.charAt(0)}
                </div>
                <div class="favorite-info">
                    <div class="favorite-name">${item.name}</div>
                    <div class="favorite-date">收藏�? ${new Date(item.addedAt).toLocaleDateString()}</div>
                </div>
                <div class="favorite-actions">
                    <button class="btn-primary btn-sm">查看</button>
                    <button class="btn-secondary btn-sm" onclick="removeFromFavorites('${item.id}')">移除</button>
                </div>
            </div>
        `).join('');
    }
    
    // 顯示模態�?
    document.getElementById('favorites-modal').style.display = 'block';
}

// 顯示設定
function showUserSettings() {
    // 載入用戶設定
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // 設置開關狀�?
    document.getElementById('email-notifications').checked = settings.emailNotifications !== false;
    document.getElementById('push-notifications').checked = settings.pushNotifications === true;
    document.getElementById('public-profile').checked = settings.publicProfile === true;
    document.getElementById('show-purchase-history').checked = settings.showPurchaseHistory !== false;
    
    // 顯示模態�?
    document.getElementById('settings-modal').style.display = 'block';
}

// 處理登出
function handleLogout() {
    // 通知購物車管理系統用戶登出
    cartManager.onUserLogout();
    
    // 使用統一的清理函數
    cleanupUserLogout();
    
    showNotification('已成功登出', 'success');
    
    // 觸發跨頁面同步
    triggerLoginStateSync();
}

// 更新用戶界面狀�?
function updateUserInterface(userData) {
    const loginBtn = document.querySelector('.login-btn');
    const userMenu = document.querySelector('.user-menu');
    const avatarText = document.querySelector('.avatar-text');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userData && loginBtn && userMenu) {
        // 隱藏登入按鈕，顯示用戶菜�?
        loginBtn.style.display = 'none';
        userMenu.style.display = 'block';
        
        // 準備最終頭像來源：userData > localStorage > users資料�?
        let effectiveAvatarUrl = userData.avatarUrl || localStorage.getItem('userAvatar') || null;
        if (!effectiveAvatarUrl && userData.email) {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const dbUser = users.find(u => u.email === userData.email);
                if (dbUser && dbUser.avatarUrl) effectiveAvatarUrl = dbUser.avatarUrl;
            } catch (_) {}
        }

        // 更新頭像
        if (userAvatar) {
            if (effectiveAvatarUrl) {
                userAvatar.innerHTML = `<img src="${effectiveAvatarUrl}" alt="用戶頭像" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                const avatarLetter = userData.avatar || userData.username?.charAt(0).toUpperCase() || 'U';
                userAvatar.innerHTML = `<span class="avatar-text">${avatarLetter}</span>`;
            }
        }
        
        // 更新頭像文字（用於向後兼容）
        if (avatarText) {
            avatarText.textContent = userData.avatar || userData.username?.charAt(0).toUpperCase() || 'U';
        }
        
        // 存儲用戶信息
        safeSetLocalStorage('isLoggedIn', 'true');
        safeSetLocalStorage('userEmail', userData.email);
        safeSetLocalStorage('userName', userData.username);
        if (effectiveAvatarUrl && effectiveAvatarUrl.length < 1000) {
            safeSetLocalStorage('userAvatar', effectiveAvatarUrl);
        }

        // 重新綁定用戶菜單事件，確保點擊可�?
        try {
            initUserMenu();
        } catch (_) {}
    }
}

// 檢查登入狀態並更新UI
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');
    
    if (isLoggedIn && userEmail) {
        updateUserInterface({
            email: userEmail,
            username: userName,
            avatar: userName?.charAt(0).toUpperCase() || 'U',
            avatarUrl: userAvatar
        });
    }
}

// 添加收藏功能
function addToFavorites(productId, productName) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showNotification('請先登入才能收藏商品', 'warning');
        return;
    }
    
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const existing = favorites.find(item => item.id === productId);
    
    if (existing) {
        showNotification('商品已在收藏清單中', 'info');
    } else {
        favorites.push({
            id: productId,
            name: productName,
            addedAt: new Date().toISOString()
        });
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
        showNotification('已加入收藏', 'success');
    }
}

// 移除收藏
function removeFromFavorites(productId) {
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const updatedFavorites = favorites.filter(item => item.id !== productId);
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
    showNotification('已從收藏中移除', 'info');
    
    // 如果收藏頁面是打開的，重新載�?
    const favoritesModal = document.getElementById('favorites-modal');
    if (favoritesModal && favoritesModal.style.display === 'block') {
        showUserFavorites();
    }
}

// 保存用戶設定
function saveUserSettings() {
    const settings = {
        emailNotifications: document.getElementById('email-notifications').checked,
        pushNotifications: document.getElementById('push-notifications').checked,
        publicProfile: document.getElementById('public-profile').checked,
        showPurchaseHistory: document.getElementById('show-purchase-history').checked
    };
    
    if (safeSetLocalStorage('userSettings', JSON.stringify(settings))) {
        showNotification('設定已保存', 'success');
    } else {
        showNotification('設定保存失敗，請稍後再試', 'error');
    }
}

// 初始化設定按�?
function initSettingsButtons() {
    // 儲存設定按鈕
    const saveSettingsBtn = document.querySelector('.settings-actions .btn-primary');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveUserSettings);
    }
    
    // 刪除帳號按鈕
    const deleteAccountBtn = document.querySelector('.settings-actions .btn-danger');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('確定要刪除帳號嗎？此操作無法復原')) {
                // 清除所有用戶數據
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
                localStorage.removeItem('userOrders');
                localStorage.removeItem('userFavorites');
                localStorage.removeItem('userSettings');
                
                // 關閉模態框並重載頁面
                closeModal(document.getElementById('settings-modal'));
                showNotification('帳號已刪除', 'info');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        });
    }
}

// 初始化訂單篩選按�?
function initOrderFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有active�?
            filterBtns.forEach(b => b.classList.remove('active'));
            // 添加active類到當前按鈕
            btn.classList.add('active');
            
            const status = btn.getAttribute('data-status');
            filterOrders(status);
        });
    });
}

// 篩選訂單
function filterOrders(status) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('未登入用戶無法篩選訂單');
        return;
    }
    
    const userOrdersKey = `userOrders_${currentUser.id}`;
    const orders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
    let filteredOrders = orders;
    
    if (status !== 'all') {
        filteredOrders = orders.filter(order => 
            order.status.toLowerCase().includes(status) || 
            (status === 'pending' && order.status === '處理中') ||
            (status === 'completed' && order.status === '已完成') ||
            (status === 'cancelled' && order.status === '已取消')
        );
    }
    
    const ordersList = document.getElementById('orders-list');
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>沒有符合條件的訂�?/p>
            </div>
        `;
    } else {
        ordersList.innerHTML = filteredOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status completed">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `<div>�?${item.name}</div>`).join('')}
                </div>
                <div class="order-total">總計: NT$ ${order.total}</div>
                <div class="order-date">訂購日期: ${new Date(order.date).toLocaleDateString()}</div>
            </div>
        `).join('');
    }
}

// 初始化所有功�?
function initAllInteractions() {
    initNavigation();
    initProductInteractions();
    initSliderControls();
    initSearchFunctionality();
    initHeroButtons();
    initCheckoutFunctionality();
    initSocialLinks();
    initUserMenu(); // 添加用戶菜單初始�?
    initSettingsButtons(); // 初始化設定按�?
    initOrderFilters(); // 初始化訂單篩�?
    updateCartDisplay(); // 初始化購物車顯示
    checkLoginStatus(); // 檢查登入狀�?
}

// 頭像上傳功能
function uploadAvatar() {
    const fileInput = document.getElementById('avatar-upload');
    fileInput.click();
}

function removeAvatar() {
    const avatarImg = document.querySelector('.profile-avatar-img');
    const avatarText = document.querySelector('.profile-avatar-text');
    const removeBtn = document.getElementById('remove-avatar-btn');
    
    // 隱藏圖片，顯示文�?
    avatarImg.style.display = 'none';
    avatarText.style.display = 'flex';
    removeBtn.style.display = 'none';
    
    // 清除用戶頭像數據
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.avatarUrl = null;
        // 更新localStorage
        const storageKey = localStorage.getItem('currentUser') ? 'currentUser' : 'sessionStorage';
        if (storageKey === 'currentUser') {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // 更新導航欄頭像
        updateUserInterface(currentUser);
    }
    
    showNotification('頭像已移除', 'info');
}

// 初始化頭像上�?
function initAvatarUpload() {
    const fileInput = document.getElementById('avatar-upload');
    if (fileInput) {
        fileInput.addEventListener('change', handleAvatarUpload);
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
        showNotification('請選擇圖片文件', 'error');
        return;
    }
    
    // 檢查文件大小 (最�?MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('圖片大小不能超過2MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarImg = document.querySelector('.profile-avatar-img');
        const avatarText = document.querySelector('.profile-avatar-text');
        const removeBtn = document.getElementById('remove-avatar-btn');
        
        // 設置圖片
        avatarImg.src = e.target.result;
        avatarImg.style.display = 'block';
        avatarText.style.display = 'none';
        removeBtn.style.display = 'inline-block';
        
        // 保存到用戶數據
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUser.avatarUrl = e.target.result;
            // 更新localStorage
            const storageKey = localStorage.getItem('currentUser') ? 'currentUser' : 'sessionStorage';
            if (storageKey === 'currentUser') {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }

            // 同步保存儲users 資料庫，避免重新登入遺失
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const idx = users.findIndex(u => u.email === currentUser.email);
            if (idx !== -1) {
                users[idx].avatarUrl = currentUser.avatarUrl;
                localStorage.setItem('users', JSON.stringify(users));
            }
            // 也同步快捷�?
            localStorage.setItem('userAvatar', currentUser.avatarUrl);
            
            // 更新導航欄頭像
            updateUserInterface(currentUser);
        }
        
        showNotification('頭像更新成功', 'success');
    };
    
    reader.readAsDataURL(file);
}

// 更改密碼功能
function showChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 立即初始化表單，不使用setTimeout
        const form = document.getElementById('change-password-form');
        if (form) {
            // 初始化受控狀態容�?
            window.__changePwdState = { current: '', next: '', confirm: '' };
            // 獲取密碼字段但不清空（讓用戶自己輸入�?
            const currentPassword = document.getElementById('current-password');
            const newPassword = document.getElementById('new-password');
            const confirmPassword = document.getElementById('confirm-new-password');
            
            if (currentPassword) {
                // 不清空，只聚�?
                currentPassword.focus();
                console.log('聚焦到目前密碼字段');
            }
            
            // 確保表單事件監聽器正確綁�?
            form.onsubmit = function(e) {
                e.preventDefault();
                console.log('表單提交被觸發');
                handlePasswordChange(e);
                return false;
            };
            
            // 也為提交按鈕添加點擊事件
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.onclick = function(e) {
                    e.preventDefault();
                    console.log('提交按鈕被點擊');
                    
                    // 手動創建表單提交事件
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                    return false;
                };
            }
            
            console.log('密碼更改模態框已初始化');
            console.log('表單元素:', form);
            console.log('目前密碼字段:', currentPassword);
            console.log('提交按鈕:', submitBtn);
        }
    }
}

function initChangePasswordForm() {
    try {
        const form = document.getElementById('change-password-form');
        if (form) {
        console.log('更改密碼表單已找到並初始化');
        
        // 移除現有的事件監聽器（如果有的話�?
        form.removeEventListener('submit', handlePasswordChange);
        
        // 重新綁定提交事件
        form.addEventListener('submit', handlePasswordChange);
        
        // 添加輸入事件監聽器來調試
        const currentPasswordField = document.getElementById('current-password');
        const newPasswordField = document.getElementById('new-password');
        const confirmPasswordField = document.getElementById('confirm-new-password');
        
        if (currentPasswordField) {
            // 移除現有監聽器並重新添加
            currentPasswordField.removeEventListener('input', currentPasswordField._inputHandler);
            currentPasswordField._inputHandler = function() {
                console.log('目前密碼輸入:', this.value.length, '個字元');
                if (window.__changePwdState) window.__changePwdState.current = this.value;
            };
            currentPasswordField.addEventListener('input', currentPasswordField._inputHandler);
        }
        
        if (newPasswordField) {
            newPasswordField.removeEventListener('input', newPasswordField._inputHandler);
            newPasswordField._inputHandler = function() {
                console.log('新密碼輸入', this.value.length, '個字元');
                if (window.__changePwdState) window.__changePwdState.next = this.value;
            };
            newPasswordField.addEventListener('input', newPasswordField._inputHandler);
        }
        
        if (confirmPasswordField) {
            confirmPasswordField.removeEventListener('input', confirmPasswordField._inputHandler);
            confirmPasswordField._inputHandler = function() {
                console.log('確認密碼輸入:', this.value.length, '個字元');
                if (window.__changePwdState) window.__changePwdState.confirm = this.value;
            };
            confirmPasswordField.addEventListener('input', confirmPasswordField._inputHandler);
        }
    } else {
        console.log('密碼更改表單未找到，跳過初始化');
    }
    } catch (error) {
        console.log('initChangePasswordForm 錯誤，可能不在相關頁面:', error.message);
    }
}

// 添加測試函數
function testPasswordForm() {
    console.log('=== 測試密碼表單 ===');
    const form = document.getElementById('change-password-form');
    const currentPassword = document.getElementById('current-password');
    const newPassword = document.getElementById('new-password');
    const confirmPassword = document.getElementById('confirm-new-password');
    
    console.log('表單:', form);
    console.log('目前密碼字段:', currentPassword);
    console.log('新密碼字�?', newPassword);
    console.log('確認密碼字段:', confirmPassword);
    
    if (currentPassword) {
        console.log('目前密碼�?', `"${currentPassword.value}"`);
        console.log('目前密碼長度:', currentPassword.value.length);
    }
    
    if (newPassword) {
        console.log('新密碼�?', `"${newPassword.value}"`);
        console.log('新密碼長�?', newPassword.value.length);
    }
    
    if (confirmPassword) {
        console.log('確認密碼�?', `"${confirmPassword.value}"`);
        console.log('確認密碼長度:', confirmPassword.value.length);
    }
    
    console.log('==================');
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    console.log('=== 表單提交開始 ===');
    // 總是以實際表單元素為�?
    const formEl = (e.currentTarget && e.currentTarget.tagName === 'FORM') ? e.currentTarget : document.getElementById('change-password-form');
    console.log('使用的表單元�?', formEl);
    
    // 直接從表單獲取輸入框（避免外部清�?覆蓋�?
    // 1) 先從受控狀態讀值（若存在）
    const state = window.__changePwdState || {};
    
    // 2) 再從表單節點查�?
    const currentPasswordElement = formEl?.querySelector('#current-password');
    const newPasswordElement = formEl?.querySelector('#new-password');
    const confirmNewPasswordElement = formEl?.querySelector('#confirm-new-password');
    
    console.log('獲取到的元素:');
    console.log('- 目前密碼元素:', currentPasswordElement);
    console.log('- 新密碼元�?', newPasswordElement);
    console.log('- 確認密碼元素:', confirmNewPasswordElement);
    
    // 檢查元素是否存在
    if (!currentPasswordElement || !newPasswordElement || !confirmNewPasswordElement) {
        console.error('找不到密碼輸入字段');
        showNotification('表單錯誤，請重新載入頁面', 'error');
        return;
    }
    
    // 多種方式獲取密碼�?
    console.log('=== 多種方式獲取密碼�?===');
    
    // 方法1：直接從DOM獲取�?
    const currentPassword1 = (currentPasswordElement?.value ?? '').toString();
    const newPassword1 = (newPasswordElement?.value ?? '').toString();
    const confirmNewPassword1 = (confirmNewPasswordElement?.value ?? '').toString();
    
    console.log('方法1 - DOM直接獲取:');
    console.log('- 目前密碼:', `"${currentPassword1}"`);
    console.log('- 新密�?', `"${newPassword1}"`);
    console.log('- 確認密碼:', `"${confirmNewPassword1}"`);
    
    // 方法2：使用getAttribute獲取value
    const currentPassword2 = currentPasswordElement.getAttribute('value') || '';
    const newPassword2 = newPasswordElement.getAttribute('value') || '';
    const confirmNewPassword2 = confirmNewPasswordElement.getAttribute('value') || '';
    
    console.log('方法2 - getAttribute:');
    console.log('- 目前密碼:', `"${currentPassword2}"`);
    console.log('- 新密�?', `"${newPassword2}"`);
    console.log('- 確認密碼:', `"${confirmNewPassword2}"`);
    
    // 方法3：從FormData獲取值（以表單為準）
    const formData = formEl ? new FormData(formEl) : new FormData();
    const currentPassword3 = formData.get('currentPassword') || '';
    const newPassword3 = formData.get('newPassword') || '';
    const confirmNewPassword3 = formData.get('confirmNewPassword') || '';
    
    console.log('方法3 - FormData:');
    console.log('- 目前密碼:', `"${currentPassword3}"`);
    console.log('- 新密�?', `"${newPassword3}"`);
    console.log('- 確認密碼:', `"${confirmNewPassword3}"`);
    
    // 方法4：手動查詢所有密碼字�?
    const allPasswordFields = document.querySelectorAll('input[type="password"]');
    console.log('方法4 - 查詢所有密碼字�?');
    allPasswordFields.forEach((field, index) => {
        console.log(`- 密碼字段${index + 1} (${field.id}):`, `"${field.value}"`);
    });
    
    // 使用最有效的�?
    const currentFromFormEl = (formEl?.elements?.currentPassword?.value || state.current || '').trim();
    const newFromFormEl = (formEl?.elements?.newPassword?.value || state.next || '').trim();
    const confirmFromFormEl = (formEl?.elements?.confirmNewPassword?.value || state.confirm || '').trim();
    
    const currentPassword = currentFromFormEl || currentPassword1 || currentPassword2 || currentPassword3;
    const newPassword = newFromFormEl || newPassword1 || newPassword2 || newPassword3;
    const confirmNewPassword = confirmFromFormEl || confirmNewPassword1 || confirmNewPassword2 || confirmNewPassword3;
    
    console.log('從元素獲取的�?');
    console.log('- 目前密碼:', `"${currentPassword}" (長度: ${currentPassword.length})`);
    console.log('- 新密�?', `"${newPassword}" (長度: ${newPassword.length})`);
    console.log('- 確認密碼:', `"${confirmNewPassword}" (長度: ${confirmNewPassword.length})`);
    
    console.log('從FormData獲取的�?');
    console.log('- 目前密碼:', `"${currentPassword3}" (長度: ${currentPassword3.length})`);
    console.log('- 新密�?', `"${newPassword3}" (長度: ${newPassword3.length})`);
    console.log('- 確認密碼:', `"${confirmNewPassword3}" (長度: ${confirmNewPassword3.length})`);
    
    // 使用有值的版本
    const finalCurrentPassword = (currentFromFormEl || currentPassword || currentPassword3).trim();
    const finalNewPassword = (newFromFormEl || newPassword || newPassword3).trim();
    const finalConfirmPassword = (confirmFromFormEl || confirmNewPassword || confirmNewPassword3).trim();
    
    console.log('最終使用的密碼�?');
    console.log('- 目前密碼:', `"${finalCurrentPassword}" (長度: ${finalCurrentPassword.length})`);
    console.log('- 新密�?', `"${finalNewPassword}" (長度: ${finalNewPassword.length})`);
    console.log('- 確認密碼:', `"${finalConfirmPassword}" (長度: ${finalConfirmPassword.length})`);
    
    // 驗證表單 - 使用最終確定的�?
    if (!finalCurrentPassword || finalCurrentPassword.length === 0) {
        console.log('目前密碼為空');
        showNotification('請輸入目前密碼', 'error');
        currentPasswordElement.focus();
        return;
    }
    
    if (!finalNewPassword || finalNewPassword.length === 0) {
        console.log('新密碼為空');
        showNotification('請輸入新密碼', 'error');
        newPasswordElement.focus();
        return;
    }
    
    if (!finalConfirmPassword || finalConfirmPassword.length === 0) {
        console.log('確認密碼為空');
        showNotification('請確認新密碼', 'error');
        confirmNewPasswordElement.focus();
        return;
    }
    
    if (finalNewPassword !== finalConfirmPassword) {
        showNotification('新密碼確認不匹配', 'error');
        return;
    }
    
    if (finalNewPassword.length < 8) {
        showNotification(`新密碼長度至少需�?個字符，目前�?{finalNewPassword.length}個字符`, 'error');
        return;
    }
    
    // 檢查密碼強度 - 放寬要求，只需要包含字母或數字即可
    if (!/(?=.*[a-zA-Z])|(?=.*\d)/.test(finalNewPassword)) {
        showNotification('密碼必須包含字母或數字', 'error');
        return;
    }
    
    const currentUser = getCurrentUser();
    console.log('當前用戶:', currentUser);
    
    if (!currentUser) {
        showNotification('請先登入', 'error');
        return;
    }
    
    try {
        // 顯示載入狀�?
        const submitBtn = formEl?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('loading');
        }
        
        // 驗證當前密碼
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === currentUser.email);
        
        console.log('找到的用�?', user);
        console.log('輸入的當前密�?', finalCurrentPassword);
        console.log('數據庫中的密�?', user?.password);
        console.log('密碼比較結果:', user?.password === finalCurrentPassword);
        
        if (!user) {
            console.log('錯誤：找不到用戶資料');
            throw new Error('找不到用戶資料');
        }
        
        if (user.password !== finalCurrentPassword) {
            console.log('錯誤：目前密碼不匹配');
            console.log('期望密碼:', user.password);
            console.log('輸入密碼:', finalCurrentPassword);
            console.log('密碼類型比較:', typeof user.password, typeof finalCurrentPassword);
            throw new Error('目前密碼錯誤');
        }
        
        console.log('目前密碼驗證通過');
        
        // 檢查新密碼是否與當前密碼相同
        if (user.password === finalNewPassword) {
            throw new Error('新密碼不能與目前密碼相同');
        }
        
        // 模擬API延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 更新密碼
        user.password = finalNewPassword;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('密碼更新成功');
        
        // 成功
        showNotification('密碼更新成功', 'success');
        closeModal(document.getElementById('change-password-modal'));
        formEl?.reset();
        
    } catch (error) {
        console.error('密碼更改錯誤:', error);
        showNotification(error.message, 'error');
    } finally {
        const submitBtn = formEl?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
        }
    }
}

// 收藏功能
function toggleFavorite(productId, productName, productPrice) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showNotification('請先登入才能收藏商品', 'warning');
        return;
    }
    
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const existingIndex = favorites.findIndex(item => item.id === productId);
    const favoriteBtn = document.querySelector(`[onclick*="${productId}"]`);
    const heartIcon = favoriteBtn.querySelector('i');
    
    if (existingIndex > -1) {
        // 移除收藏
        favorites.splice(existingIndex, 1);
        favoriteBtn.classList.remove('favorited');
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        showNotification('已取消收藏', 'info');
    } else {
        // 添加收藏
        favorites.push({
            id: productId,
            name: productName,
            price: productPrice,
            addedAt: new Date().toISOString()
        });
        favoriteBtn.classList.add('favorited');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        showNotification('已加入收藏', 'success');
    }
    
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
    
    // 如果收藏頁面是打開的，重新載�?
    const favoritesModal = document.getElementById('favorites-modal');
    if (favoritesModal && favoritesModal.style.display === 'block') {
        showUserFavorites();
    }
}

// 初始化收藏按鈕狀�?
function initFavoriteButtons() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        
        // 更新所有收藏按鈕狀�?
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick) {
                const productId = onclick.match(/'([^']+)'/)[1];
                const isFavorited = favorites.some(item => item.id === productId);
                const heartIcon = btn.querySelector('i');
                
                if (isFavorited) {
                    btn.classList.add('favorited');
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                } else {
                    btn.classList.remove('favorited');
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                }
            }
        });
    }
}

// 個人資料編輯功能
function enableProfileEdit() {
    const usernameInput = document.getElementById('profile-username');
    const editBtn = document.querySelector('.profile-actions .btn-primary');
    
    if (usernameInput.hasAttribute('readonly')) {
        // 啟用編輯模式
        usernameInput.removeAttribute('readonly');
        usernameInput.style.background = 'white';
        usernameInput.focus();
        editBtn.textContent = '保存資料';
        editBtn.onclick = saveProfileData;
    }
}

function saveProfileData() {
    const usernameInput = document.getElementById('profile-username');
    const newUsername = usernameInput.value.trim();
    
    if (newUsername.length < 3) {
        showNotification('使用者名稱至少需要3個字元', 'error');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        // 更新用戶數據
        currentUser.username = newUsername;
        
        // 更新localStorage
        const storageKey = localStorage.getItem('currentUser') ? 'currentUser' : 'sessionStorage';
        if (storageKey === 'currentUser') {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // 更新users數組
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex > -1) {
            users[userIndex].username = newUsername;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // 更新界面
        updateUserInterface(currentUser);
        localStorage.setItem('userName', newUsername);
        
        showNotification('個人資料更新成功', 'success');
    }
    
    // 退出編輯模�?
    usernameInput.setAttribute('readonly', true);
    usernameInput.style.background = '#f8f9fa';
    const editBtn = document.querySelector('.profile-actions .btn-primary');
    editBtn.textContent = '編輯資料';
    editBtn.onclick = enableProfileEdit;
}

// 手動測試密碼更改的函數
function manualPasswordTest() {
    console.log('=== 手動密碼測試 ===');
    
    const currentPassword = prompt('請輸入目前密碼');
    const newPassword = prompt('請輸入新密碼:');
    const confirmPassword = prompt('請確認新密碼:');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        console.log('測試取消');
        return;
    }
    
    console.log('手動輸入的�?');
    console.log('目前密碼:', currentPassword);
    console.log('新密�?', newPassword);
    console.log('確認密碼:', confirmPassword);
    
    // 直接調用驗證邏輯
    const currentUser = getCurrentUser();
    console.log('當前用戶:', currentUser);
    
    if (!currentUser) {
        console.log('沒有登入用戶');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === currentUser.email);
    
    console.log('找到的用�?', user);
    console.log('數據庫密�?', user?.password);
    console.log('輸入的目前密�?', currentPassword);
    console.log('密碼是否匹配:', user?.password === currentPassword);
    
    if (user && user.password === currentPassword && newPassword === confirmPassword && newPassword.length >= 8) {
        user.password = newPassword;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        console.log('密碼更新成功');
        showNotification('密碼更新成功', 'success');
    } else {
        console.log('密碼更新失敗');
        if (!user) console.log('原因: 找不到用戶');
        else if (user.password !== currentPassword) console.log('原因: 目前密碼錯誤');
        else if (newPassword !== confirmPassword) console.log('原因: 新密碼確認不匹配');
        else if (newPassword.length < 8) console.log('原因: 新密碼長度不足');
    }
}

// 創建一個使用虛擬鍵盤的密碼更改界面
function createKeyboardPasswordChanger() {
    // 移除現有的模態框
    const existingModal = document.getElementById('keyboard-password-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 創建虛擬鍵盤密碼輸入界面
    const modalHTML = `
        <div id="keyboard-password-modal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
            align-items: center; justify-content: center; overflow-y: auto;
        ">
            <div style="
                background: white; padding: 20px; border-radius: 10px; 
                width: 500px; max-width: 95%; max-height: 90vh; overflow-y: auto;
            ">
                <h3 style="margin-bottom: 20px; text-align: center;">更改密碼 - 虛擬鍵盤</h3>
                
                <!-- 當前輸入狀�?-->
                <div id="current-input-step" style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #007bff;">
                    請輸入目前密碼
                </div>
                
                <!-- 密碼顯示區 -->
                <div style="margin-bottom: 15px;">
                    <div style="border: 2px solid #007bff; padding: 15px; border-radius: 5px; background: #f8f9fa; min-height: 40px; text-align: center; font-family: monospace; font-size: 18px; letter-spacing: 2px;" id="password-display">
                        點擊下方按鍵輸入密碼
                    </div>
                </div>
                
                <!-- 虛擬鍵盤 -->
                <div style="margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; margin-bottom: 10px;">
                        <button onclick="addChar('1')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">1</button>
                        <button onclick="addChar('2')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">2</button>
                        <button onclick="addChar('3')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">3</button>
                        <button onclick="addChar('4')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">4</button>
                        <button onclick="addChar('5')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">5</button>
                        <button onclick="addChar('6')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">6</button>
                        <button onclick="addChar('7')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">7</button>
                        <button onclick="addChar('8')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">8</button>
                        <button onclick="addChar('9')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">9</button>
                        <button onclick="addChar('0')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">0</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; margin-bottom: 10px;">
                        <button onclick="addChar('q')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">q</button>
                        <button onclick="addChar('w')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">w</button>
                        <button onclick="addChar('e')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">e</button>
                        <button onclick="addChar('r')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">r</button>
                        <button onclick="addChar('t')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">t</button>
                        <button onclick="addChar('y')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">y</button>
                        <button onclick="addChar('u')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">u</button>
                        <button onclick="addChar('i')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">i</button>
                        <button onclick="addChar('o')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">o</button>
                        <button onclick="addChar('p')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">p</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 5px; margin-bottom: 10px;">
                        <button onclick="addChar('a')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">a</button>
                        <button onclick="addChar('s')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">s</button>
                        <button onclick="addChar('d')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">d</button>
                        <button onclick="addChar('f')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">f</button>
                        <button onclick="addChar('g')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">g</button>
                        <button onclick="addChar('h')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">h</button>
                        <button onclick="addChar('j')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">j</button>
                        <button onclick="addChar('k')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">k</button>
                        <button onclick="addChar('l')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">l</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 15px;">
                        <button onclick="addChar('z')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">z</button>
                        <button onclick="addChar('x')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">x</button>
                        <button onclick="addChar('c')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">c</button>
                        <button onclick="addChar('v')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">v</button>
                        <button onclick="addChar('b')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">b</button>
                        <button onclick="addChar('n')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">n</button>
                        <button onclick="addChar('m')" style="padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer;">m</button>
                    </div>
                </div>
                
                <!-- 控制按鈕 -->
                <div style="text-align: center; margin-bottom: 15px;">
                    <button onclick="deleteChar()" style="background: #dc3545; color: white; padding: 10px 15px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">刪除</button>
                    <button onclick="clearAll()" style="background: #ffc107; color: black; padding: 10px 15px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">清空</button>
                    <button onclick="nextStep()" style="background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">下一致/button>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="closeKeyboardPasswordModal()" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">取消</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 初始化密碼輸入狀�?
    window.passwordInputState = {
        step: 1, // 1=目前密碼, 2=新密�? 3=確認密碼
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        currentInput: ''
    };
    
    updatePasswordDisplay();
}

// 舊接口別名：保持與先前說明一致，避免 ReferenceError
function createSimplePasswordChanger() {
    return createKeyboardPasswordChanger();
}

function handleSimplePasswordChange() {
    const currentPwd = document.getElementById('simple-current-pwd').value;
    const newPwd = document.getElementById('simple-new-pwd').value;
    const confirmPwd = document.getElementById('simple-confirm-pwd').value;
    
    console.log('簡單密碼更改:');
    console.log('目前密碼:', currentPwd);
    console.log('新密�?', newPwd);
    console.log('確認密碼:', confirmPwd);
    
    // 驗證
    if (!currentPwd) {
        alert('請輸入目前密碼');
        return;
    }
    
    if (!newPwd || newPwd.length < 8) {
        alert('新密碼至少需要8個字元');
        return;
    }
    
    if (newPwd !== confirmPwd) {
        alert('新密碼確認不匹配');
        return;
    }
    
    // 更改密碼
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('請先登入');
        return;
    }
    
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user || user.password !== currentPwd) {
        alert('目前密碼錯誤');
        return;
    }
    
    // 更新密碼
    user.password = newPwd;
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('密碼更改成功');
    closeSimplePasswordModal();
}

function closeSimplePasswordModal() {
    const modal = document.getElementById('simple-password-modal');
    if (modal) {
        modal.remove();
    }
}

// 虛擬鍵盤控制函數
function addChar(char) {
    if (!window.passwordInputState) return;
    
    window.passwordInputState.currentInput += char;
    updatePasswordDisplay();
}

function deleteChar() {
    if (!window.passwordInputState) return;
    
    window.passwordInputState.currentInput = window.passwordInputState.currentInput.slice(0, -1);
    updatePasswordDisplay();
}

function clearAll() {
    if (!window.passwordInputState) return;
    
    window.passwordInputState.currentInput = '';
    updatePasswordDisplay();
}

function updatePasswordDisplay() {
    const display = document.getElementById('password-display');
    const stepIndicator = document.getElementById('current-input-step');
    
    if (!display || !stepIndicator || !window.passwordInputState) return;
    
    const state = window.passwordInputState;
    const maskedPassword = '●'.repeat(state.currentInput.length);
    
    // 更新顯示
    if (state.currentInput.length === 0) {
        display.textContent = '點擊下方按鍵輸入密碼';
        display.style.color = '#999';
    } else {
        display.textContent = maskedPassword;
        display.style.color = '#000';
    }
    
    // 更新步驟指示
    switch (state.step) {
        case 1:
            stepIndicator.textContent = '請輸入目前密碼(提示: justin20080907)';
            stepIndicator.style.color = '#007bff';
            break;
        case 2:
            stepIndicator.textContent = '請輸入新密碼 (至少8個字元';
            stepIndicator.style.color = '#28a745';
            break;
        case 3:
            stepIndicator.textContent = '請再次輸入新密碼確認';
            stepIndicator.style.color = '#ffc107';
            break;
    }
}

function nextStep() {
    if (!window.passwordInputState) return;
    
    const state = window.passwordInputState;
    
    if (state.currentInput.length === 0) {
        alert('請先輸入密碼');
        return;
    }
    
    switch (state.step) {
        case 1:
            // 保存目前密碼，進入新密碼輸�?
            state.currentPassword = state.currentInput;
            state.currentInput = '';
            state.step = 2;
            break;
            
        case 2:
            // 驗證新密碼長�?
            if (state.currentInput.length < 8) {
                alert('新密碼長度至少需要8個字元');
                return;
            }
            // 保存新密碼，進入確認密碼輸入
            state.newPassword = state.currentInput;
            state.currentInput = '';
            state.step = 3;
            break;
            
        case 3:
            // 確認密碼
            state.confirmPassword = state.currentInput;
            
            // 驗證密碼
            if (state.newPassword !== state.confirmPassword) {
                alert('兩次輸入的新密碼不一致，請重新輸入');
                state.currentInput = '';
                updatePasswordDisplay();
                return;
            }
            
            // 執行密碼更改
            executePasswordChange(state.currentPassword, state.newPassword);
            return;
    }
    
    updatePasswordDisplay();
}

function executePasswordChange(currentPwd, newPwd) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
        
        if (!currentUser) {
            alert('請先登入');
            return;
        }
        
        const user = users.find(u => u.email === currentUser.email);
        
        if (!user) {
            alert('找不到用戶資料');
            return;
        }
        
        console.log('密碼驗證:');
        console.log('輸入的密�?', currentPwd);
        console.log('數據庫密�?', user.password);
        console.log('密碼匹配:', user.password === currentPwd);
        
        if (user.password !== currentPwd) {
            alert('目前密碼錯誤\n正確密碼: ' + user.password);
            return;
        }
        
        // 更新密碼
        user.password = newPwd;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('🎉 密碼更改成功！\n新密�? ' + newPwd);
        console.log('密碼已從', currentPwd, '更改為', newPwd);
        
        closeKeyboardPasswordModal();
        
    } catch (error) {
        alert('更改密碼時發生錯�? ' + error.message);
        console.error('密碼更改錯誤:', error);
    }
}

function closeKeyboardPasswordModal() {
    const modal = document.getElementById('keyboard-password-modal');
    if (modal) {
        modal.remove();
    }
    window.passwordInputState = null;
}

// 創建測試用戶菜單功能的函數
window.testUserMenu = function() {
    console.log('=== 測試用戶菜單功能 ===');
    console.log('直接調用各個功�?..');
    
    // 測試個人資料
    console.log('測試個人資料功能...');
    try {
        showUserProfile();
        console.log('�?個人資料功能正常');
    } catch (error) {
        console.error('�?個人資料功能錯誤:', error);
    }
    
    setTimeout(() => {
        // 關閉個人資料模態�?
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) profileModal.style.display = 'none';
        
        // 測試訂單功能
        console.log('測試訂單功能...');
        try {
            showUserOrders();
            console.log('�?訂單功能正常');
        } catch (error) {
            console.error('�?訂單功能錯誤:', error);
        }
    }, 1000);
    
    setTimeout(() => {
        // 關閉訂單模態�?
        const ordersModal = document.getElementById('orders-modal');
        if (ordersModal) ordersModal.style.display = 'none';
        
        // 測試收藏功能
        console.log('測試收藏功能...');
        try {
            showUserFavorites();
            console.log('�?收藏功能正常');
        } catch (error) {
            console.error('�?收藏功能錯誤:', error);
        }
    }, 2000);
    
    setTimeout(() => {
        // 關閉收藏模態�?
        const favoritesModal = document.getElementById('favorites-modal');
        if (favoritesModal) favoritesModal.style.display = 'none';
        
        // 測試設定功能
        console.log('測試設定功能...');
        try {
            showUserSettings();
            console.log('�?設定功能正常');
        } catch (error) {
            console.error('�?設定功能錯誤:', error);
        }
    }, 3000);
    
    setTimeout(() => {
        // 關閉設定模態�?
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) settingsModal.style.display = 'none';
        
        console.log('=== 測試完成 ===');
    }, 4000);
};

// 快速打開各個功能的函數
window.openProfile = () => showUserProfile();
window.openOrders = () => showUserOrders();
window.openFavorites = () => showUserFavorites();
window.openSettings = () => showUserSettings();

// 使測試函數全局可用
window.testPasswordForm = testPasswordForm;
window.manualPasswordTest = manualPasswordTest;
window.createSimplePasswordChanger = createSimplePasswordChanger;
window.createKeyboardPasswordChanger = createKeyboardPasswordChanger;

// 在頁面加載完成後初始�?
document.addEventListener('DOMContentLoaded', function() {
    // 檢查當前頁面是否為管理面板
    const isAdminPage = window.location.pathname.includes('admin') || 
                       document.body.classList.contains('admin-page') ||
                       document.querySelector('.admin-container') !== null;
    
    // 只在非管理面板頁面執行用戶功能
    if (!isAdminPage) {
        initAllInteractions();
        initAvatarUpload();
        initChangePasswordForm();
    } else {
        console.log('管理面板頁面，跳過用戶功能初始化');
    }
    
    // 初始化購物車顯示
    setTimeout(() => {
        updateCartDisplay();
        console.log('頁面加載完成，已初始化購物車顯示');
    }, 100);
    
    // 監聽購物車更新事件
    window.addEventListener('cartUpdated', function(event) {
        console.log('🔔 購物車更新事件', event.detail);
        // 可以在這裡添加額外的UI 更新邏輯
        fixCartDisplay();
    });
    
    // 清除舊的測試數據
    clearOldTestData();
    initFavoriteButtons();
});

// ===== PAYMENT SYSTEM =====
class PaymentManager {
    constructor() {
        this.storageKey = 'acc_shop_payment_methods';
        this.historyKey = 'acc_shop_payment_history';
        this.init();
    }
    
    init() {
        console.log('💳 付款系統初始化');
        this.initPaymentTypeSelector();
        this.loadPaymentSettings();
    }
    
    // 初始化付款方式選擇器
    initPaymentTypeSelector() {
        const paymentTypeBtns = document.querySelectorAll('.payment-type-btn');
        const paymentForms = document.querySelectorAll('.payment-form');
        
        paymentTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                
                // 更新按鈕狀�?
                paymentTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 顯示對應表單
                paymentForms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${type}-form`) {
                        form.classList.add('active');
                    }
                });
            });
        });
    }
    
    // 載入付款設定
    loadPaymentSettings() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const userSettingsKey = `${this.storageKey}_${currentUser.id}`;
        const settings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
        
        // 載入開關狀�?
        Object.keys(settings).forEach(key => {
            const checkbox = document.getElementById(`${key}-enabled`);
            if (checkbox) {
                checkbox.checked = settings[key] !== false;
            }
        });
    }
    
    // 儲存付款設定
    savePaymentSettings() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const userSettingsKey = `${this.storageKey}_${currentUser.id}`;
        const settings = {};
        
        // 獲取所有開關狀�?
        const checkboxes = document.querySelectorAll('[id$="-enabled"]');
        checkboxes.forEach(checkbox => {
            const methodName = checkbox.id.replace('-enabled', '');
            settings[methodName] = checkbox.checked;
        });
        
        localStorage.setItem(userSettingsKey, JSON.stringify(settings));
        console.log('💾 付款設定已儲�?', settings);
    }
    
    // 獲取可用的付款方�?
    getAvailablePaymentMethods() {
        const currentUser = getCurrentUser();
        if (!currentUser) return [];
        
        const userSettingsKey = `${this.storageKey}_${currentUser.id}`;
        const settings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
        
        const methods = [
            { id: 'credit-card', name: '信用卡/金融卡', icon: 'fab fa-cc-visa', enabled: settings['credit-card'] !== false },
            { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal', enabled: settings['paypal'] !== false },
            { id: 'mobile-pay', name: '行動支付', icon: 'fas fa-mobile-alt', enabled: settings['mobile-pay'] !== false },
            { id: 'crypto', name: '加密貨幣', icon: 'fas fa-coins', enabled: settings['crypto'] === true },
            { id: 'bank-transfer', name: '銀行轉帳', icon: 'fas fa-university', enabled: settings['bank-transfer'] !== false }
        ];
        
        return methods.filter(method => method.enabled);
    }
    
    // 新增付款記錄
    addPaymentRecord(record) {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const userHistoryKey = `${this.historyKey}_${currentUser.id}`;
        const history = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        
        const paymentRecord = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            amount: record.amount,
            method: record.method,
            methodName: record.methodName,
            description: record.description,
            status: record.status || 'success',
            transactionId: this.generateTransactionId(),
            ...record
        };
        
        history.unshift(paymentRecord);
        
        // 只保留最�?00筆記�?
        if (history.length > 100) {
            history.splice(100);
        }
        
        localStorage.setItem(userHistoryKey, JSON.stringify(history));
        console.log('📝 新增付款記錄:', paymentRecord);
        
        return paymentRecord;
    }
    
    // 更新付款記錄狀�?
    updatePaymentRecordStatus(recordId, newStatus) {
        const currentUser = getCurrentUser();
        if (!currentUser) return false;
        
        const userHistoryKey = `${this.historyKey}_${currentUser.id}`;
        const history = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        
        const recordIndex = history.findIndex(record => record.id === recordId);
        if (recordIndex !== -1) {
            history[recordIndex].status = newStatus;
            history[recordIndex].updatedAt = new Date().toISOString();
            
            localStorage.setItem(userHistoryKey, JSON.stringify(history));
            console.log(`📝 更新付款記錄狀�? ${recordId} -> ${newStatus}`);
            
            return true;
        }
        
        return false;
    }
    
    // 獲取付款記錄
    getPaymentHistory(filter = 'all', month = null) {
        const currentUser = getCurrentUser();
        if (!currentUser) return [];
        
        const userHistoryKey = `${this.historyKey}_${currentUser.id}`;
        let history = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        
        // 狀態篩�?
        if (filter !== 'all') {
            history = history.filter(record => record.status === filter);
        }
        
        // 月份篩選
        if (month) {
            const [year, monthNum] = month.split('-');
            history = history.filter(record => {
                const recordDate = new Date(record.timestamp);
                return recordDate.getFullYear() == year && 
                       (recordDate.getMonth() + 1) == monthNum;
            });
        }
        
        return history;
    }
    
    // 計算付款統計
    getPaymentStats() {
        const currentUser = getCurrentUser();
        if (!currentUser) return { monthlyTotal: 0, totalSpent: 0 };
        
        const userHistoryKey = `${this.historyKey}_${currentUser.id}`;
        const history = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        const monthlyRecords = history.filter(record => {
            const recordDate = new Date(record.timestamp);
            const recordMonth = recordDate.getFullYear() + '-' + String(recordDate.getMonth() + 1).padStart(2, '0');
            return recordMonth === currentMonth && record.status === 'success';
        });
        
        const successfulRecords = history.filter(record => record.status === 'success');
        
        const monthlyTotal = monthlyRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
        const totalSpent = successfulRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
        
        return { monthlyTotal, totalSpent };
    }
    
    // 生成交易ID
    generateTransactionId() {
        return 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    // 驗證信用卡號
    validateCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;
        
        // Luhn 算法驗證
        let sum = 0;
        let isEven = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i));
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    
    // 格式化信用卡�?
    formatCardNumber(value) {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
        return formatted;
    }
    
    // 格式化有效期�?
    formatExpiry(value) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substr(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substr(2, 2) : '');
        }
        return cleaned;
    }
}

// 創建全局付款管理實例
const paymentManager = new PaymentManager();

// 打開付款方式 modal
function openPaymentMethodModal() {
    document.getElementById('payment-method-modal').style.display = 'block';
}

// 打開付款記錄 modal
function openPaymentHistoryModal() {
    document.getElementById('payment-history-modal').style.display = 'block';
    loadPaymentHistory();
}

// 儲存付款方式
function savePaymentMethod() {
    const activeForm = document.querySelector('.payment-form.active');
    const formType = activeForm.id.replace('-form', '');
    
    console.log('💳 儲存付款方式:', formType);
    
    // 根據表單類型進行驗證和儲�?
    switch (formType) {
        case 'credit-card':
            if (validateCreditCardForm()) {
                saveCreditCardMethod();
            }
            break;
        case 'paypal':
            savePayPalMethod();
            break;
        case 'bank':
            if (validateBankForm()) {
                saveBankMethod();
            }
            break;
        case 'crypto':
            if (validateCryptoForm()) {
                saveCryptoMethod();
            }
            break;
    }
}

// 驗證信用卡表�?
function validateCreditCardForm() {
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('card-expiry').value;
    const cvv = document.getElementById('card-cvv').value;
    const name = document.getElementById('card-name').value;
    
    if (!paymentManager.validateCardNumber(cardNumber)) {
        showNotification('請輸入有效的信用卡號', 'error');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        showNotification('請輸入有效的有效期限 (MM/YY)', 'error');
        return false;
    }
    
    if (!/^\d{3,4}$/.test(cvv)) {
        showNotification('請輸入有效的安全碼', 'error');
        return false;
    }
    
    if (!name.trim()) {
        showNotification('請輸入持卡人姓名', 'error');
        return false;
    }
    
    return true;
}

// 儲存信用卡方�?
function saveCreditCardMethod() {
    showNotification('信用卡付款方式已新增', 'success');
    closeModal(document.getElementById('payment-method-modal'));
    
    // 清空表單
    document.getElementById('credit-card-form').reset();
}

// 儲存 PayPal 方式
function savePayPalMethod() {
    showNotification('PayPal 連結已建立', 'success');
    closeModal(document.getElementById('payment-method-modal'));
}

// 驗證銀行表�?
function validateBankForm() {
    const bankName = document.getElementById('bank-name').value;
    const accountNumber = document.getElementById('account-number').value;
    const accountHolder = document.getElementById('account-holder').value;
    
    if (!bankName) {
        showNotification('請選擇銀行', 'error');
        return false;
    }
    
    if (!accountNumber.trim()) {
        showNotification('請輸入銀行帳號', 'error');
        return false;
    }
    
    if (!accountHolder.trim()) {
        showNotification('請輸入戶名', 'error');
        return false;
    }
    
    return true;
}

// 儲存銀行方�?
function saveBankMethod() {
    showNotification('銀行帳戶已新增', 'success');
    closeModal(document.getElementById('payment-method-modal'));
    
    // 清空表單
    document.getElementById('bank-form').reset();
}

// 驗證加密貨幣表單
function validateCryptoForm() {
    const cryptoType = document.getElementById('crypto-type').value;
    const walletAddress = document.getElementById('wallet-address').value;
    
    if (!cryptoType) {
        showNotification('請選擇幣種', 'error');
        return false;
    }
    
    if (!walletAddress.trim()) {
        showNotification('請輸入錢包地址', 'error');
        return false;
    }
    
    // 簡單的錢包地址格式驗證
    if (cryptoType === 'BTC' && !/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(walletAddress)) {
        showNotification('請輸入有效的 Bitcoin 地址', 'error');
        return false;
    }
    
    return true;
}

// 儲存加密貨幣方式
function saveCryptoMethod() {
    showNotification('加密貨幣錢包已新增', 'success');
    closeModal(document.getElementById('payment-method-modal'));
    
    // 清空表單
    document.getElementById('crypto-form').reset();
}

// 載入付款記錄
function loadPaymentHistory() {
    const filter = document.getElementById('history-filter').value;
    const month = document.getElementById('history-month').value;
    
    const history = paymentManager.getPaymentHistory(filter, month);
    const historyList = document.getElementById('payment-history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <i class="fas fa-receipt" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p>沒有找到付款記錄</p>
            </div>
        `;
    } else {
        historyList.innerHTML = history.map(record => `
            <div class="payment-history-item">
                <div class="payment-info-left">
                    <div class="payment-method-icon ${record.method}">
                        <i class="${getPaymentMethodIcon(record.method)}"></i>
                    </div>
                    <div class="payment-transaction-details">
                        <h5>${record.description}</h5>
                        <p>${formatDate(record.timestamp)} �?${record.transactionId}</p>
                    </div>
                </div>
                <div class="payment-info-right">
                    <div class="payment-amount">NT$ ${record.amount.toLocaleString()}</div>
                    <span class="payment-status ${record.status}">${getStatusText(record.status)}</span>
                </div>
            </div>
        `).join('');
    }
    
    // 更新統計
    updatePaymentStats();
}

// 篩選付款記錄
function filterPaymentHistory() {
    loadPaymentHistory();
}

// 更新付款統計
function updatePaymentStats() {
    const stats = paymentManager.getPaymentStats();
    
    document.getElementById('monthly-total').textContent = `NT$ ${stats.monthlyTotal.toLocaleString()}`;
    document.getElementById('total-spent').textContent = `NT$ ${stats.totalSpent.toLocaleString()}`;
}

// 輔助函數
function getPaymentMethodIcon(method) {
    const icons = {
        'credit-card': 'fas fa-credit-card',
        'paypal': 'fab fa-paypal',
        'bank': 'fas fa-university',
        'crypto': 'fas fa-coins',
        'mobile-pay': 'fas fa-mobile-alt'
    };
    return icons[method] || 'fas fa-credit-card';
}

function getStatusText(status) {
    const texts = {
        'success': '成功',
        'pending': '處理中',
        'failed': '失敗'
    };
    return texts[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW') + ' ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

// 輸入格式化事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 信用卡號格式�?
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            e.target.value = paymentManager.formatCardNumber(e.target.value);
        });
    }
    
    // 有效期限格式�?
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            e.target.value = paymentManager.formatExpiry(e.target.value);
        });
    }
    
    // CVV 只允許數據
    const cardCvvInput = document.getElementById('card-cvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // 付款設定變更監聽
    const paymentCheckboxes = document.querySelectorAll('[id$="-enabled"]');
    paymentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            paymentManager.savePaymentSettings();
        });
    });
});

console.log('ACC.SHOP website loaded successfully! 🚀');
console.log('可用的功能測試方�?');
console.log('=== 密碼更改 ===');
console.log('- quickPasswordChange() : 超簡單密碼更新(推薦)');
console.log('- createKeyboardPasswordChanger() : 虛擬鍵盤密碼更改');
console.log('=== 用戶菜單測試 ===');
console.log('- testUserMenu() : 測試所有用戶菜單功能');
console.log('=== 付款系統測試 ===');
console.log('- testPaymentSystem() : 測試付款系統功能');
console.log('- addTestPaymentHistory() : 添加測試付款記錄');
console.log('- getPaymentMethods() : 查看可用付款方式');
console.log('- getPaymentStats() : 查看付款統計');
console.log('=== LINE Pay 測試 ===');
console.log('- testLinePayFlow() : 測試完整 LINE Pay 流程');
console.log('- openLinePayPayment() : 直接打開 LINE Pay 付款');

// 付款系統測試函數
window.testPaymentSystem = function() {
    console.log('🧪 測試付款系統...');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('�?請先登入');
        return;
    }
    
    console.log('�?當前用戶:', currentUser.email);
    console.log('💳 可用付款方式:', paymentManager.getAvailablePaymentMethods());
    console.log('📊 付款統計:', paymentManager.getPaymentStats());
    console.log('📝 付款記錄數量:', paymentManager.getPaymentHistory().length);
    
    // 測試信用卡驗�?
    console.log('🔐 測試信用卡驗�?');
    console.log('有效卡號 (4532123456789012):', paymentManager.validateCardNumber('4532123456789012'));
    console.log('無效卡號 (1234567890123456):', paymentManager.validateCardNumber('1234567890123456'));
    
    // 測試格式�?
    console.log('📝 測試格式�?');
    console.log('卡號格式�?', paymentManager.formatCardNumber('4532123456789012'));
    console.log('日期格式�?', paymentManager.formatExpiry('1225'));
};

window.addTestPaymentHistory = function() {
    console.log('📝 添加測試付款記錄...');
    
    const testRecords = [
        {
            amount: 599,
            method: 'credit-card',
            methodName: '信用卡',
            description: 'LOL 鑽石段位帳號',
            status: 'success'
        },
        {
            amount: 799,
            method: 'paypal',
            methodName: 'PayPal',
            description: 'Valorant 白金帳號',
            status: 'success'
        },
        {
            amount: 299,
            method: 'bank',
            methodName: '銀行轉帳',
            description: 'CS2 黃金帳號',
            status: 'pending'
        },
        {
            amount: 1299,
            method: 'crypto',
            methodName: 'Bitcoin',
            description: 'Apex Legends 掠奪者帳號',
            status: 'success'
        },
        {
            amount: 199,
            method: 'mobile-pay',
            methodName: 'LINE Pay',
            description: 'Minecraft 伺服器會員',
            status: 'failed'
        }
    ];
    
    testRecords.forEach((record, index) => {
        setTimeout(() => {
            paymentManager.addPaymentRecord(record);
            console.log(`�?已添加測試記�?${index + 1}:`, record.description);
        }, index * 200);
    });
    
    setTimeout(() => {
        console.log('🎉 測試付款記錄添加完成');
        console.log('📊 新的付款統計:', paymentManager.getPaymentStats());
    }, testRecords.length * 200 + 500);
};

window.getPaymentMethods = function() {
    const methods = paymentManager.getAvailablePaymentMethods();
    console.log('💳 可用付款方式:', methods);
    return methods;
};

window.getPaymentStats = function() {
    const stats = paymentManager.getPaymentStats();
    console.log('📊 付款統計:', stats);
    return stats;
};

// LINE Pay 測試函數
window.testLinePayFlow = function() {
    console.log('🟢 測試 LINE Pay 完整流程...');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('�?請先登入');
        return;
    }
    
    // 添加測試商品到購物車
    cartManager.addItem('test-linepay-1', 'LINE Pay 測試商品', 99, 1);
    
    setTimeout(() => {
        console.log('🛒 已添加測試商品到購物車');
        console.log('💳 即將啟動 LINE Pay 付款...');
        
        // 3秒後自動啟動 LINE Pay
        setTimeout(() => {
            openLinePayPayment();
        }, 1000);
    }, 500);
};

// ===== PAYMENT SELECTION SYSTEM =====
class PaymentSelectionManager {
    constructor() {
        this.selectedMethod = null;
        this.currentOrder = null;
        this.init();
    }
    
    init() {
        // 關閉 modal 事件監聽�?
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                const modal = e.target.closest('.modal');
                if (modal && modal.id === 'payment-selection-modal') {
                    this.closePaymentSelection();
                }
            }
        });
    }
    
    // 開啟付款方式選擇
    openPaymentSelection(orderData) {
        console.log('🟢 開啟付款方式選擇:', orderData);
        
        this.currentOrder = orderData;
        
        // 開啟 modal
        const modal = document.getElementById('payment-selection-modal');
        modal.style.display = 'block';
        
        // 顯示訂單摘要
        this.displayOrderSummary(orderData);
        
        // 設定付款金額
        document.getElementById('payment-total-amount').textContent = `NT$ ${orderData.amount.toLocaleString()}`;
        
        // 初始化付款方式選�?
        this.initPaymentMethodSelection();
        
        return true;
    }
    
    // 初始化付款方式選�?
    initPaymentMethodSelection() {
        // 重置選擇狀�?
        this.selectedMethod = null;
        
        // 移除之前的事件監聽器
        const paymentOptions = document.querySelectorAll('.payment-method-option');
        paymentOptions.forEach(option => {
            option.replaceWith(option.cloneNode(true));
        });
        
        // 重新獲取並添加新的事件監聽器
        document.querySelectorAll('.payment-method-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectPaymentMethod(option.dataset.method);
            });
        });
        
        // 重置確認按鈕狀�?
        const confirmBtn = document.getElementById('confirm-payment-btn');
        confirmBtn.disabled = true;
        
        // 重置所有選項狀�?
        this.resetPaymentOptions();
    }
    
    // 重置付款選項狀�?
    resetPaymentOptions() {
        const paymentOptions = document.querySelectorAll('.payment-method-option');
        paymentOptions.forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    // 選擇付款方式
    selectPaymentMethod(method) {
        console.log('🎯 選擇付款方式:', method);
        
        this.selectedMethod = method;
        
        // 更新 UI 狀�?
        this.resetPaymentOptions();
        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        selectedOption.classList.add('selected');
        
        // 啟用確認按鈕
        const confirmBtn = document.getElementById('confirm-payment-btn');
        confirmBtn.disabled = false;
        
        // 更新按鈕文字
        const methodNames = {
            'credit-card': '信用卡',
            'mobile-pay': '行動支付',
            'bank-transfer': '銀行轉帳',
            'convenience-store': '超商付款',
            'bank-remittance': '銀行匯款',
            '8591': '8591寶物交易',
            'card-free': '無卡交易'
        };
        
        confirmBtn.innerHTML = `<i class="fas fa-lock"></i> 使用${methodNames[method]}付款`;
    }
    
    // 顯示訂單摘要
    displayOrderSummary(orderData) {
        const summaryContainer = document.getElementById('payment-order-summary');
        
        let summaryHTML = '';
        orderData.items.forEach(item => {
            summaryHTML += `
                <div class="order-item">
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">x ${item.quantity}</span>
                    </div>
                    <span class="item-price">NT$ ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `;
        });
        
        summaryContainer.innerHTML = summaryHTML;
    }
    
    // 確認付款
    async confirmPayment() {
        if (!this.selectedMethod || !this.currentOrder) {
            showNotification('請選擇付款方式', 'warning');
            return;
        }
        
        console.log('💳 確認付款:', this.selectedMethod);
        
        try {
            // 生成交易 ID
            const transactionId = this.generateTransactionId();
            
            // 獲取付款方式名稱
            const methodNames = {
                'credit-card': '信用卡',
                'mobile-pay': '行動支付',
                'bank-transfer': '銀行轉帳',
                'convenience-store': '超商付款'
            };
            
            // 記錄付款到歷�?- 狀態為待處理
            const paymentRecord = paymentManager.addPaymentRecord({
                amount: this.currentOrder.amount,
                method: this.selectedMethod,
                methodName: methodNames[this.selectedMethod],
                description: this.generateOrderDescription(),
                status: 'pending', // 所有付款都進入待處理狀�?
                transactionId: transactionId
            });
            
            // 清空購物�?
            cartManager.clearCart();
            
            // 關閉付款選擇 modal
            this.closePaymentSelection();
            
            // 顯示成功通知
            showNotification(`付款已提交，使用${methodNames[this.selectedMethod]}。訂單編號：${transactionId}`, 'success');
            
            console.log('付款已提交，進入待處理狀態');
            
            return true;
        } catch (error) {
            console.error('付款處理失敗:', error);
            showNotification('付款處理失敗，請稍後再試', 'error');
            return false;
        }
    }
    
    // 關閉付款選擇
    closePaymentSelection() {
        const modal = document.getElementById('payment-selection-modal');
        modal.style.display = 'none';
        
        // 重置狀�?
        this.selectedMethod = null;
        this.currentOrder = null;
        
        console.log('🚫 付款選擇 Modal 已關閉');
    }
    
    // 生成交易 ID
    generateTransactionId() {
        return 'PAY' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    // 生成訂單描述
    generateOrderDescription() {
        if (!this.currentOrder || !this.currentOrder.items) {
            return '網路購物';
        }
        
        const items = this.currentOrder.items;
        if (items.length === 1) {
            return items[0].name;
        } else {
            return `${items[0].name} �?${items.length} 件商品`;
        }
    }
}

// 創建全局付款選擇管理實例
const paymentSelectionManager = new PaymentSelectionManager();

// 全局函數：開啟付款方式選�?
function openPaymentSelection() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('請先登入後再進行付款', 'warning');
        return;
    }
    
    // 獲取購物車資�?
    const cartStats = cartManager.getCartStats();
    
    if (cartStats.isEmpty) {
        showNotification('購物車是空的', 'warning');
        return;
    }
    
    // 準備訂單資料
    const orderData = {
        amount: cartStats.total,
        items: cartStats.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    };
    
    // 開啟付款方式選擇
    paymentSelectionManager.openPaymentSelection(orderData);
}

// 全局函數：關閉付款選�?Modal
function closePaymentSelectionModal() {
    paymentSelectionManager.closePaymentSelection();
}

// 全局函數：確認付款方式
function confirmPaymentMethod() {
    const selectedMethod = paymentSelectionManager.selectedMethod;
    
    if (!selectedMethod) {
        showNotification('請選擇付款方式', 'warning');
        return;
    }
    
    // 關閉付款選擇模態框
    closePaymentSelectionModal();
    
    // 根據選擇的付款方式顯示相關資訊
    setTimeout(() => {
        showPaymentInfo(selectedMethod);
    }, 300);
}

// 修改結帳按鈕功能以使用新的付款選擇系統
document.addEventListener('DOMContentLoaded', function() {
    // 更新結帳按鈕事件
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            openPaymentSelection();
        });
    }
});

console.log('🎉 付款選擇系統已載入');

// ===== PAYMENT INFO DISPLAY FUNCTIONS =====

// 顯示付款相關資訊
function showPaymentInfo(method) {
    const orderData = paymentSelectionManager.currentOrder;
    const cartStats = cartManager.getCartStats();
    
    switch (method) {
        case 'bank-remittance':
            showBankRemittanceInfo(orderData, cartStats);
            break;
        case '8591':
            show8591Info(orderData, cartStats);
            break;
        case 'card-free':
            showCardFreeInfo(orderData, cartStats);
            break;
        case 'bank-transfer':
            showBankTransferInfo(orderData, cartStats);
            break;
        case 'convenience-store':
            showConvenienceStoreInfo(orderData, cartStats);
            break;
        case 'credit-card':
            showCreditCardInfo(orderData, cartStats);
            break;
        case 'mobile-pay':
            showMobilePayInfo(orderData, cartStats);
            break;
        default:
            showNotification('付款方式暫未開放', 'info');
    }
}

// 銀行匯款資訊
function showBankRemittanceInfo(orderData, cartStats) {
    const modal = createPaymentInfoModal('銀行匯款', `
        <div class="payment-info-content">
            <div class="order-summary-section">
                <h4>📋 訂單摘要</h4>
                <div class="order-items">
                    ${cartStats.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">x${item.quantity}</span>
                            <span class="item-price">$${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>總金額：$${cartStats.total}</strong>
                </div>
            </div>
            
            <div class="bank-info-section">
                <h4>🏦 匯款資訊</h4>
                <div class="bank-details">
                    <div class="bank-item">
                        <label>銀行名稱：</label>
                        <span>台新國際商業銀行</span>
                        <button class="copy-btn" onclick="copyToClipboard('台新國際商業銀行')">📋</button>
                    </div>
                    <div class="bank-item">
                        <label>銀行代碼：</label>
                        <span>812</span>
                        <button class="copy-btn" onclick="copyToClipboard('812')">📋</button>
                    </div>
                    <div class="bank-item">
                        <label>帳號：</label>
                        <span>2888-1234-5678-9012</span>
                        <button class="copy-btn" onclick="copyToClipboard('2888-1234-5678-9012')">📋</button>
                    </div>
                    <div class="bank-item">
                        <label>戶名：</label>
                        <span>遊戲帳號商城有限公司</span>
                        <button class="copy-btn" onclick="copyToClipboard('遊戲帳號商城有限公司')">📋</button>
                    </div>
                    <div class="bank-item highlight">
                        <label>匯款金額：</label>
                        <span>$${cartStats.total}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${cartStats.total}')">📋</button>
                    </div>
                </div>
                
                <div class="payment-notes">
                    <h5>⚠️ 重要提醒：</h5>
                    <ul>
                        <li>請於24小時內完成匯款，逾期訂單將自動取消</li>
                        <li>匯款完成後請保留匯款收據</li>
                        <li>匯款後請聯繫客服確認收款：LINE ID: @accshop</li>
                        <li>確認收款後1-3小時內完成交貨</li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// 8591交易資訊
function show8591Info(orderData, cartStats) {
    const modal = createPaymentInfoModal('8591寶物交易', `
        <div class="payment-info-content">
            <div class="order-summary-section">
                <h4>📋 訂單摘要</h4>
                <div class="order-items">
                    ${cartStats.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">x${item.quantity}</span>
                            <span class="item-price">$${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>總金額：$${cartStats.total}</strong>
                </div>
            </div>
            
            <div class="platform-info-section">
                <h4>🎮 8591交易流程</h4>
                <div class="trade-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h5>前往8591平台</h5>
                            <p>點擊下方連結前往我們的8591商店</p>
                            <a href="https://www.8591.com.tw/shop-12345" target="_blank" class="platform-link">
                                <i class="fas fa-external-link-alt"></i> 前往8591商店
                            </a>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h5>搜尋商品</h5>
                            <p>在商店中搜尋您要購買的商品：</p>
                            <div class="search-keywords">
                                ${cartStats.items.map(item => `<span class="keyword">${item.name}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h5>下單購買</h5>
                            <p>在8591平台下單並完成付款</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h5>等待交貨</h5>
                            <p>我們會在8591平台上為您交貨</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-notes">
                    <h5>💡 8591交易優勢：</h5>
                    <ul>
                        <li>平台擔保交易，安全有保障</li>
                        <li>多元付款方式：信用卡、ATM、超商付款</li>
                        <li>24小時客服支援</li>
                        <li>快速交貨，通常1小時內完成</li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// 無卡交易資訊
function showCardFreeInfo(orderData, cartStats) {
    const modal = createPaymentInfoModal('無卡交易', `
        <div class="payment-info-content">
            <div class="order-summary-section">
                <h4>📋 訂單摘要</h4>
                <div class="order-items">
                    ${cartStats.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">x${item.quantity}</span>
                            <span class="item-price">$${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>總金額：$${cartStats.total}</strong>
                </div>
            </div>
            
            <div class="cardless-info-section">
                <h4>📱 無卡交易流程</h4>
                <div class="cardless-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h5>選擇銀行</h5>
                            <p>選擇您要使用的銀行進行無卡交易</p>
                            <div class="bank-options">
                                <button class="bank-option" onclick="selectBank('台新銀行')">台新銀行</button>
                                <button class="bank-option" onclick="selectBank('中國信託')">中國信託</button>
                                <button class="bank-option" onclick="selectBank('國泰世華')">國泰世華</button>
                                <button class="bank-option" onclick="selectBank('玉山銀行')">玉山銀行</button>
                            </div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h5>手機認證</h5>
                            <p>使用手機號碼進行身分認證</p>
                            <div class="phone-input">
                                <input type="tel" placeholder="請輸入手機號碼" id="cardless-phone">
                                <button onclick="sendCardlessOTP()">發送驗證碼</button>
                            </div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h5>輸入驗證碼</h5>
                            <p>輸入手機收到的驗證碼</p>
                            <div class="otp-input">
                                <input type="text" placeholder="驗證碼" id="cardless-otp" maxlength="6">
                                <button onclick="verifyCardlessOTP()">確認</button>
                            </div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h5>完成付款</h5>
                            <p>確認交易資訊並完成付款</p>
                        </div>
                    </div>
                </div>
                
                <div class="payment-notes">
                    <h5>🔒 安全提醒：</h5>
                    <ul>
                        <li>請確保手機號碼與銀行留存資料一致</li>
                        <li>驗證碼有效期限為5分鐘</li>
                        <li>交易完成後會收到SMS確認通知</li>
                        <li>如有問題請聯繫客服：LINE ID: @accshop</li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// 其他付款方式的簡化版本
function showBankTransferInfo(orderData, cartStats) {
    showNotification('銀行轉帳功能開發中...', 'info');
}

function showConvenienceStoreInfo(orderData, cartStats) {
    showNotification('超商付款功能開發中...', 'info');
}

function showCreditCardInfo(orderData, cartStats) {
    showNotification('信用卡付款功能開發中...', 'info');
}

function showMobilePayInfo(orderData, cartStats) {
    showNotification('行動支付功能開發中...', 'info');
}

// 創建付款資訊模態框
function createPaymentInfoModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal payment-info-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePaymentInfoModal(this)"></div>
        <div class="modal-content payment-info-modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-credit-card"></i> ${title}</h3>
                <button class="modal-close" onclick="closePaymentInfoModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closePaymentInfoModal(this)">關閉</button>
                <button class="btn-primary" onclick="confirmPaymentComplete()">
                    <i class="fas fa-check"></i> 我已完成付款
                </button>
            </div>
        </div>
    `;
    return modal;
}

// 關閉付款資訊模態框
function closePaymentInfoModal(element) {
    const modal = element.closest('.payment-info-modal');
    if (modal) {
        modal.remove();
    }
}

// 確認付款完成
function confirmPaymentComplete() {
    showNotification('付款確認已送出，我們會盡快為您處理訂單！', 'success');
    // 清空購物車
    cartManager.clearCart();
    // 關閉所有模態框
    document.querySelectorAll('.payment-info-modal').forEach(modal => modal.remove());
    // 更新購物車顯示
    updateCartDisplay();
}

// 複製到剪貼簿
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`已複製：${text}`, 'success');
    }).catch(() => {
        // 舊版瀏覽器的備用方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(`已複製：${text}`, 'success');
    });
}

// 無卡交易相關函數
function selectBank(bankName) {
    document.querySelectorAll('.bank-option').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    showNotification(`已選擇：${bankName}`, 'info');
}

function sendCardlessOTP() {
    const phone = document.getElementById('cardless-phone').value;
    if (!phone) {
        showNotification('請輸入手機號碼', 'error');
        return;
    }
    showNotification('驗證碼已發送至您的手機', 'success');
}

function verifyCardlessOTP() {
    const otp = document.getElementById('cardless-otp').value;
    if (!otp || otp.length !== 6) {
        showNotification('請輸入6位數驗證碼', 'error');
        return;
    }
    showNotification('驗證成功！', 'success');
}

// ===== CROSS-PAGE SYNC FUNCTIONS =====
// 初始化跨頁面登入狀態同步
function initCrossPageSync() {
    // 監聽 localStorage 變化
    window.addEventListener('storage', function(e) {
        if (e.key === 'loginStateSync') {
            console.log('🔄 檢測到跨頁面登入狀態變化');
            
            // 重新檢查登入狀態
            const currentUser = getCurrentUser();
            if (currentUser) {
                updateUserInterface(currentUser);
            } else {
                // 登出狀態，重新整理頁面UI
                const loginBtn = document.querySelector('.login-btn');
                const userMenu = document.querySelector('.user-menu');
                
                if (loginBtn && userMenu) {
                    loginBtn.style.display = 'block';
                    userMenu.style.display = 'none';
                }
                
                // 更新購物車顯示
                updateCartDisplay();
            }
        }
    });
}

// 觸發跨頁面同步
function triggerLoginStateSync() {
    // 通過 localStorage 事件通知其他頁面
    localStorage.setItem('loginStateSync', Date.now().toString());
    setTimeout(() => {
        localStorage.removeItem('loginStateSync');
    }, 1000);
}

// ===== EMAIL VERIFICATION FIXES =====
// 初始化驗證碼輸入框（簡化版）
function initVerificationCodeInput() {
    console.log('🔧 初始化驗證碼輸入框...');
    
    // 使用單一輸入框模式
    const singleCodeInput = document.getElementById('single-code-input');
    const singleVerifyBtn = document.getElementById('single-verify-btn');
    
    if (singleCodeInput && singleVerifyBtn) {
        console.log('✅ 找到單一驗證碼輸入框');
        
        // 移除舊的事件監聽器
        singleCodeInput.removeEventListener('input', singleCodeInput._inputHandler);
        singleCodeInput.removeEventListener('keypress', singleCodeInput._keyHandler);
        singleVerifyBtn.removeEventListener('click', singleVerifyBtn._clickHandler);
        
        // 輸入處理
        singleCodeInput._inputHandler = function(e) {
            let value = e.target.value.replace(/\D/g, ''); // 只保留數字
            if (value.length > 6) {
                value = value.substring(0, 6);
            }
            e.target.value = value;
            
            // 如果輸入完6位數，自動驗證
            if (value.length === 6) {
                setTimeout(() => {
                    quickVerify(value);
                }, 500);
            }
        };
        
        // Enter 鍵處理
        singleCodeInput._keyHandler = function(e) {
            if (e.key === 'Enter') {
                const code = e.target.value.trim();
                if (code.length === 6) {
                    quickVerify(code);
                }
            }
        };
        
        // 按鈕點擊處理
        singleVerifyBtn._clickHandler = function() {
            const code = singleCodeInput.value.trim();
            if (code.length === 6) {
                quickVerify(code);
            } else {
                showVerificationError('請輸入6位數驗證碼');
            }
        };
        
        // 添加事件監聽器
        singleCodeInput.addEventListener('input', singleCodeInput._inputHandler);
        singleCodeInput.addEventListener('keypress', singleCodeInput._keyHandler);
        singleVerifyBtn.addEventListener('click', singleVerifyBtn._clickHandler);
        
        // 聚焦到輸入框
        setTimeout(() => {
            singleCodeInput.focus();
        }, 300);
        
        console.log('✅ 驗證碼輸入框初始化完成');
    } else {
        console.warn('⚠️ 未找到單一驗證碼輸入框元素');
    }
}

// ===== CART SYSTEM FIXES =====
// 修復購物車顯示問題
function fixCartDisplay() {
    // 確保購物車計數器正確更新
    const cartCount = document.querySelector('.cart-count');
    const currentUser = getCurrentUser();
    
    if (cartCount) {
        if (!currentUser) {
            cartCount.style.display = 'none';
        } else {
            const stats = cartManager.getCartStats();
            if (stats.itemCount > 0) {
                cartCount.textContent = stats.itemCount;
                cartCount.style.display = 'block';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }
}

// 修復用戶登出後的狀態清理
function cleanupUserLogout() {
    // 清理所有用戶相關的 localStorage 項目
    const keysToRemove = [
        'isLoggedIn',
        'userEmail', 
        'userName',
        'userAvatar',
        'currentUser'
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // 清理 sessionStorage
    sessionStorage.removeItem('currentUser');
    
    // 重置UI狀態
    const loginBtn = document.querySelector('.login-btn');
    const userMenu = document.querySelector('.user-menu');
    
    if (loginBtn && userMenu) {
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
    
    // 更新購物車顯示
    updateCartDisplay();
    fixCartDisplay();
}

// ===== QUICK PASSWORD CHANGE FUNCTION =====
// 簡化的密碼更改功能
function quickPasswordChange() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('請先登入', 'warning');
        return;
    }
    
    const currentPassword = prompt('請輸入目前密碼:');
    if (!currentPassword) return;
    
    const newPassword = prompt('請輸入新密碼 (至少8個字符):');
    if (!newPassword) return;
    
    const confirmPassword = prompt('請再次確認新密碼:');
    if (!confirmPassword) return;
    
    // 驗證
    if (newPassword !== confirmPassword) {
        alert('兩次輸入的密碼不一致');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('密碼長度至少需要8個字符');
        return;
    }
    
    // 檢查目前密碼
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user || user.password !== currentPassword) {
        alert('目前密碼錯誤');
        return;
    }
    
    // 更新密碼
    user.password = newPassword;
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('✅ 密碼更改成功！');
    console.log('密碼已更新');
}

// 使函數全局可用
window.quickPasswordChange = quickPasswordChange;
window.initCrossPageSync = initCrossPageSync;
window.triggerLoginStateSync = triggerLoginStateSync;
window.initVerificationCodeInput = initVerificationCodeInput;
window.fixCartDisplay = fixCartDisplay;
window.cleanupUserLogout = cleanupUserLogout;
