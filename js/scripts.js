'use strict'

const headerCityButton = document.querySelector('.header__city-button');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');
//берем хеш и обрезаем решотку
let hash = location.hash.substring(1);

headerCityButton.textContent = localStorage.getItem('city-location') ? localStorage.getItem('city-location') : 'Ваш город?';

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите Ваш город!');
  headerCityButton.textContent = city;
  localStorage.setItem('city-location', city);
});

const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lamoda')) || [];
const setLocalStorage = data => localStorage.setItem('cart-lamoda', JSON.stringify(data));

//реализация корзины
const renderCard = () => {
  cartListGoods.textContent = '';

  const cardItem = getLocalStorage();

  let totalPrice = 0;

  cardItem.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.classList.add('selector')
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.brand} ${item.name}</td>
        ${item.color ? `<td>${item.color}</td>` : `<td>-</td>`}
        ${item.sizes ? `<td>${item.sizes}</td>` : `<td>-</td>`}
        <td>${item.cost} &#8381;</td>
        <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
    `;

    totalPrice += item.cost;

    cartListGoods.append(tr);
  });
  cartTotalCost.textContent = totalPrice + ' руб';
};

const deleteItemCart = id => {

  const cartItem = getLocalStorage();

  cartItem.splice(id - 1, 1);

  setLocalStorage(cartItem);
};

cartListGoods.addEventListener('click', event => {
  const target = event.target;
  if (target.matches('.btn-delete')) {
    const tr = target.closest('.selector');
    const td = tr.querySelectorAll('td');
    deleteItemCart(td[0].textContent);
    renderCard();
  }
})

//блокировка скрола  //можно через document.body.style.overflow = 'hidden'? а потом ''
const disableScroll = () => {
  //узнаем ширину страници и отнимаем ширину документа - так узнаем сколько ширина скрола
  const widthScroll = window.innerWidth - document.body.offsetWidth;
  //добавляем свойство dbScrollY в обьект document.body
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
  position:fixed;
  top:${-window.scrollY}px;
  left: 0;
  width: 100%;
  height: 100hv;
  overflow: hidden;
  padding-right: ${widthScroll}px`;
};

const enableScroll = () => {
  document.body.style.cssText = '';
  //прокручивает окно на 200 пкселей
  /* window.scroll({
    top: '200'
  }) */

  window.scroll({
    top: document.body.dbScrollY
  });
};

//модальное окно
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

function openModal() {
  cartOverlay.classList.add('cart-overlay-open');
  document.addEventListener('keydown', escapeHandler);
  disableScroll();
  renderCard();
}
function closeModal() {
  cartOverlay.classList.remove('cart-overlay-open');
  document.removeEventListener('keydown', escapeHandler);
  enableScroll();
}
function escapeHandler(event) {
  if (event.code === 'Escape') {
    closeModal();
  }
}

//запрос данных 
const getData = async () => {
  const data = await fetch('db.json');

  if (data.ok) {
    return data.json()
  } else {
    throw new Error(`Данные не были полученны ошибка: ${data.status} ${data.statusText}`)
  }
};

const getGoods = (callback, prop, value) => {
  getData()
    .then(data => {
      if (value) {
        //будут возвращатся только те кторые соответствуют хешу
        callback(data.filter(item => item[prop] === value)
        );
      } else {
        callback(data);
      }
    })
    .catch(err => {
      console.error(err);
    });
};

subheaderCart.addEventListener('click', openModal);

cartOverlay.addEventListener('click', event => {
  const target = event.target;
  if (target.classList.contains('cart-overlay-open') || target.matches('.cart__btn-close')) {
    closeModal();
  }
});

try {
  const goodsList = document.querySelector('.goods__list');
  if (!goodsList) {
    throw 'this is not a goods page!';
  }

  const category = () => {
    const goodsTitle = document.querySelector('.goods__title');
    goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
    /* if (str === 'men') {
        goodsTitle.textContent = 'Мужчинам';
      }
      if (str === 'women') {
        goodsTitle.textContent = 'Женщинам';
      }
      if (str === 'kids') {
        goodsTitle.textContent = 'Детям';
      } */
  }

  const createCard = data => {
    const li = document.createElement('li');
    li.classList.add('goods__item');

    li.innerHTML = `
    <article class="good">
        <a class="good__link-img" href="card-good.html#id${data.id}">
            <img class="good__img" src="goods-image/${data.preview}" alt="">
        </a>
        <div class="good__description">
            <p class="good__price">${data.cost} &#8381;</p>
            <h3 class="good__title">${data.brand} <span class="good__title__grey">/ ${data.name}</span></h3>
            ${data.sizes ?
        `<p class="good__sizes">Размеры (RUS): 
        <span class="good__sizes-list">${data.sizes.join(' ')}</span></p>` : ''}
            <a class="good__link" href="card-good.html#id${data.id}">Подробнее</a>
        </div>
    </article>
    `;
    return li;
  };

  const renderGoodsList = data => {

    goodsList.textContent = '';

    data.forEach(item => {
      const card = createCard(item);
      goodsList.append(card);
    });
  };
  //событие браузера изменение хеща
  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
    getGoods(renderGoodsList, 'category', hash);
    category();
  });

  category();
  getGoods(renderGoodsList, 'category', hash);

} catch (err) {
  console.warn(err);
}

//страница товара
try {

  if (!document.querySelector('.card-good')) {
    throw 'this is not a card-good page!';
  }

  const cardGoodImage = document.querySelector('.card-good__image');
  const cardGoodBrand = document.querySelector('.card-good__brand');
  const cardGoodTitle = document.querySelector('.card-good__title');
  const cardGoodPrice = document.querySelector('.card-good__price');
  const cardGoodColor = document.querySelector('.card-good__color');
  const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
  const cardGoodColorList = document.querySelector('.card-good__color-list');
  const cardGoodSizes = document.querySelector('.card-good__sizes');
  const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
  const cardGoodBuy = document.querySelector('.card-good__buy');

  const generateList = data => data.reduce((html, item, index) => html +
    `<li class="card-good__select-item" data-id="${index}">${item}</li>`, '');

  const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {

    const addData = { id, brand, name, cost };

    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${name}`;
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = name;
    cardGoodPrice.textContent = `${cost} руб`;
    if (color) {
      cardGoodColor.textContent = color[0];
      cardGoodBrand.dataset.id = 0;
      cardGoodColorList.innerHTML = generateList(color);
    } else {
      cardGoodColor.style.display = 'none';
    }
    if (sizes) {
      cardGoodSizes.textContent = sizes[0];
      cardGoodSizes.dataset.id = 0;
      cardGoodSizesList.innerHTML = generateList(sizes);
    } else {
      cardGoodSizes.style.display = 'none';
    }

    cardGoodBuy.addEventListener('click', event => {
      if (color) {
        addData.color = cardGoodColor.textContent;
      }
      if (sizes) {
        addData.sizes = cardGoodSizes.textContent;
      }

      const cardData = getLocalStorage();
      cardData.push(addData);
      setLocalStorage(cardData);
    });

  };
  cardGoodSelectWrapper.forEach(item => {
    item.addEventListener('click', e => {
      const target = e.target;
      if (target.closest('.card-good__select')) {
        target.classList.toggle('card-good__select__open');
      }
      if (target.closest('.card-good__select-item')) {
        const cardGoodSelectItem = item.querySelector('.card-good__select');
        cardGoodSelectItem.textContent = target.textContent;
        cardGoodSelectItem.dataset.id = target.dataset.id;
        cardGoodSelectItem.classList.remove('card-good__select__open');
      }
    })
  });



  getGoods(renderCardGood, 'id', hash.substring(2));

} catch (err) {
  console.warn(err);
}







