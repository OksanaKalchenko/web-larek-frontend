import './scss/styles.scss';
import { LarekApi } from "./components/LarekApi";
import { API_URL, CDN_URL } from "./utils/constants";
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppState, CatalogChangeEvent, Product } from "./components/AppState";
import { EventEmitter } from "./components/base/Events";
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { Basket } from './components/common/Basket';
import { OrderForm } from './components/OrderForm';
import { ContactForm } from './components/ContactForm';
import { IOrderForm, IContactForm } from './types'

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const api = new LarekApi(CDN_URL, API_URL);
const events = new EventEmitter();
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const delivery = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contacts = new ContactForm(cloneTemplate<HTMLFormElement>(contactsTemplate), events);

// Модель данных приложения
const appData = new AppState({}, events);


// Получаем каталог товаров с сервера в модель
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

// Отображение каталога товаров
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card('card', cloneTemplate(cardTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});

events.on('card:select', (item: Product) => {
	appData.setPreview(item);
});

// Открытие карточки товара
events.on('preview:changed', (item: Product) => {
	const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('product:add', item);
		},
	});
	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			category: item.category,
			price: item.price,
		}),
	});
});

//Меняет значение кнопки в зависимости от того, добавлен товар в корзину или нет
events.on('card:toBasket', (item: Product) => {
	if (appData.basket.indexOf(item) === -1) {
		events.emit('basket:add', item);
	} else {
		events.emit('basket:remove', item);
	}
});

// Добавление в корзину
events.on('product:add', (item: Product) => {
	appData.addProduct(item);
	// page.counter = appData.basket.length;
	modal.close();
});

// Удаление из корзины
events.on('product:delete', (item: Product) => {
	appData.deleteProduct(item);
	// page.counter = appData.basket.length;
	modal.close;
});

// Открытие корзины
events.on('basket:open', () => {
	basket.selected = appData.order.items;
	modal.render({
		content: basket.render(),
	});
});

// Изменения в корзине
events.on('basket:change', () => {
	basket.items = appData.basket.map((item, index) => {
		const card = new Card('card', cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.deleteProduct(item);
				basket.selected = appData.order.items;
				basket.total = appData.getTotal();
			},
		});
		return card.render({
			title: item.title,
			price: item.price,
			index: (index + 1).toString(),
		});
	});
	basket.selected = appData.order.items;
	basket.total = appData.getTotal();
	page.counter = appData.basket.length;
});

// Оформление заказа (способ оплаты и адрес)
events.on('order:open', () => {
	appData.order.total = appData.getTotal();
	modal.render({
		content: delivery.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Состояние валидации формы заказа (способ оплаты и адрес)
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	delivery.valid = !payment && !address;
	delivery.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

events.on('payment:change', (target: HTMLButtonElement) => {
	appData.order.payment = target.name;
});

events.on(
	'order.address:change',
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Оформление заказа (емаил и номер телефона)
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

// Состояние валидации формы заказа (емаил и номер телефона)
events.on('contactsFormErrors:change', (errors: Partial<IContactForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

//Изменения в полях форм заказа 
events.on(
	/^contacts\..*:change/,(data: { field: keyof IContactForm; value: string }) => {
		appData.setContactField(data.field, data.value);
	}
);

events.on(/^order\..*:change/, (data: {field: keyof IOrderForm; value: string}) => {
	appData.setOrderField(data.field, data.value);
});

// Отправка формы заказа
events.on('contacts:submit', () => {
	api
		.getOrder(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					appData.resetOrder();
					page.counter = appData.basket.length;
				},
			});
			modal.render({
				content: success.render({
					total: appData.getTotal(),
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокировка прокрутки страницы при открытии модального окна
events.on('modal:open', () => {
	page.locked = true;
});

// После закрытия модального окна, прокрутка страницы снова доступна
events.on('modal:close', () => {
	page.locked = false;
});
