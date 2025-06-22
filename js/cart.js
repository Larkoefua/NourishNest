let cart = JSON.parse(localStorage.getItem('cart')) || [];
const DELIVERY_FEE = 10.00;

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showToast(message) {
    console.log(`[Toast] Attempting to show: ${message}`);
    const toastElement = document.querySelector('#cartToast');
    if (toastElement) {
        console.log('[Toast] Found #cartToast');
        const toastBody = toastElement.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = message;
            console.log('[Toast] Set message:', message);
        } else {
            console.warn('[Toast] .toast-body not found');
        }
        try {
            const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
            console.log('[Toast] Toast instance created');
            toast.show();
            console.log('[Toast] Toast shown');
            // Check visibility
            setTimeout(() => {
                const isVisible = toastElement.classList.contains('show');
                const displayStyle = window.getComputedStyle(toastElement).display;
                console.log(`[Toast] Visibility check: class 'show'=${isVisible}, display=${displayStyle}`);
            }, 100);
        } catch (error) {
            console.error('[Toast] Error:', error);
        }
    } else {
        console.warn('[Toast] #cartToast not found');
    }
}

function updateCartCounter() {
    const cartCounter = document.querySelector('#cart-counter');
    if (cartCounter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        console.log('[Cart] Counter updated:', totalItems);
    } else {
        console.warn('[Cart] #cart-counter not found');
    }
}

function addToCart(productId, name, price, image) {
    console.log(`[Cart] Adding: ${name} (ID: ${productId}, Price: ₵${price}, Image: ${image})`);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, name, price, image, quantity: 1 });
    }
    saveCart();
    updateCartCounter();
    showToast(`${name} added to cart!`);
}

function updateCartDisplay() {
    const cartTableBody = document.querySelector('#cartTable tbody');
    const cartSubtotalElement = document.querySelector('#cart-subtotal');
    const cartTotalElement = document.querySelector('#cart-total');
    if (!cartTableBody) {
        console.warn('[Cart] #cartTable tbody not found');
        return;
    }

    cartTableBody.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;">
                </div>
            </th>
            <td><p class="mb-0 mt-4">${item.name}</p></td>
            <td><p class="mb-0 mt-4">₵${item.price.toFixed(2)}</p></td>
            <td>
                <div class="input-group quantity mt-4" style="width: 100px;">
                    <div class="input-group-btn">
                        <button class="btn btn-sm btn-minus rounded-circle bg-light border decrease-qty" data-id="${item.id}">
                            <i class="fa fa-minus"></i>
                        </button>
                    </div>
                    <input type="text" class="form-control form-control-sm text-center border-0" value="${item.quantity}" readonly>
                    <div class="input-group-btn">
                        <button class="btn btn-sm btn-plus rounded-circle bg-light border increase-qty" data-id="${item.id}">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                </div>
            </td>
            <td><p class="mb-0 mt-4">₵${itemTotal.toFixed(2)}</p></td>
            <td>
                <button class="btn btn-md rounded-circle bg-light border mt-4 remove-item" data-id="${item.id}">
                    <i class="fa fa-times text-danger"></i>
                </button>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    if (cartSubtotalElement) {
        cartSubtotalElement.textContent = `₵${subtotal.toFixed(2)}`;
    }
    if (cartTotalElement) {
        cartTotalElement.textContent = `₵${(subtotal + DELIVERY_FEE).toFixed(2)}`;
    }

    document.querySelectorAll('.increase-qty').forEach(button => {
        button.addEventListener('click', () => {
            console.log(`[Cart] Increase qty: ${button.dataset.id}`);
            changeQuantity(button.dataset.id, 1);
            showToast('Quantity updated!');
        });
    });
    document.querySelectorAll('.decrease-qty').forEach(button => {
        button.addEventListener('click', () => {
            console.log(`[Cart] Decrease qty: ${button.dataset.id}`);
            const item = cart.find(item => item.id === button.dataset.id);
            if (item.quantity === 1) {
                showToast(`${item.name} removed from cart!`);
            } else {
                showToast('Quantity updated!');
            }
            changeQuantity(button.dataset.id, -1);
        });
    });
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            console.log(`[Cart] Remove item: ${button.dataset.id}`);
            const item = cart.find(item => item.id === button.dataset.id);
            showToast(`${item.name} removed from cart!`);
            removeItem(button.dataset.id);
        });
    });
}

function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeItem(productId);
        } else {
            saveCart();
            updateCartDisplay();
            updateCartCounter();
        }
    }
}

function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCounter();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Cart] cart.js loaded');
    updateCartCounter();
    if (document.querySelector('#cartTable')) {
        updateCartDisplay();
    }

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log(`[Cart] Found ${addToCartButtons.length} .add-to-cart buttons`);
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log('[Cart] Add-to-cart clicked');
            e.preventDefault();
            const productElement = button.closest('.fruite-item');
            if (!productElement) {
                console.warn('[Cart] .fruite-item not found');
                return;
            }
            const productId = productElement.querySelector('h4').textContent.trim().replace(/\s+/g, '-').toLowerCase();
            const name = productElement.querySelector('h4').textContent.trim();
            const priceText = productElement.querySelector('.text-dark.fs-5.fw-bold').textContent.split('/')[0].trim().replace('₵', '');
            const price = parseFloat(priceText);
            const image = productElement.querySelector('img').src;
            addToCart(productId, name, price, image);
        });
    });
});

(function ($) {
    "use strict";

    // Original cart functions (keep your existing cart code here)
    // e.g., updateCounter, addToCart, etc.

    // Search and filter functions
    function initSearchAndFilter() {
        // Hero search (index.html)
        const heroForm = $('#hero-search-form');
        const heroInput = $('#hero-search');
        const heroButton = $('#hero-search-btn');
        console.log('[Search] Hero input found:', heroInput.length, 'Hero button found:', heroButton.length);
        if (heroForm.length && heroInput.length) {
            heroForm.on('submit', function (e) {
                e.preventDefault();
                performSearch(heroInput.val(), true);
            });
            if (heroButton.length) {
                heroButton.on('click', function () {
                    performSearch(heroInput.val(), true);
                });
            }
        }

        // Navbar search (all pages)
        const navbarInput = $('#navbar-search');
        const navbarButton = $('#navbar-search-btn');
        console.log('[Search] Navbar input found:', navbarInput.length, 'Navbar button found:', navbarButton.length);
        if (navbarInput.length) {
            navbarInput.on('keypress', function (e) {
                if (e.key === 'Enter') {
                    performSearch($(this).val(), false);
                }
            });
            if (navbarButton.length) {
                navbarButton.on('click', function () {
                    performSearch(navbarInput.val(), false);
                    $('#searchModal').modal('hide');
                });
            }
        }

        // Category filter (shop.html)
        const categoryFilter = $('#category-filter, #fruits');
        console.log('[Filter] Category filter found:', categoryFilter.length);
        if (categoryFilter.length) {
            categoryFilter.on('change', function () {
                let category = $(this).val().toLowerCase();
                const categoryMap = {
                    'volvo': 'lotion',
                    'saab': 'cream',
                    'opel': 'oil',
                    'audi': 'soap',
                    '': ''
                };
                category = categoryMap[category] || category;
                console.log('[Filter] Selected category (dropdown):', category);
                filterProducts(category);
                $('.category-link').removeClass('active');
                $(`.category-link[data-category="${category}"]`).addClass('active');
            });
        }

        // Sidebar category links (shop.html)
        const categoryLinks = $('.category-link');
        console.log('[Filter] Category links found:', categoryLinks.length);
        if (categoryLinks.length) {
            categoryLinks.on('click', function (e) {
                e.preventDefault();
                const category = $(this).data('category').toLowerCase();
                console.log('[Filter] Selected category (sidebar):', category);
                filterProducts(category);
                categoryFilter.val(category);
                $('.category-link').removeClass('active');
                $(this).addClass('active');
            });
        }
    }

    function performSearch(query, isHeroSearch) {
        query = query.trim().toLowerCase();
        console.log('[Search] Query:', query, 'Is hero search:', isHeroSearch);
        const isHomePage = window.location.pathname.includes('index.html') || window.location.pathname === '/NourishNest/' || window.location.pathname === '/';
        console.log('[Search] Is homepage:', isHomePage);

        if (isHomePage && isHeroSearch) {
            // Filter on index.html
            let found = false;
            const items = $('.fruite-item');
            console.log('[Search] Found items:', items.length);
            items.each(function (index) {
                const nameElement = $(this).find('h4, h5, .product-name, .item-name');
                const productName = nameElement.length ? nameElement.text().trim().toLowerCase() : '';
                console.log('[Search] Item', index, 'Name:', productName);
                if (query && productName.includes(query)) {
                    $(this).show();
                    found = true;
                } else {
                    $(this).hide();
                }
            });
            if (query && !found) {
                console.log('[Search] No results found, showing toast');
                const toast = new bootstrap.Toast(document.getElementById('search-toast'));
                toast.show();
            }
            if (!query) {
                items.show();
            }
        } else {
            // Redirect to shop.html
            if (query) {
                window.location.href = `shop.html?query=${encodeURIComponent(query)}`;
            }
        }
    }

    function filterProducts(category) {
        const isShopPage = window.location.pathname.includes('shop.html');
        console.log('[Filter] Category:', category, 'Is shop page:', isShopPage);
        if (isShopPage) {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('query')?.toLowerCase();
            console.log('[Filter] Search query:', query);
            const items = $('.fruite-item');
            console.log('[Filter] Found items:', items.length);
            let found = false;
            items.each(function (index) {
                const nameElement = $(this).find('h4, h5, .product-name, .item-name');
                const productName = nameElement.length ? nameElement.text().trim().toLowerCase() : '';
                const productCategory = $(this).find('.category').text().toLowerCase() || '';
                console.log('[Filter] Item', index, 'Name:', productName, 'Category:', productCategory);
                const matchesQuery = !query || productName.includes(query);
                const matchesCategory = !category || productCategory === category;
                if (matchesQuery && matchesCategory) {
                    $(this).show();
                    found = true;
                } else {
                    $(this).hide();
                }
            });
            if ((query || category) && !found) {
                console.log('[Filter] No results found, showing toast');
                const toast = new bootstrap.Toast(document.getElementById('search-toast'));
                toast.show();
            }
            $('#navbar-search').val(query || '');
        }
    }

    $(document).ready(function () {
        console.log('[Cart] cart.js loaded');
        // Original cart initialization (keep your existing code)
        console.log('[Search] Initializing search and filter');
        initSearchAndFilter();
        filterProducts($('#category-filter, #fruits').val() || '');
    });

})(jQuery);