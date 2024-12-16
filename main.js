// Funktion för att visa en specifik sektion
function showSection(sectionId) {
    // Göm alla sektioner
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });

    // Visa den angivna sektionen
    document.getElementById(sectionId).style.display = 'block';
}

// Knapp klick för att visa orderbekräftelse
document.querySelector('.btn').addEventListener('click', function () {
    showSection('orderb');
});

// Knapp klick för att visa CTA
document.querySelector('.take-my-money').addEventListener('click', function () {
    showSection('cta-section');
});

// Knapp klick för att återgå till menyn
document.querySelector('.order').addEventListener('click', function () {
    showSection('menu');
});

// Från order till meny
document.querySelector('.btn-n').addEventListener('click', function () {
    showSection('menu');
});


//api osv
const apiKey = "yum-vKkkQHqQboi7c6JF";
const url = "https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/tenants"

const tenant = 
{
    name: 'mikaela'
}

const options = 
{
    method: 'POST',
    headers: {
        "Content-Type": 'application/json', 
        "accept": "application/json",
        "x-zocom": apiKey,
    }
}





// Array för att lagra valda produkter
let cart = [];

// Element för att visa varukorgen och totalpris
const itemsContainer = document.querySelector('.items');
const totalPriceElement = document.querySelector('.total span:last-child');

// Funktion för att lägga till en produkt i varukorgen
function addItemToCart(name, price) {
    cart.push({ name, price });
    renderCart();
}

// Funktion för att rendera varukorgen
function renderCart() {
    itemsContainer.innerTEXT = ''; // Rensa innehållet

    // Lägg till varje produkt i cart till varukorgen
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

        // Kvantitetskontroll
        itemDiv.querySelector('.decrease-btn').addEventListener('click', () => updateQuantity(index, -1));
        itemDiv.querySelector('.increase-btn').addEventListener('click', () => updateQuantity(index, 1));
    });

    updateTotalPrice();
}

// Funktion för att uppdatera kvantitet och totalpris
function updateQuantity(index, change) {
    const quantityElement = itemsContainer.querySelectorAll('.quantity-count')[index];
    let quantity = parseInt(quantityElement.textContent, 10);

    quantity = Math.max(1, quantity + change); // Minsta kvantitet är 1
    quantityElement.textContent = quantity;

    updateTotalPrice();
}

// Funktion för att uppdatera totalpriset
function updateTotalPrice() {
    const total = cart.reduce((sum, item, index) => {
        const quantity = parseInt(itemsContainer.querySelectorAll('.quantity-count')[index].textContent, 10);
        return sum + item.price * quantity;
    }, 0);
    totalPriceElement.textContent = `${total} SEK`;
}

// Event listeners för matknappar
document.querySelectorAll('.food-button').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.querySelector('.item-name').textContent.trim();
        const price = parseInt(button.querySelector('.item-price').textContent.trim().replace(' SEK', ''), 10);
        addItemToCart(name, price);
    });
});

// Event listeners för dipknappar
document.querySelectorAll('.add-dip').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'), 10);
        addItemToCart(name, price);
    });
});

// Event listeners för dryckesknappar
document.querySelectorAll('.drink-button').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'), 10);
        addItemToCart(name, price);
    });
});
