const apiKey = "yum-vKkkQHqQboi7c6JF";
const apiUrl = "https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/menu";
const tenant = {
    name: 'mikaela',
    id: "tdfe",
};

let cart = [];

// Fetch menydata (GET)
async function fetchMenuData() {
    try {
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
    } catch (error) {
        console.error("Fel vid hämtning av menydata:", error);
    }
}
fetchMenuData();

// Skicka beställning (POST) och returnera order-ID
async function sendOrder() {
    try {
        const itemsToOrder = cart.map(item => ({
            id: Date.now(),  // Använd unikt ID för varje artikel
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        const orderValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const timestamp = new Date().toISOString();
        const eta = new Date(new Date().getTime() + 30 * 60000).toISOString();  // ETA 30 minuter från nu

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
            
            // Här kan vi spara eller vidarebefordra order-ID till nästa steg
            renderOrderId(responseData); // Rendera order-ID på sidan
        }

    } catch (error) {
        console.error("Fel vid skickande av beställning:", error);
    }
}

// Hämta beställningar (GET)
async function fetchOrders() {
    try {
        const response = await fetch(`https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/${tenant.id}/orders`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-zocom": apiKey,
            }
        });
        const responseData = await response.json();

        if (response.ok) {
            console.log("Hämtade beställningar:", responseData);
            // Rendera eller bearbeta orderdata om det behövs
        } else {
            console.error("Fel vid hämtning av beställningar:", responseData);
        }
    } catch (error) {
        console.error("Fel vid GET-förfrågan:", error);
    }
}

// Hämta orderdata med ett specifikt ID (GET)
async function fetchOrderById(orderId) {
    try {
        const response = await fetch(`https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/tdfe/orders/${orderId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-zocom": apiKey,
            }
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log("Hämtade order med ID:", responseData);
            renderOrderId(responseData);  // Rendera order-ID
        } else {
            console.error("Fel vid hämtning av orderdata:", responseData);
        }
    } catch (error) {
        console.error("Fel vid GET-förfrågan:", error);
    }
}

// Funktion för att rendera order-ID
function renderOrderId(orderData) {
    const orderIdSpan = document.querySelector('.OrderId');
    if (orderData && orderData.id) {
        orderIdSpan.textContent = `#${orderData.id}`;  // Sätt order-ID:t i span
    } else {
        orderIdSpan.textContent = 'Order-ID ej tillgängligt';
    }
}

// Hitta menyobjekt baserat på namn
function getMenuItemByName(name, foodData, drinkData, dipData) {
    const allMenuItems = [...foodData, ...drinkData, ...dipData]; // Sammanfoga alla menyobjekt
    return allMenuItems.find(item => item.name === name) || {}; // Returnera objektet eller ett tomt objekt om ej hittat
}

// Lägg till vara i kundvagnen
function addItemToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1; // Om varan redan finns, öka kvantiteten
    } else {
        cart.push({ name, price, quantity: 1 }); // Lägg till ny vara
    }
    renderCart(); // Uppdatera kundvagnen
}

// Rendera kundvagnen
function renderCart() {
    const itemsContainer = document.querySelector('.items');
    const totalPriceElement = document.querySelector('.total .price');
    itemsContainer.innerHTML = ''; // Rensa kundvagnen

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('order-item');
        itemDiv.innerHTML = `
            <div>${item.name} - ${item.price} SEK x ${item.quantity}</div>
            <div>
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    totalPriceElement.textContent = `Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} SEK`;
}

// Uppdatera kvantitet för en vara
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);  // Undvik negativ kvantitet
        renderCart();
    }
}

// Funktion för att visa orderbekräftelse
function renderOrderConfirmation(responseData) {
    console.log("Orderbekräftelse:", responseData);
    // Här kan du lägga till logik för att rendera bekräftelsen på UI:et.
}

// Lyssna på klick på de fördefinierade knapparna för mat, dips och drycker
document.querySelectorAll('.food-button').forEach(button => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    if (name && !isNaN(price)) {
        button.addEventListener('click', () => {
            addItemToCart(name, price); // Lägg till artikel i kundvagnen
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
            addItemToCart(name, price); // Lägg till artikel i kundvagnen
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
            addItemToCart(name, price); // Lägg till artikel i kundvagnen
        });
    } else {
        console.error("Ogiltiga data för dryck:", name, price);
    }
});

// Funktion för att växla mellan sektioner
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

document.querySelector('.btn').addEventListener('click', () => showSection('orderb'));
document.querySelector('.order').addEventListener('click', () => showSection('menu'));
document.querySelector('.btn-n').addEventListener('click', () => showSection('menu'));
document.querySelector('.take-my-money').addEventListener('click', () => showSection('cta-section'));

// Event listener för att skicka ordern ***sendOrder,
document.querySelector('#cartButton').addEventListener('click', fetchOrders);
