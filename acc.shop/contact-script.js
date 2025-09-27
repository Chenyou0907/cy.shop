// Contact Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFAQFiltering();
    initCurrentTime();
    initFAQAccordion();
});

// Contact Form Functionality
function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (!form) return;
    
    // Form validation
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', validateField);
    });
    
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        // Remove existing error styling
        field.style.borderColor = '';
        removeErrorMessage(field);
        
        // Validate based on field type
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = '此欄位為必填';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '請輸入有效的電子郵件地址';
            }
        } else if (field.type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = '請輸入有效的電話號碼';
            }
        }
        
        if (!isValid) {
            field.style.borderColor = 'var(--error-red)';
            showErrorMessage(field, errorMessage);
        } else {
            field.style.borderColor = 'var(--success-green)';
        }
        
        updateSubmitButton();
        return isValid;
    }
    
    function showErrorMessage(field, message) {
        removeErrorMessage(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--error-red);
            font-size: 0.875rem;
            margin-top: 4px;
            display: block;
        `;
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeErrorMessage(field) {
        const existing = field.parentNode.querySelector('.error-message');
        if (existing) {
            existing.remove();
        }
    }
    
    function updateSubmitButton() {
        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        const privacyCheckbox = form.querySelector('#privacy');
        
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
            }
        });
        
        if (!privacyCheckbox.checked) {
            allValid = false;
        }
        
        submitBtn.disabled = !allValid;
    }
    
    // Privacy checkbox validation
    const privacyCheckbox = form.querySelector('#privacy');
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', updateSubmitButton);
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            showNotification('請修正表單中的錯誤', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發送中...';
        
        // Simulate form submission
        setTimeout(() => {
            // Reset form
            form.reset();
            
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Remove validation styling
            inputs.forEach(input => {
                input.style.borderColor = '';
                removeErrorMessage(input);
            });
            
            // Show success message
            showNotification('訊息發送成功！我們會盡快回覆您。', 'success');
            
            // Track form submission
            if (window.trackEvent) {
                const formData = new FormData(form);
                window.trackEvent('contact_form_submit', {
                    category: formData.get('category'),
                    has_attachment: !!formData.get('attachment').name
                });
            }
        }, 2000);
    });
    
    // File upload validation
    const fileInput = form.querySelector('#attachment');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            
            if (file.size > maxSize) {
                showNotification('檔案大小不能超過 5MB', 'error');
                fileInput.value = '';
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                showNotification('不支援的檔案格式', 'error');
                fileInput.value = '';
                return;
            }
            
            showNotification(`已選擇檔案：${file.name}`, 'success');
        });
    }
}

// FAQ Filtering Functionality
function initFAQFiltering() {
    const categoryButtons = document.querySelectorAll('.faq-category-btn');
    const faqItems = document.querySelectorAll('.faq-item');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter FAQ items
            faqItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all' || itemCategory === category) {
                    item.classList.remove('hidden');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
            
            // Add animation
            setTimeout(() => {
                faqItems.forEach((item, index) => {
                    if (!item.classList.contains('hidden')) {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                            item.style.transition = 'all 0.3s ease';
                        }, index * 100);
                    }
                });
            }, 100);
        });
    });
}

// FAQ Accordion Functionality
function initFAQAccordion() {
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

// Current Time Display
function initCurrentTime() {
    const timeDisplay = document.getElementById('current-time');
    
    if (!timeDisplay) return;
    
    function updateTime() {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Taipei',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        const timeString = now.toLocaleTimeString('zh-TW', options);
        timeDisplay.textContent = timeString;
    }
    
    // Update immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);
}

// Quick contact actions
document.addEventListener('click', function(e) {
    const quickContactItem = e.target.closest('.quick-contact-item');
    if (!quickContactItem) return;
    
    e.preventDefault();
    
    const href = quickContactItem.getAttribute('href');
    const text = quickContactItem.querySelector('span').textContent;
    
    if (href.startsWith('mailto:')) {
        window.location.href = href;
        showNotification('正在開啟您的郵件應用程式...', 'info');
    } else if (href.startsWith('tel:')) {
        window.location.href = href;
        showNotification('正在撥打電話...', 'info');
    } else if (href.includes('discord')) {
        showNotification('即將跳轉到 Discord 客服...', 'info');
        setTimeout(() => {
            window.open('https://discord.gg/SZkyeKJ4wp', '_blank');
        }, 1000);
    } else if (href.includes('telegram')) {
        showNotification('即將跳轉到 Telegram...', 'info');
        setTimeout(() => {
            window.open('https://t.me/accshop_support', '_blank');
        }, 1000);
    }
    
    // Track contact method usage
    if (window.trackEvent) {
        window.trackEvent('quick_contact_click', {
            method: text,
            page: 'contact'
        });
    }
});

// Emergency contact actions
document.addEventListener('click', function(e) {
    const emergencyBtn = e.target.closest('.emergency-btn');
    if (!emergencyBtn) return;
    
    e.preventDefault();
    
    const href = emergencyBtn.getAttribute('href');
    const text = emergencyBtn.textContent.trim();
    
    if (href.startsWith('tel:')) {
        window.location.href = href;
        showNotification('正在撥打緊急熱線...', 'warning');
    } else if (href.includes('discord')) {
        showNotification('連接緊急客服中...', 'warning');
        setTimeout(() => {
            window.open('https://discord.gg/SZkyeKJ4wp', '_blank');
        }, 1000);
    }
    
    // Track emergency contact usage
    if (window.trackEvent) {
        window.trackEvent('emergency_contact_click', {
            method: text,
            page: 'contact'
        });
    }
});

// Auto-fill form based on URL parameters (for pre-filled contact forms)
function autoFillForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const form = document.getElementById('contact-form');
    
    if (!form) return;
    
    // Auto-fill category if specified
    const category = urlParams.get('category');
    if (category) {
        const categorySelect = form.querySelector('#category');
        if (categorySelect) {
            categorySelect.value = category;
        }
    }
    
    // Auto-fill subject if specified
    const subject = urlParams.get('subject');
    if (subject) {
        const subjectInput = form.querySelector('#subject');
        if (subjectInput) {
            subjectInput.value = decodeURIComponent(subject);
        }
    }
    
    // Auto-fill message if specified
    const message = urlParams.get('message');
    if (message) {
        const messageTextarea = form.querySelector('#message');
        if (messageTextarea) {
            messageTextarea.value = decodeURIComponent(message);
        }
    }
}

// Initialize auto-fill
autoFillForm();

// Form field enhancements
function initFormEnhancements() {
    // Add floating labels effect
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const label = group.querySelector('label');
        
        if (!input || !label) return;
        
        input.addEventListener('focus', () => {
            label.style.color = 'var(--primary-bright-blue)';
            label.style.transform = 'translateY(-2px)';
            label.style.transition = 'all 0.2s ease';
        });
        
        input.addEventListener('blur', () => {
            label.style.color = '';
            label.style.transform = '';
        });
    });
    
    // Character counter for textarea
    const messageTextarea = document.querySelector('#message');
    if (messageTextarea) {
        const maxLength = 1000;
        messageTextarea.setAttribute('maxlength', maxLength);
        
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--neutral-dark-gray);
            margin-top: 4px;
        `;
        
        function updateCounter() {
            const remaining = maxLength - messageTextarea.value.length;
            counter.textContent = `${remaining} 字元剩餘`;
            
            if (remaining < 100) {
                counter.style.color = 'var(--warning-yellow)';
            } else if (remaining < 50) {
                counter.style.color = 'var(--error-red)';
            } else {
                counter.style.color = 'var(--neutral-dark-gray)';
            }
        }
        
        messageTextarea.addEventListener('input', updateCounter);
        messageTextarea.parentNode.appendChild(counter);
        updateCounter();
    }
}

// Initialize form enhancements
initFormEnhancements();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contact form analytics tracking
function trackFormInteraction(action, field = null) {
    if (window.trackEvent) {
        window.trackEvent('contact_form_interaction', {
            action: action,
            field: field,
            page: 'contact'
        });
    }
}

// Track form field interactions
document.querySelectorAll('#contact-form input, #contact-form select, #contact-form textarea').forEach(field => {
    field.addEventListener('focus', () => {
        trackFormInteraction('field_focus', field.name);
    });
    
    field.addEventListener('blur', () => {
        if (field.value.trim()) {
            trackFormInteraction('field_complete', field.name);
        }
    });
});

// Accessibility enhancements
function initAccessibility() {
    // Add keyboard navigation for FAQ items
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
        
        question.addEventListener('click', () => {
            const isActive = question.closest('.faq-item').classList.contains('active');
            question.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
    });
    
    // Add aria-labels for quick contact items
    const quickContactItems = document.querySelectorAll('.quick-contact-item');
    quickContactItems.forEach(item => {
        const text = item.querySelector('span').textContent;
        item.setAttribute('aria-label', `使用 ${text} 聯絡我們`);
    });
}

// Initialize accessibility features
initAccessibility();

console.log('Contact page loaded successfully! 📞');
