// Интерфейс данных товара
export interface IProduct {
	id: string; // Уникальный идентификатор товара
	description: string; // Описание товара
	image: string; // URL изображения товара
	title: string; // Наименование товара
	category: TCategoryType; // Категория товара
	price: number | null; //Цена товара
}

// Интерфейс товара в списке корзины
export interface IProductInBasket extends IProduct {
    index: number; // Индекс продукта в корзине
  }

export interface IContactForm {
    email: string; // Электронная почта пользователя
    phone: string; // Номер телефона пользователя
}

export interface IOrderForm {
    payment: string; // Способ оплаты
    address: string; // Адрес доставки
}


export interface IOrder extends IOrderForm, IContactForm {
	total: number; // Общая сумма заказа
	items: string[]; // Массив товаров, включенных в заказ
}

// Интерфейс, описывающий глобальное состояние приложения
export interface IAppState {
    catalog: IProduct[];  // Массив продуктов в каталоге
    basket: string[];   // Массив продуктов в корзине
    preview: string | null;
    order: IOrder | null;

    setCatalog(items: IProduct[]): void;
    addProduct(product: IProduct): void; // Добавляет продукт в корзину
    removeProduct(product: IProduct): void; // Удаляет продукт из корзины
}

// Интерфейс успешной покупки
export interface IOrderResult {
    id: string;
    total: number;
}


export type TCategoryType = | 'другое' | 'софт-скил' | 'дополнительное' | 'кнопка'| 'хард-скил';

export type TProductBasket = Pick<IProduct, 'id' | 'price' | 'title'>;

export type TOrderFormData = Pick<IOrder, 'payment' | 'address' | 'email' | 'phone'>

export type TFormErrors = Partial<Record<keyof IOrder, string>>;



