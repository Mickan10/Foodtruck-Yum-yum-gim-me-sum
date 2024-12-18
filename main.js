const apiKey = "yum-vKkkQHqQboi7c6JF";
const apiUrl = "https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/menu";
const tenant = {
    name: 'mikaela',
    id: "tdfe"
};

// För att spara id och mat-lista
let OrderId = "";
let cart = [];

// Funktion för att hämta data api
async function fetchMenuData() {
    const options = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            "x-zocom": apiKey,
        },
    };
    
        const foodResponse = await fetch(apiUrl + "?type=wonton", options);
        const foodData = await foodResponse.json();

        const drinkResponse = await fetch(apiUrl + "?type=drink", options);
        const drinkData = await drinkResponse.json();

        const dipResponse = await fetch(apiUrl + "?type=dip", options);
        const dipData = await dipResponse.json();

        renderMenuItems(foodData, dipData, drinkData);
}

// Funktion som tar API-data och lägger i listor
function renderMenuItems(foodData, dipsData, drinksData) {
    const foodContainer = document.querySelector('.food-button');
    const dipsContainer = document.querySelector('.dips .frame10');
    const drinksContainer = document.querySelector('.drinks .frame7');

    // Rendera mat
    if (foodData && foodData.food) {
        foodData.food.forEach(item => {
            const button = document.createElement('button');
            button.classList.add('food-button');
            button.setAttribute('data-name', item.name);
            button.setAttribute('data-price', item.price);
            button.innerHTML = `
                <div class="name-price">
                    <p class="item-name">${item.name}</p>
                    <div class="line"></div>
                    <p class="item-price">${item.price} SEK</p>
                </div>
                <p class="ingredients">${item.ingredients}</p>
            `;
            button.addEventListener('click', () => addItemToCart(item.name, item.price));
            foodContainer.appendChild(button);
        });
    }

    // Rendera dips
    if (dipsData && dipsData.dips) {
        dipsData.dips.forEach(dip => {
            const button = document.createElement('button');
            button.classList.add('add-dip');
            button.setAttribute('data-name', dip.name);
            button.setAttribute('data-price', dip.price);
            button.textContent = dip.name;
            button.addEventListener('click', () => addItemToCart(dip.name, dip.price));
            dipsContainer.appendChild(button);
        });
    }

    // Rendera drycker
    if (drinksData && drinksData.drinks) {
        drinksData.drinks.forEach(drink => {
            const button = document.createElement('button');
            button.classList.add('drink-button');
            button.setAttribute('data-name', drink.name);
            button.setAttribute('data-price', drink.price);
            button.textContent = drink.name;
            button.addEventListener('click', () => addItemToCart(drink.name, drink.price));
            drinksContainer.appendChild(button);
        });
    }
}

//hämtningen av menydata
fetchMenuData();

// Funktion för att växla sektion
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

document.querySelector('.btn').addEventListener('click', () => showSection('orderb'));
document.querySelector('.take-my-money').addEventListener('click', () => showSection('cta-section'));
document.querySelector('.order').addEventListener('click', () => showSection('menu'));
document.querySelector('.btn-n').addEventListener('click', () => showSection('menu'));

// Element för att visa kundvagnen och totalpriset
const itemsContainer = document.querySelector('.items');
const totalPriceElement = document.querySelector('.total .price');

// Funktion för att lägga till en vara i kundvagnen
function addItemToCart(name, price) {
    cart.push({ name, price });
    renderCart();
}

// Funktion för att visa valda objekt i orderb
function renderCart() {
    itemsContainer.innerHTML = '';
    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('order-item');
        itemDiv.innerHTML = `
            <div>${item.name} <span>${item.price} SEK</span></div>
            <div class="quantity">
                <button class="decrease-btn" data-index="${index}">-</button>
                <span class="quantity-count">1</span>
                <button class="increase-btn" data-index="${index}">+</button>
            </div>
        `;
        itemsContainer.appendChild(itemDiv);

        itemDiv.querySelector('.decrease-btn').addEventListener('click', () => updateQuantity(index, -1));
        itemDiv.querySelector('.increase-btn').addEventListener('click', () => updateQuantity(index, 1));
    });

    updateTotalPrice();
}

// Uppdatera antal och pris
function updateQuantity(index, change) {
    const quantityElement = itemsContainer.querySelectorAll('.quantity-count')[index];
    let quantity = parseInt(quantityElement.textContent, 10);

    quantity = Math.max(1, quantity + change);
    quantityElement.textContent = quantity;

    updateTotalPrice();
}

// Uppdatera det totala priset
function updateTotalPrice() {
    const total = cart.reduce((sum, item, index) => {
        const quantity = parseInt(itemsContainer.querySelectorAll('.quantity-count')[index].textContent, 10);
        return sum + item.price * quantity;
    }, 0);
    totalPriceElement.textContent = `${total} SEK`;
}