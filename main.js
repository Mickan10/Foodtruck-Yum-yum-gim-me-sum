
/* "key": "yum-vKkkQHqQboi7c6JF" */

//get hämtar menyer, header håller nyckeln
const options = {
    method: 'GET',
    headers: {
        'x-api-key': yum-vKkkQHqQboi7c6JF 
    }
}

//skapar knappar
const ApiKey = document.querySelector('#button-api-key')
const Tenant = document.querySelector('#button-tenant')

const apiUrl = '  https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/ '
const apiKey = 'yum-vKkkQHqQboi7c6JF' 

//när användaren trycker, körs denna funktion, skicka en ny order
ApiKey.addEventListener('click', async () => {
	const options = {
		method: 'POST'
	}
	const response = await fetch(apiUrl + '/keys', options)
	const data = await response.json()
	console.log('API-nyckel data:', data)
})

//fetch för att skicka GET o POST
Tenant.addEventListener('click', async  () => {
	const options = {

	}
	const response = await fetch(apiUrl + '/tenants', options)
	const data = await response.json()
	console.log('Tenant: ', data)
})


//för att lägga till produkter i ordern
const itemsContainer = document.querySelector('.iteams'); 
const foodButtons = document.querySelectorAll('.food-button');
const dipButtons = document.querySelectorAll('.add-dip');
const drinkButtons = document.querySelectorAll('.drink-button');

// En funktion för att lägga till en produkt till ordern
function addItemToCart(name, price) 
{
    
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('cart-item'); 
    itemDiv.innerHTML = `<p>${name} - ${price} SEK</p>`;

    // Lägg till produkten i varukorgen
    itemsContainer.appendChild(itemDiv);
}

// Lägg till event för matknappar
foodButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.querySelector('.item-name').innerText;
        const price = button.querySelector('.item-price').innerText.split(' ')[0];
        addItemToCart(name, price);
    });
});

// Lägg till event för dipknappar
dipButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        addItemToCart(name, price);
    });
});

// Lägg till event listeners för dryckesknappar
drinkButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price').split(' ')[0];
        addItemToCart(name, price);
    });
});

//try - catch?
try {
    const response = await fetch(apiUrl + '/tenants', options);
    const data = await response.json();
    console.log('Tenant: ', data);
} 

catch (error) {
    console.error('Ett fel', error);
}