
// Constants for OpenWeatherMap API
const ONO_LAT = 35.9833; // Latitude for Ono, Fukui
const ONO_LON = 136.4833; // Longitude for Ono, Fukui
const OPENWEATHER_API_KEY = 'f4570fbcf82299b4fccd80c8c397b1e2'; // OpenWeatherMap API key

// DOM Elements
const salesReportButton = document.getElementById('sales-report-button');
const menuContainer = document.getElementById('menu-container');
const cartItemsList = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
const modalOverlay = document.getElementById('modal-overlay');
const quantityModal = document.getElementById('quantity-modal');
const quantityModalItemName = document.getElementById('quantity-modal-item-name');
const quantityDisplay = document.getElementById('quantity-display');
const increaseQuantityButton = document.getElementById('increase-quantity');
const decreaseQuantityButton = document.getElementById('decrease-quantity');
const confirmQuantityButton = document.getElementById('confirm-quantity-button');
const paymentModal = document.getElementById('payment-modal');
const paymentTotalSpan = document.getElementById('payment-total');
const amountPaidDisplay = document.getElementById('amount-paid-display');
const numericKeypad = document.getElementById('numeric-keypad');
const confirmPaymentButton = document.getElementById('confirm-payment-button');
const receiptModal = document.getElementById('receipt-modal');
const receiptTotalSpan = document.getElementById('receipt-total');
const receiptPaidSpan = document.getElementById('receipt-paid');
const receiptChangeSpan = document.getElementById('receipt-change');
const checkButton = document.getElementById('check-button');
const salesModal = document.getElementById('sales-modal');
const prevMonthButton = document.getElementById('prev-month-button');
const nextMonthButton = document.getElementById('next-month-button');
const monthNameSpan = document.getElementById('month-name');
const calendarView = document.getElementById('calendar-view');
const dailySalesView = document.getElementById('daily-sales-view');
const dailyViewDate = document.getElementById('daily-view-date');
const dailyTotalInput = document.getElementById('daily-total-input');
const saveTotalButton = document.getElementById('save-total-button');
const resetDailySalesButton = document.getElementById('reset-daily-sales-button');
const dailyItemList = document.getElementById('daily-item-list');
const weatherInfo = document.getElementById('weather-info');
const dailyMemo = document.getElementById('daily-memo');
const saveMemoButton = document.getElementById('save-memo-button');
const backToCalendarButton = document.getElementById('back-to-calendar-button');
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteButton = document.getElementById('confirm-delete-button');
const cartItemModal = document.getElementById('cart-item-modal');
const cartItemModalName = document.getElementById('cart-item-modal-name');
const editQuantityButton = document.getElementById('edit-quantity-button');
const deleteItemButton = document.getElementById('delete-item-button');
const customerCheckOverlay = document.getElementById('customer-check-overlay');
const customerCheckTotal = document.getElementById('customer-check-total');
const customerCheckPaid = document.getElementById('customer-check-paid');
const customerCheckChange = document.getElementById('customer-check-change');
const customerCheckItemList = document.getElementById('customer-check-item-list');
const customerCheckContainer = document.getElementById('customer-check-container');
const redoButton = document.getElementById('redo-button');
const backButton = document.getElementById('back-button');

// Global Variables
let cart = [];
let currentQuantity = 1;
let selectedMenuItem = null;
let amountPaid = 0;
let salesData = {}; // Stores sales data by date
let currentModal = null;
let currentCalendarDate = new Date(); // For sales report calendar
let editingCartItemIndex = -1; // To track which cart item is being edited

// --- Utility Functions ---

function showModal(modalElement) {
    modalOverlay.classList.remove('hidden');
    modalElement.classList.remove('hidden');
    currentModal = modalElement;
    backButton.classList.remove('hidden');
}

function hideModal(modalElement) {
    modalElement.classList.add('hidden');
    modalOverlay.classList.add('hidden');
    currentModal = null;
    backButton.classList.add('hidden');
}

function saveSalesData() {
    localStorage.setItem('tradSalesData', JSON.stringify(salesData));
}

function loadSalesData() {
    const data = localStorage.getItem('tradSalesData');
    if (data) {
        salesData = JSON.parse(data);
    }
}

function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Menu Display ---

function displayMenu() {
    menuContainer.innerHTML = ''; // Clear existing menu
    for (const category in menuData) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('menu-category');
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);

        menuData[category].forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.classList.add('menu-item');
            menuItemDiv.innerHTML = `
                <span>${item.name}</span>
                <span>¥${item.price}</span>
            `;
            menuItemDiv.addEventListener('click', () => {
                selectedMenuItem = item;
                quantityModalItemName.textContent = item.name;
                currentQuantity = 1;
                quantityDisplay.textContent = currentQuantity;
                showModal(quantityModal);
            });
            categoryDiv.appendChild(menuItemDiv);
        });
        menuContainer.appendChild(categoryDiv);
    }
}

// --- Cart Operations ---

function updateCart() {
    cartItemsList.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>¥${item.price * item.quantity}</span>
        `;
        li.addEventListener('click', () => {
            editingCartItemIndex = index;
            cartItemModalName.textContent = item.name;
            showModal(cartItemModal);
        });
        cartItemsList.appendChild(li);
        total += item.price * item.quantity;
    });
    cartTotalSpan.textContent = total;
}

function addItemToCart(item, quantity) {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ ...item, quantity });
    }
    updateCart();
}

function updateCartItemQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        cart.splice(index, 1); // Remove if quantity is 0 or less
    } else {
        cart[index].quantity = newQuantity;
    }
    updateCart();
}

function deleteCartItem(index) {
    cart.splice(index, 1);
    updateCart();
}

// --- Quantity Modal Logic ---

increaseQuantityButton.addEventListener('click', () => {
    currentQuantity++;
    quantityDisplay.textContent = currentQuantity;
});

decreaseQuantityButton.addEventListener('click', () => {
    if (currentQuantity > 1) {
        currentQuantity--;
        quantityDisplay.textContent = currentQuantity;
    }
});

confirmQuantityButton.addEventListener('click', () => {
    if (editingCartItemIndex > -1) {
        updateCartItemQuantity(editingCartItemIndex, currentQuantity);
        editingCartItemIndex = -1; // Reset
    } else {
        addItemToCart(selectedMenuItem, currentQuantity);
    }
    hideModal(quantityModal);
});

// --- Cart Item Modal Logic ---

editQuantityButton.addEventListener('click', () => {
    hideModal(cartItemModal);
    const itemToEdit = cart[editingCartItemIndex];
    selectedMenuItem = itemToEdit; // Set for quantity modal
    quantityModalItemName.textContent = itemToEdit.name;
    currentQuantity = itemToEdit.quantity;
    quantityDisplay.textContent = currentQuantity;
    showModal(quantityModal);
});

deleteItemButton.addEventListener('click', () => {
    hideModal(cartItemModal);
    showModal(confirmDeleteModal); // Use confirmDeleteModal for item deletion confirmation
    confirmDeleteButton.onclick = () => {
        deleteCartItem(editingCartItemIndex);
        editingCartItemIndex = -1; // Reset
        hideModal(confirmDeleteModal);
    };
});

// --- Checkout and Payment Logic ---

checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('カートに商品がありません。');
        return;
    }
    paymentTotalSpan.textContent = cartTotalSpan.textContent;
    amountPaid = 0;
    amountPaidDisplay.textContent = amountPaid;
    showModal(paymentModal);
});

function createNumericKeypad() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'C'];
    keys.forEach(key => {
        const button = document.createElement('button');
        button.textContent = key;
        if (key === '00') {
            button.classList.add('zero');
        }
        button.addEventListener('click', () => {
            if (key === 'C') {
                amountPaid = 0;
            } else if (key === '00') {
                amountPaid = amountPaid * 100;
            } else {
                amountPaid = amountPaid * 10 + parseInt(key);
            }
            amountPaidDisplay.textContent = amountPaid;
        });
        numericKeypad.appendChild(button);
    });
}

confirmPaymentButton.addEventListener('click', async () => {
    const total = parseInt(cartTotalSpan.textContent);
    if (amountPaid < total) {
        alert('お預かり金額が不足しています。');
        return;
    }

    const change = amountPaid - total;

    receiptTotalSpan.textContent = total;
    receiptPaidSpan.textContent = amountPaid;
    receiptChangeSpan.textContent = change;

    hideModal(paymentModal);
    showModal(receiptModal);

    
});

checkButton.addEventListener('click', () => {
    hideModal(receiptModal);
    customerCheckTotal.textContent = receiptTotalSpan.textContent;
    customerCheckPaid.textContent = receiptPaidSpan.textContent;
    customerCheckChange.textContent = receiptChangeSpan.textContent;
    customerCheckItemList.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} x ${item.quantity} - ¥${item.price} (${item.quantity}個) = ¥${item.price * item.quantity}`;
        customerCheckItemList.appendChild(li);
    });
    customerCheckOverlay.classList.remove('hidden');
    redoButton.classList.remove('hidden'); // Show redo button
});

customerCheckContainer.addEventListener('click', async () => {
    customerCheckOverlay.classList.add('hidden');
    redoButton.classList.add('hidden'); // Hide redo button

    // Record sales data
    const total = parseInt(receiptTotalSpan.textContent);
    const today = getFormattedDate(new Date());
    if (!salesData[today]) {
        salesData[today] = {
            totalSales: 0,
            items: [],
            weather: null,
            memo: ''
        };
        // Fetch weather only for the first sale of the day
        console.log(`Attempting to fetch weather for ${today}`);
    await fetchWeatherForToday(today);
    }
    salesData[today].totalSales += total;
    cart.forEach(item => salesData[today].items.push(item));
    saveSalesData();

    cart = []; // Clear cart after successful transaction
    updateCart();
});

// Prevent clicks on the overlay itself from closing it
customerCheckOverlay.addEventListener('click', (event) => {
    event.stopPropagation();
});

redoButton.addEventListener('click', () => {
    customerCheckOverlay.classList.add('hidden');
    redoButton.classList.add('hidden'); // Hide redo button
    // Do not clear cart, return to receipt modal
    showModal(receiptModal);
});

// --- Sales Report Logic ---

salesReportButton.addEventListener('click', () => {
    showModal(salesModal);
    // Ensure calendar view is shown and daily sales view is hidden when opening sales modal
    dailySalesView.classList.add('hidden');
    calendarView.parentElement.classList.remove('hidden');
    monthNameSpan.parentElement.classList.remove('hidden');
    renderCalendar(currentCalendarDate);
});

prevMonthButton.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarDate);
});

nextMonthButton.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarDate);
});

function renderCalendar(date) {
    calendarView.innerHTML = '';
    monthNameSpan.textContent = date.toLocaleString('ja-JP', { year: 'numeric', month: 'long' });

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

    // Add day headers
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    dayNames.forEach(day => {
        const div = document.createElement('div');
        div.classList.add('day-header');
        div.textContent = day;
        calendarView.appendChild(div);
    });

    // Fill leading empty days
    for (let i = 0; i < startDay; i++) {
        calendarView.appendChild(document.createElement('div'));
    }

    // Fill days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dayDiv = document.createElement('div');
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
        const formattedDate = getFormattedDate(currentDate);
        dayDiv.textContent = i;

        if (salesData[formattedDate] && salesData[formattedDate].totalSales > 0) {
            dayDiv.classList.add('has-sales');
            const salesSpan = document.createElement('span');
            salesSpan.style.fontSize = '0.8em';
            salesSpan.style.display = 'block';
            salesSpan.textContent = `¥${salesData[formattedDate].totalSales}`;
            dayDiv.appendChild(salesSpan);
        }

        dayDiv.addEventListener('click', () => {
            displayDailySales(formattedDate);
        });
        calendarView.appendChild(dayDiv);
    }
}

function displayDailySales(date) {
    dailySalesView.classList.remove('hidden');
    calendarView.parentElement.classList.add('hidden'); // Hide calendar
    monthNameSpan.parentElement.classList.add('hidden'); // Hide calendar header

    dailyViewDate.textContent = date;
    const data = salesData[date];

    if (data) {
        dailyTotalInput.value = data.totalSales;
        dailyItemList.innerHTML = '';

        const aggregatedItems = {};
        data.items.forEach(item => {
            if (aggregatedItems[item.name]) {
                aggregatedItems[item.name].quantity += item.quantity;
            } else {
                aggregatedItems[item.name] = { ...item };
            }
        });

        for (const itemName in aggregatedItems) {
            const item = aggregatedItems[itemName];
            const li = document.createElement('li');
            li.textContent = `${item.name} x ${item.quantity}個 - ¥${item.price * item.quantity}`;
            dailyItemList.appendChild(li);
        }

        console.log('Sales data for current date:', data);
        weatherInfo.textContent = data.weather ? `天気: ${data.weather.description}, 気温: ${data.weather.temp}°C` : '天気情報なし';
        console.log('Weather info displayed:', weatherInfo.textContent);
        dailyMemo.value = data.memo || '';
    } else {
        dailyTotalInput.value = '0';
        dailyItemList.innerHTML = '<li>売上なし</li>';
        weatherInfo.textContent = '天気情報なし';
        dailyMemo.value = '';
    }
}

saveTotalButton.addEventListener('click', () => {
    const date = dailyViewDate.textContent;
    const newTotal = parseInt(dailyTotalInput.value);
    if (salesData[date]) {
        salesData[date].totalSales = newTotal;
        saveSalesData();
        alert('合計売上を保存しました。');
        renderCalendar(currentCalendarDate); // Update calendar view with new total
    }
});

resetDailySalesButton.addEventListener('click', () => {
    const date = dailyViewDate.textContent;
    if (confirm(`本当に${date}の売上データをリセットしますか？`)) {
        delete salesData[date]; // Remove the entire day's data
        saveSalesData();
        alert(`${date}の売上データをリセットしました。`);
        // Clear display and go back to calendar
        dailyTotalInput.value = '0';
        dailyItemList.innerHTML = '<li>売上なし</li>';
        weatherInfo.textContent = '天気情報なし';
        dailyMemo.value = '';
        dailySalesView.classList.add('hidden');
        calendarView.parentElement.classList.remove('hidden');
        monthNameSpan.parentElement.classList.remove('hidden');
        renderCalendar(currentCalendarDate); // Re-render calendar to reflect reset
    }
});

backToCalendarButton.addEventListener('click', () => {
    dailySalesView.classList.add('hidden');
    calendarView.parentElement.classList.remove('hidden'); // Show calendar
    monthNameSpan.parentElement.classList.remove('hidden'); // Show calendar header
    renderCalendar(currentCalendarDate); // Re-render calendar to update any memo changes
});

// --- Weather API Integration ---

async function fetchWeatherForToday(date) {
    if (OPENWEATHER_API_KEY === 'YOUR_API_KEY' || OPENWEATHER_API_KEY === '') {
        console.warn('OpenWeatherMap API key is not set. Weather data will not be fetched.');
        return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${ONO_LAT}&lon=${ONO_LON}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`;
    console.log(`Fetching weather for ${date} from URL: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        console.log('Weather data fetched successfully:', data);
        if (salesData[date]) {
            salesData[date].weather = {
                description: data.weather[0].description,
                temp: data.main.temp
            };
            saveSalesData();
            console.log('Weather data saved to salesData:', salesData[date].weather);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// --- Back Button Logic ---
backButton.addEventListener('click', () => {
    if (currentModal) {
        if (currentModal === quantityModal && editingCartItemIndex > -1) {
            // If in quantity modal for editing, go back to cart item modal
            hideModal(quantityModal);
            showModal(cartItemModal);
        } else if (currentModal === paymentModal) {
            // From payment modal, go back to main screen (no specific modal to go back to)
            hideModal(paymentModal);
        } else if (currentModal === receiptModal) {
            // From receipt modal, go back to payment modal (if user wants to re-enter payment)
            // Or just close all modals and clear cart if transaction is considered complete
            hideModal(receiptModal);
            cart = []; // Clear cart if user backs out from receipt
            updateCart();
        } else if (currentModal === salesModal) {
            if (!dailySalesView.classList.contains('hidden')) {
                // If in daily sales view, go back to calendar view
                dailySalesView.classList.add('hidden');
                calendarView.parentElement.classList.remove('hidden');
                monthNameSpan.parentElement.classList.remove('hidden');
                renderCalendar(currentCalendarDate);
            } else {
                // From calendar view, close sales modal
                hideModal(salesModal);
            }
        } else if (currentModal === confirmDeleteModal) {
            // From confirm delete, go back to cart item modal
            hideModal(confirmDeleteModal);
            showModal(cartItemModal);
        } else if (currentModal === cartItemModal) {
            // From cart item modal, close it
            hideModal(cartItemModal);
        } else {
            // Default: just hide the current modal
            hideModal(currentModal);
        }
    }
});


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    loadSalesData();
    displayMenu();
    updateCart();
    createNumericKeypad();

    // Close modal buttons
    document.querySelectorAll('.close-modal-button').forEach(button => {
        button.addEventListener('click', (event) => {
            hideModal(event.target.closest('.modal'));
            editingCartItemIndex = -1; // Reset editing state
        });
    });
});
