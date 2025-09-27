// Category page dynamic rendering
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || 'gaming';

    const catalogs = {
        gaming: {
            title: '遊戲帳號',
            subtitle: 'FPS / MOBA / 手遊 精選遊戲帳號',
            items: [
                { id: 'valorant-gold', name: 'Valorant 黃金段位帳號', price: 299, badge: '熱賣', color: ['#0099FF','#66B2FF'] },
                { id: 'lol-diamond', name: 'LOL 鑽石段位帳號', price: 599, badge: '高端', color: ['#003366','#336699'] },
                { id: 'valorant-platinum', name: 'Valorant 白金段位帳號', price: 399, badge: '熱門', color: ['#1D4ED8','#3B82F6'] }
            ]
        },
        social: {
            title: '社交平台',
            subtitle: 'IG / Discord / TikTok 精選社交帳號',
            items: [
                { id: 'instagram-10k', name: 'Instagram 10K 粉絲帳號', price: 199, badge: '新品', color: ['#FF6600','#FF9966'] },
                { id: 'discord-nitro', name: 'Discord Nitro 帳號', price: 99, badge: '超值', color: ['#7289DA','#99AAB5'] }
            ]
        },
        streaming: {
            title: '直播平台',
            subtitle: 'Twitch / YouTube / 抖音 精選直播帳號',
            items: [
                { id: 'yt-premium', name: 'YouTube Premium 家庭', price: 129, badge: '熱門', color: ['#DC2626','#F87171'] },
                { id: 'twitch-affiliate', name: 'Twitch Affiliate 帳號', price: 349, badge: '稀有', color: ['#8B5CF6','#A78BFA'] }
            ]
        }
    };

    const data = catalogs[cat] || catalogs.gaming;
    document.getElementById('category-title').textContent = data.title;
    document.getElementById('category-subtitle').textContent = data.subtitle;

    const grid = document.getElementById('category-grid');
    grid.innerHTML = data.items.map((p, idx) => card(p, idx)).join('');
});

function card(p, idx) {
    const bg = `linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`;
    return `
    <div class="product-card">
        <div class="product-image">
            <a href="product.html?id=${p.id}" title="查看詳情">
                <div class="placeholder-img" style="width: 100%; height: 200px; background: ${bg}; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold; border-radius: 8px 8px 0 0;">${p.name.split(' ')[0]}</div>
            </a>
            ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <h4>${p.name}</h4>
            <div class="product-rating">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
                <span>(88)</span>
            </div>
            <div class="product-price">
                <span class="current-price">$${p.price}</span>
            </div>
            <div>
                <a class="btn-primary" href="product.html?id=${p.id}">查看詳情</a>
                <button class="btn-secondary" onclick="addToFavorites('${p.id}', '${p.name}')" style="margin-left:8px;">收藏</button>
            </div>
        </div>
    </div>`;
}

