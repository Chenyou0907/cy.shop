// Product Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    const meta = resolveProductMeta();
    hydrateProductPage(meta);
    initProductTabs();
    initFAQ();
    initProductActions(meta);
    initImageGallery();
});

// Resolve product metadata by id
function resolveProductMeta() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'valorant-gold';
    const catalog = {
        'valorant-gold': {
            id: 'valorant-gold',
            name: 'Valorant 黃金段位帳號',
            price: 299,
            category: '遊戲帳號 / Valorant',
            title: 'Valorant 黃金段位帳號 - 完整英雄解鎖',
            mainImage: 'https://via.placeholder.com/600x400/0099FF/FFFFFF?text=Valorant+主圖',
            thumbs: [
                'https://via.placeholder.com/120x80/0099FF/FFFFFF?text=圖1',
                'https://via.placeholder.com/120x80/FF6600/FFFFFF?text=圖2',
                'https://via.placeholder.com/120x80/003366/FFFFFF?text=圖3',
                'https://via.placeholder.com/120x80/10B981/FFFFFF?text=圖4'
            ],
            description: '這是一個經過精心培養的 Valorant 黃金段位帳號，適合想要快速開始競技遊戲體驗的玩家。帳號已達到黃金段位，具備穩定勝率與完整英雄陣容。',
            highlights: [
                { icon: 'fa-trophy', title: '黃金段位', text: '穩定黃金3段位，近期勝率 70%+' },
                { icon: 'fa-users', title: '完整英雄', text: '所有英雄已解鎖，立即上場' },
                { icon: 'fa-paint-brush', title: '豐富造型', text: '50+ 稀有與傳說造型' },
                { icon: 'fa-coins', title: 'VP 點數', text: '內含 2000+ VP，可立即使用' }
            ],
            specs: [
                ['遊戲段位', '黃金3 (Gold 3)'],
                ['競技勝率', '72%'],
                ['遊戲時數', '300+ 小時'],
                ['英雄數量', '22/22 (全部解鎖)'],
                ['武器造型', '53 個'],
                ['VP點數', '2,150 VP'],
                ['帳號狀態', '良好 (無警告記錄)'],
                ['區域', '亞太區 (AP)']
            ],
            badges: ['熱賣', '已驗證']
        },
        'instagram-10k': {
            id: 'instagram-10k',
            name: 'Instagram 10K 粉絲帳號',
            price: 199,
            category: '社交平台 / Instagram',
            title: 'Instagram 10K 粉絲帳號 - 高互動高品質',
            mainImage: 'https://via.placeholder.com/600x400/FF6600/FFFFFF?text=Instagram+主圖',
            thumbs: [
                'https://via.placeholder.com/120x80/FF6600/FFFFFF?text=圖1',
                'https://via.placeholder.com/120x80/F59E0B/FFFFFF?text=圖2',
                'https://via.placeholder.com/120x80/FB923C/FFFFFF?text=圖3',
                'https://via.placeholder.com/120x80/EA580C/FFFFFF?text=圖4'
            ],
            description: '精選 10K 粉絲帳號，真實活躍，互動率表現優異，適合商業合作或個人品牌經營。',
            highlights: [
                { icon: 'fa-users', title: '真實粉絲', text: '10,000+ 實際關注者' },
                { icon: 'fa-chart-line', title: '高互動', text: '貼文互動率遠高於平均' },
                { icon: 'fa-shield-alt', title: '安全移交', text: '完整信箱與雙重驗證交接指引' },
                { icon: 'fa-bolt', title: '快速交付', text: '確認後 1 小時內完成交接' }
            ],
            specs: [
                ['粉絲數量', '10,000+'],
                ['互動率', '高於同類帳號'],
                ['內容領域', '生活 / 時尚 (可再調整)'],
                ['郵箱存取權', '提供完整轉移'],
                ['地區比例', '台灣/港澳為主'],
                ['狀態', '無違規紀錄']
            ],
            badges: ['新品', '高互動']
        },
        'lol-diamond': {
            id: 'lol-diamond',
            name: 'LOL 鑽石段位帳號',
            price: 599,
            category: '遊戲帳號 / LOL',
            title: 'LOL 鑽石段位帳號 - 高勝率穩定上分',
            mainImage: 'https://via.placeholder.com/600x400/003366/FFFFFF?text=LOL+主圖',
            thumbs: [
                'https://via.placeholder.com/120x80/003366/FFFFFF?text=圖1',
                'https://via.placeholder.com/120x80/336699/FFFFFF?text=圖2',
                'https://via.placeholder.com/120x80/1D4ED8/FFFFFF?text=圖3',
                'https://via.placeholder.com/120x80/2563EB/FFFFFF?text=圖4'
            ],
            description: '高端鑽石段位帳號，具備穩定對線與團戰能力，適合想要直接體驗高端對局的玩家。',
            highlights: [
                { icon: 'fa-gem', title: '鑽石段位', text: '穩定鑽石，具備上分經驗' },
                { icon: 'fa-chess-knight', title: '多位置熟練', text: 'AD/MID/JUNG 多位置勝率均衡' },
                { icon: 'fa-paint-brush', title: '稀有造型', text: '多款限定造型收藏' },
                { icon: 'fa-shield-alt', title: '安全移交', text: '郵箱/手機雙驗證交接' }
            ],
            specs: [
                ['段位', '鑽石 IV'],
                ['常用英雄', 'AD / MID / JUNG'],
                ['近 50 場勝率', '65%'],
                ['造型', '30+'],
                ['伺服器', 'TW'],
                ['帳號狀態', '良好']
            ],
            badges: ['熱賣', '高端']
        },
        'discord-nitro': {
            id: 'discord-nitro',
            name: 'Discord Nitro 帳號',
            price: 99,
            category: '社交平台 / Discord',
            title: 'Discord Nitro 帳號 - 高級特權立即享受',
            mainImage: 'https://via.placeholder.com/600x400/7289DA/FFFFFF?text=Discord+主圖',
            thumbs: [
                'https://via.placeholder.com/120x80/7289DA/FFFFFF?text=圖1',
                'https://via.placeholder.com/120x80/99AAB5/FFFFFF?text=圖2',
                'https://via.placeholder.com/120x80/5865F2/FFFFFF?text=圖3',
                'https://via.placeholder.com/120x80/3B82F6/FFFFFF?text=圖4'
            ],
            description: '立即解鎖 Nitro 高級特權，享受高解析串流、自訂表情、加成伺服器等完整功能。',
            highlights: [
                { icon: 'fa-film', title: '高畫質串流', text: '支援 1080p 以上' },
                { icon: 'fa-smile', title: '自訂表情', text: '上傳自訂表情與動圖' },
                { icon: 'fa-server', title: '伺服器加成', text: '提升伺服器等級' },
                { icon: 'fa-rocket', title: '立即交付', text: '付款後 1 小時內完成' }
            ],
            specs: [
                ['方案', 'Nitro 個人版'],
                ['有效期', '30 天'],
                ['區域', '全球'],
                ['交付方式', '帳號交接 / 兌換碼'],
                ['售後', '7 天內客服支援']
            ],
            badges: ['超值', '快速交付']
        }
    };
    return catalog[id] || catalog['valorant-gold'];
}

// Fill product page with meta
function hydrateProductPage(meta) {
    // Title, category, price
    const titleEl = document.querySelector('.product-title');
    const categoryEl = document.querySelector('.product-category span');
    const priceEl = document.querySelector('.current-price');
    const mainImgEl = document.getElementById('main-product-image');
    const thumbsEl = document.querySelector('.thumbnail-images');
    
    if (titleEl) titleEl.textContent = meta.title;
    if (categoryEl) categoryEl.textContent = meta.category;
    if (priceEl) priceEl.textContent = `$${meta.price}`;
    if (mainImgEl) mainImgEl.src = meta.mainImage;
    
    if (thumbsEl && meta.thumbs?.length) {
        thumbsEl.innerHTML = meta.thumbs.map((src, idx) => `
            <img src="${src}" alt="縮圖${idx+1}" class="thumbnail ${idx===0?'active':''}" onclick="changeMainImage(this)">
        `).join('');
    }
    
    // Breadcrumb end
    const breadcrumbLast = document.querySelector('.breadcrumb span');
    if (breadcrumbLast) breadcrumbLast.textContent = meta.name;

    // Badges on main image
    const badgesWrap = document.querySelector('.image-badges');
    if (badgesWrap && meta.badges?.length) {
        badgesWrap.innerHTML = meta.badges.map(b => `<span class="badge">${b}</span>`).join('');
    }

    // Description text
    const descFirstP = document.querySelector('.description-content p');
    if (descFirstP && meta.description) {
        descFirstP.textContent = meta.description;
    }

    // Highlights grid
    const highlightGrid = document.querySelector('.highlight-grid');
    if (highlightGrid && meta.highlights?.length) {
        highlightGrid.innerHTML = meta.highlights.map(h => `
            <div class="highlight-item">
                <div class="highlight-icon">
                    <i class="fas ${h.icon}"></i>
                </div>
                <div class="highlight-content">
                    <h4>${h.title}</h4>
                    <p>${h.text}</p>
                </div>
            </div>
        `).join('');
    }

    // Features list (右側簡要特色)
    const featuresList = document.querySelector('.features-list');
    if (featuresList && meta.highlights?.length) {
        featuresList.innerHTML = meta.highlights.slice(0, 6).map(h => `
            <li><i class="fas fa-check"></i> ${h.title}：${h.text}</li>
        `).join('');
    }

    // Specifications table
    const specTable = document.querySelector('.spec-table');
    if (specTable && meta.specs?.length) {
        specTable.innerHTML = meta.specs.map(row => `
            <div class="spec-row">
                <div class="spec-label">${row[0]}</div>
                <div class="spec-value">${row[1]}</div>
            </div>
        `).join('');
    }
}

// Product Image Gallery
function initImageGallery() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Set up thumbnail click handlers
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            changeMainImage(thumbnail);
        });
    });
}

function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Update main image
    mainImage.src = thumbnail.src.replace('120x80', '600x400');
    mainImage.alt = thumbnail.alt;
    
    // Update active thumbnail
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
    
    // Add subtle animation
    mainImage.style.opacity = '0.7';
    setTimeout(() => {
        mainImage.style.opacity = '1';
    }, 150);
}

// Product Tabs Functionality
function initProductTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Smooth scroll to tabs section
            document.querySelector('.product-tabs-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// FAQ Accordion Functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Product Actions (Quantity, Add to Cart, etc.)
function initProductActions(meta) {
    const quantityElement = document.getElementById('quantity');
    const buyNowBtn = document.querySelector('.buy-now-btn');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    // Initialize quantity
    let quantity = 1;
    
    // Make updateQuantity globally available
    window.updateQuantity = function(change) {
        quantity = Math.max(1, quantity + change);
        quantityElement.textContent = quantity;
        updatePrice();
    };
    
    function updatePrice() {
        const basePrice = meta.price;
        const currentPriceElement = document.querySelector('.current-price');
        const newPrice = basePrice * quantity;
        currentPriceElement.textContent = `$${newPrice}`;
    }
    
    // Buy Now Button
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const product = {
                id: meta.id,
                name: meta.name,
                price: meta.price,
                quantity: quantity,
                image: document.getElementById('main-product-image').src
            };
            
            // Add to cart
            addProductToCart(product);
            
            // Show success message
            showNotification(`已添加 ${quantity} 個商品到購物車！`, 'success');
            
            // Redirect to checkout (placeholder)
            setTimeout(() => {
                showNotification('即將跳轉到結帳頁面...', 'info');
            }, 1000);
        });
    }
    
    // Add to Favorites Button
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const product = {
                id: meta.id,
                name: meta.name,
                price: meta.price,
                image: document.getElementById('main-product-image').src
            };
            
            // Check if already in favorites
            const existingIndex = favorites.findIndex(item => item.id === product.id);
            
            if (existingIndex > -1) {
                favorites.splice(existingIndex, 1);
                addToCartBtn.innerHTML = '<i class="fas fa-heart"></i> 加入收藏';
                addToCartBtn.classList.remove('favorited');
                showNotification('已從收藏中移除', 'info');
            } else {
                favorites.push(product);
                addToCartBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                addToCartBtn.classList.add('favorited');
                showNotification('已加入收藏！', 'success');
            }
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
        });
        
        // Check if product is already favorited
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorited = favorites.some(item => item.id === meta.id);
        
        if (isFavorited) {
            addToCartBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
            addToCartBtn.classList.add('favorited');
        }
    }
}

// Enhanced cart functionality for product page
function addProductToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in header
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        
        // Add animation when items are added
        cartCount.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 200);
    }
}

// Review helpful button functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.helpful-btn')) {
        const btn = e.target.closest('.helpful-btn');
        const currentText = btn.textContent;
        const match = currentText.match(/\((\d+)\)/);
        
        if (match) {
            const currentCount = parseInt(match[1]);
            const newCount = currentCount + 1;
            btn.innerHTML = btn.innerHTML.replace(/\(\d+\)/, `(${newCount})`);
            btn.style.color = 'var(--primary-bright-blue)';
            btn.style.borderColor = 'var(--primary-bright-blue)';
            btn.disabled = true;
            
            showNotification('感謝您的反饋！', 'success');
        }
    }
});

// Load more reviews functionality
const loadMoreBtn = document.querySelector('.load-more-reviews .btn-outline');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        // Simulate loading more reviews
        const reviewsList = document.querySelector('.reviews-list');
        const newReviews = generateMoreReviews(3);
        
        newReviews.forEach(review => {
            reviewsList.appendChild(review);
        });
        
        showNotification('已載入更多評價', 'info');
        
        // Hide button after loading a few times
        const reviewItems = document.querySelectorAll('.review-item');
        if (reviewItems.length >= 9) {
            loadMoreBtn.style.display = 'none';
        }
    });
}

function generateMoreReviews(count) {
    const reviews = [];
    const sampleNames = ['陳*偉', '林*怡', '黃*龍', '吳*芳', '鄭*傑'];
    const sampleComments = [
        '帳號品質很好，客服服務也很專業，值得推薦！',
        '交付速度超快，帳號狀態如描述一樣，很滿意。',
        '第一次購買就有這麼好的體驗，會再次光顧的。',
        '物超所值，朋友推薦來的，果然沒有失望。',
        '專業的團隊，安全的交易，強烈推薦給大家！'
    ];
    
    for (let i = 0; i < count; i++) {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const randomRating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        const stars = Array(5).fill(0).map((_, index) => 
            index < randomRating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'
        ).join('');
        
        reviewElement.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="https://via.placeholder.com/50x50/0099FF/FFFFFF?text=${randomName.charAt(0)}" alt="User" class="reviewer-avatar">
                    <div class="reviewer-details">
                        <h4>${randomName}</h4>
                        <span class="review-date">${randomDate.toLocaleDateString('zh-TW')}</span>
                    </div>
                </div>
                <div class="review-rating">
                    ${stars}
                </div>
            </div>
            <div class="review-content">
                <p>${randomComment}</p>
                <div class="review-helpful">
                    <button class="helpful-btn">
                        <i class="fas fa-thumbs-up"></i>
                        有幫助 (${Math.floor(Math.random() * 20) + 1})
                    </button>
                </div>
            </div>
        `;
        
        reviews.push(reviewElement);
    }
    
    return reviews;
}

// Related products click tracking
document.querySelectorAll('.related-products-grid .btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('h4').textContent;
        
        // Track analytics
        if (window.trackEvent) {
            window.trackEvent('related_product_click', {
                product_name: productName,
                page: 'product_detail'
            });
        }
        
        showNotification(`即將跳轉到 ${productName} 產品頁面...`, 'info');
        
        // Simulate navigation (in real app, this would be actual navigation)
        setTimeout(() => {
            console.log(`Navigating to ${productName} product page`);
        }, 1000);
    });
});

// Breadcrumb navigation
document.querySelectorAll('.breadcrumb a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const linkText = link.textContent;
        
        if (linkText === '首頁') {
            window.location.href = 'index.html';
        } else {
            showNotification(`即將跳轉到 ${linkText} 頁面...`, 'info');
            setTimeout(() => {
                console.log(`Navigating to ${linkText}`);
            }, 1000);
        }
    });
});

// Image zoom functionality (optional enhancement)
function initImageZoom() {
    const mainImage = document.getElementById('main-product-image');
    
    if (mainImage) {
        mainImage.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'image-zoom-modal';
            modal.innerHTML = `
                <div class="zoom-modal-content">
                    <img src="${mainImage.src}" alt="${mainImage.alt}">
                    <button class="close-zoom">&times;</button>
                </div>
            `;
            
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: zoom-out;
            `;
            
            const content = modal.querySelector('.zoom-modal-content');
            content.style.cssText = `
                position: relative;
                max-width: 90%;
                max-height: 90%;
            `;
            
            const img = modal.querySelector('img');
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
            `;
            
            const closeBtn = modal.querySelector('.close-zoom');
            closeBtn.style.cssText = `
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            const closeModal = () => {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            };
            
            modal.addEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
        
        // Add cursor pointer to indicate clickable
        mainImage.style.cursor = 'zoom-in';
    }
}

// Initialize image zoom
initImageZoom();

// Add CSS for favorited button
const favoriteStyles = document.createElement('style');
favoriteStyles.textContent = `
    .add-to-cart-btn.favorited {
        background: var(--accent-orange) !important;
        color: var(--white) !important;
        border-color: var(--accent-orange) !important;
    }
    
    .add-to-cart-btn.favorited:hover {
        background: #e55a00 !important;
    }
`;
document.head.appendChild(favoriteStyles);

// Initialize cart count on page load
updateCartCount();

console.log('Product page loaded successfully! 🛍️');
