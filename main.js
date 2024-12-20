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


// Rendera kundvagnen (detta används både på kundvagnssidan och order-sidan)
function renderCart() {
    const itemsContainer = document.querySelector('.items');
    const totalPriceElement = document.querySelector('.total .price');
    itemsContainer.innerHTML = ''; // Rensa kundvagnen

    // Loopar genom alla varor i kundvagnen
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('order-item');
        itemDiv.innerHTML = `
            <div>${item.name} - ${item.price} SEK</div>
            <div>
                <button class="update-quantity" data-name="${item.name}" data-change="-1">-</button>
                <span>${item.quantity} stycken</span> <!-- Visa antal varor -->
                <button class="update-quantity" data-name="${item.name}" data-change="1">+</button>
            </div>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    // Uppdatera totalpriset
    totalPriceElement.textContent = `Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} SEK`;

    // Lägg till event listeners för plus- och minus-knappar
    document.querySelectorAll('.update-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const name = event.target.getAttribute('data-name');
            const change = parseInt(event.target.getAttribute('data-change'));
            updateQuantity(name, change);
        });
    });
}

// Uppdatera kvantitet för en vara
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);  // Undvik negativ kvantitet
        renderCart(); // Uppdatera visningen
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


document.querySelector('.take-my-money').addEventListener('click', () => {
    // Visa cta-sektionen
    showSection('cta-section');  // Funktion för att visa rätt sektion

    // Lägg till en klass på body för att ändra bakgrundsfärgen
    document.body.classList.add('cta-active');
    document.body.classList.remove('menu-active'); // Se till att ta bort bakgrundsfärgen för menu

    // Dölja alla andra sektioner
    const otherSections = document.querySelectorAll('section:not(#cta-section)');
    otherSections.forEach(section => {
        section.style.display = 'none';
    });
});

// Funktion för att visa en specifik sektion
function showSection(sectionId) {
    // Dölj alla sektioner
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });

    // Visa den sektion som ska visas
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }

    // Reset bakgrundsfärg när vi byter till menu
    if (sectionId === 'menu') {
        document.body.classList.add('menu-active');
        document.body.classList.remove('cta-active'); // Ta bort bakgrund för CTA
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

