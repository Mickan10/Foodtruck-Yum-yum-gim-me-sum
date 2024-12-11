
/* "key": "yum-vKkkQHqQboi7c6JF" */
const apiKey = "yum-vKkkQHqQboi7c6JF";
const apiUrl = '  https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com '

const tenant =
{
    
    "name": "zocom",
    "id": "a2f4" 
}

//get hämtar menyer, header håller nyckeln
const options = 
{
    method: 'GET',
    headers: 
    {
        "Content-type": 'application/json',
        accept: "application/json",
        "x-zocom": apiKey,
    },    
}

//skapar knappar
const ApiKey = document.querySelector('#button-api-key')
const Tenant = document.querySelector('#button-tenant')

//när användaren trycker, körs denna funktion, skicka en ny order
apiKey.addEventListener('click', async () => {
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
console.log('test', itemsContainer, foodButtons, dipButtons, drinkButtons)
// En funktion för att lägga till en produkt till ordern
/*function addItemToCart(name, price) 
{
    
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('cart-item'); 
    itemDiv.innerText = `<p>${name} - ${price} SEK</p>`;

    // Lägg till produkten i varukorgen
    itemsContainer.appendChild(itemDiv);
} */

// Lägg till event för matknappar
foodButtons.forEach(button => {
    console.log('food-button')
    button.addEventListener('click', () => {
        const name = button.querySelector('.item-name');
        const price = button.querySelector('.item-price');
        console.log('klickade-menu-iteam', name, price)
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

//dryckesknappar
drinkButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        addItemToCart(name, price);
    });
});


