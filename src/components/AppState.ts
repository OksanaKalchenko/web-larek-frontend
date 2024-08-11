import { Model } from "./base/Model";
import { IAppState, IProduct, TCategoryType, IOrder, TFormErrors, IOrderForm, IContactForm } from "../types";

export class Product extends Model<IProduct> {
	id: string; // Уникальный идентификатор товара
	description: string; // Описание товара
	image: string; // URL изображения товара
	title: string; // Наименование товара
	category: TCategoryType; // Категория товара
	price: number | null; //Цена товара
}

export type CatalogChangeEvent = {
    catalog: Product[];
  }

export class AppState extends Model<IAppState> {
    catalog: Product[];  // Массив продуктов в каталоге
    basket: Product[] = [];   // Массив продуктов в корзине
    preview: string | null;
    order: IOrder = {
		payment: '',
		address: '',
		email: '',
		phone: '',
		items: [],
		total: 0,
	};

    formErrors: TFormErrors = {};

    // Каталог товаров
    setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

    // Товар для предпросмотра
    setPreview(item: Product): void {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }


   // Добавить товар в корзину
	addProduct(item: Product): void {
		this.basket.push(item);
		this.order.items.push(item.id);
		this.emitChanges('basket:change', this.basket);
	}

	// Удалить товар из корзины
	deleteProduct(item: Product): void {
		const index = this.basket.indexOf(item);
		if (index !== -1) {
			this.basket.splice(index, 1);
		}
		this.emitChanges('basket:change', this.basket);
	}

    // Очистить корзину
    clearBasket() {
		this.basket = [];
		this.order.items = [];
	}


    // Получить общую стоимость заказа
	getTotal(): number {
		return this.basket.reduce((total, item) => total + item.price, 0);
	}

    //Установить значение в поле заказа
	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;
		if (this.validateOrder()) {
			this.events.emit('delivery:ready', this.order);
		}
	}

    // Проверить форму доставки
	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

    // Установить значения полей контактов
	setContactField(field: keyof IContactForm, value: string) {
		this.order[field] = value;
		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	// Проверить форму контактов
	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать адрес электронной почты';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать номер телефона';
		}
		this.formErrors = errors;
		this.events.emit('contactsFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

    // Очистить данные заказа
	resetOrder() {
		this.order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
			items: [],
			total: 0,
		};
	}
}