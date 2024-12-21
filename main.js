
const apiKey = "yum-vKkkQHqQboi7c6JF";
const apiUrl = "https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/menu";
const tenant = {
    name: 'mikaela',
    id: "tdfe",
};

let cart = [];

// Fetch menydata (GET)
async function fetchMenuData() {
        const options = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-zocom": apiKey,
            },
        };

        const foodResponse = await fetch(apiUrl + `?type=wonton`, options);
        const foodData = await foodResponse.json();

        const drinkResponse = await fetch(apiUrl + `?type=drink`, options);
        const drinkData = await drinkResponse.json();

        const dipResponse = await fetch(apiUrl + `?type=dip`, options);
        const dipData = await dipResponse.json();

        console.log(foodData, drinkData, dipData);
}
fetchMenuData();

// Skicka beställning (POST) och returnera order-ID
async function sendOrder() {
        const itemsToOrder = cart.map(item => ({
            id: Date.now(), 
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        const orderValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const timestamp = new Date().toISOString();
        const eta = new Date(new Date().getTime() + 30 * 60000).toISOString(); 

        const orderData = {
            description: "Beställning från kundvagnen",
            items: itemsToOrder,
            orderValue,
            timestamp,
            eta,
            state: "waiting"
        };

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-zocom": apiKey
            },
            body: JSON.stringify(orderData)
        };

        const response = await fetch(`https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/orders`, options);
        const responseData = await response.json();
        console.log("Beställning skickad:", responseData);

        // Förutsatt att order-ID finns i svar
        if (responseData && responseData.id) {
            const orderId = responseData.id;
            console.log("Order-ID:", orderId);
            
            renderOrderId(responseData);
        }
}

async function fetchOrders() {
    try {
        const response = await fetch(`https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/${tenant.id}/orders`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-zocom": apiKey,
            },
        });
        const responseData = await response.json();

        if (response.ok) {
            console.log("Hämtade beställningar:", responseData);
            renderOrderId(responseData); // Skicka data till render-funktionen
        } else {
            console.error("Fel vid hämtning av beställningar:", responseData);
        }
    } catch (error) {
        console.error("Nätverks- eller API-fel:", error);
    }
}

// Hämta orderdata med ett specifikt ID (GET)
async function fetchOrderById(orderId) {
        const response = await fetch(`https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/tdfe/orders/${orderId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-zocom": apiKey,
            }
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log(responseData);
            renderOrderId(responseData); 
        } else {
            console.error("Fel vid hämtning av orderdata:", responseData);
        }
}

function renderOrderId(orderData) {
    const orderIdSpan = document.querySelector('.OrderId');
    
    if (!orderIdSpan) {
        console.error('Elementet .OrderId hittades inte i DOM.');
        return;
    }

    if (orderData.orders && orderData.orders.length > 0) {
        const firstOrderId = orderData.orders[0].id;
        orderIdSpan.textContent = `#${firstOrderId}`; // Uppdatera textinnehållet
        console.log("Första order-ID renderat:", firstOrderId);
    } else {
        console.error('Inga beställningar hittades i orderData:', orderData);
    }
}
// Hitta menyobjekt baserat på namn
function getMenuItemByName(name, foodData, drinkData, dipData) {
    const allMenuItems = [...foodData, ...drinkData, ...dipData]; 
    return allMenuItems.find(item => item.name === name) || {};
}

// Lägg till vara i kundvagnen
function addItemToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1; //+antal, vid flera tryck
    } else {
        cart.push({ name, price, quantity: 1 }); 
    }
    renderCart(); 
}

function renderCart() {
    const itemsContainer = document.querySelector('.items');
    const totalPriceElement = document.querySelector('.total .price');
    itemsContainer.innerHTML = ''; 

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('order-items');
        itemDiv.innerHTML = `
            <div class="items-details">
                <div class="items-header">
                    <div class="items-name">${item.name}</div>
                    <div class="items-price">${item.price} SEK</div>
                </div>
                <div class="quantity">
                    <button class="update-quantity" data-name="${item.name}" data-change="-1">-</button>
                    <span>${item.quantity} stycken</span>
                    <button class="update-quantity" data-name="${item.name}" data-change="1">+</button>
                </div>
            </div>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    // Beräkna och visa totalpriset
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPriceElement.textContent = `${totalPrice.toFixed(2)} SEK`; 
}

// Hämta plus- och minus knappar
document.querySelector('.items').addEventListener('click', (event) => {
    if (event.target.classList.contains('update-quantity')) {
        const name = event.target.getAttribute('data-name');
        const change = parseInt(event.target.getAttribute('data-change'));
        updateQuantity(name, change);
    }
});

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change); 
        renderCart(); 
    }
}

// Funktion för att visa order
function renderOrderConfirmation(responseData) {
    console.log("Orderbekräftelse:", responseData);
    
}

document.querySelectorAll('.food-button').forEach(button => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    if (name && !isNaN(price)) {
        button.addEventListener('click', () => {
            addItemToCart(name, price); 
        });
    } else {
        console.error("Ogiltiga data för varan:", name, price);
    }
});

document.querySelectorAll('.dip-button').forEach(button => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    if (name && !isNaN(price)) {
        button.addEventListener('click', () => {
            addItemToCart(name, price); 
        });
    } else {
        console.error("Ogiltiga data för dip:", name, price);
    }
});

document.querySelectorAll('.drink-button').forEach(button => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    if (name && !isNaN(price)) {
        button.addEventListener('click', () => {
            addItemToCart(name, price); 
        });
    } else {
        console.error("Ogiltiga data för dryck:", name, price);
    }
});

document.querySelector('.take-my-money').addEventListener('click', () => {
    
    showSection('cta-section');  

    document.body.classList.add('cta-active');
    document.body.classList.remove('menu-active');

    const otherSections = document.querySelectorAll('section:not(#cta-section)');
    otherSections.forEach(section => {
        section.style.display = 'none';
    });
});

// Funktion för att visa en specifik sektion
function showSection(sectionId) {
    
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });

    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }

    if (sectionId === 'menu') {
        document.body.classList.add('menu-active');
        document.body.classList.remove('cta-active'); 
    }
}


document.querySelector('.btn').addEventListener('click', () => showSection('orderb'));
document.querySelector('.order').addEventListener('click', () => showSection('menu'));
document.querySelector('.btn-n').addEventListener('click', () => showSection('menu'));
document.querySelector('.take-my-money').addEventListener('click', () => showSection('cta-section'));

// Event listener för att skicka ordern ***sendOrder,
document.querySelector('#cartButton').addEventListener('click', fetchOrders);

//felmeddelande kvitto
const kvittoButton = document.querySelector('.kvitto');
const errorMessage = document.querySelector('.error-message');

kvittoButton.addEventListener('click', () => {
    
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
});

//tömma varukorgen
document.querySelector('#newOrderButton').addEventListener('click', () => {
    cart = [];
    renderCart();
    showSection('menu'); 
});

