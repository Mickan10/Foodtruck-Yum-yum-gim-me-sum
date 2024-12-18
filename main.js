
//Funktion för att byta sektion
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

//
function setupSectionListeners() {
    document.querySelector('.btn').addEventListener('click', () => showSection('orderb'));
    document.querySelector('.take-my-money').addEventListener('click', () => showSection('cta-section'));
    document.querySelector('.order').addEventListener('click', () => showSection('menu'));
    document.querySelector('.btn-n').addEventListener('click', () => showSection('menu'));
}

//API-funktioner
const apiKey = "yum-vKkkQHqQboi7c6JF";
const apiUrl = "https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com";

async function fetchMenu(type) {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "x-zocom": apiKey
        }
    };

    const response = await fetch(`${apiUrl}/menu?type=${type}`, options);
    return response.json();
}


//Varukorgsfunktioner
let cart = [];

const itemsContainer = document.querySelector('.items');
const totalPriceElement = document.querySelector('.total span:last-child');

function addItemToCart(name, price) {
    cart.push({ name, price });
    renderCart();
}

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

function updateQuantity(index, change) {
    const quantityElement = itemsContainer.querySelectorAll('.quantity-count')[index];
    let quantity = parseInt(quantityElement.textContent, 10);
    quantity = Math.max(1, quantity + change);
    quantityElement.textContent = quantity;
    updateTotalPrice();
}

function updateTotalPrice() {
    const total = cart.reduce((sum, item, index) => {
        const quantity = parseInt(itemsContainer.querySelectorAll('.quantity-count')[index].textContent, 10);
        return sum + item.price * quantity;
    }, 0);
    totalPriceElement.textContent = `${total} SEK`;
}

//Event listeners för matknappar
function setupFoodButtonListeners() {
    document.querySelectorAll('.food-button').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.querySelector('.item-name').textContent.trim();
            const price = parseInt(button.querySelector('.item-price').textContent.trim().replace(' SEK', ''), 10);
            addItemToCart(name, price);
        });
    });

    document.querySelectorAll('.add-dip').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseInt(button.getAttribute('data-price'), 10);
            addItemToCart(name, price);
        });
    });

    document.querySelectorAll('.drink-button').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseInt(button.getAttribute('data-price'), 10);
            addItemToCart(name, price);
        });
    });
}

//kika på!!!
function init() {
    setupSectionListeners();
    setupFoodButtonListeners();
    fetchAllMenus();
}


init();