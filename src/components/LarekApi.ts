import { IOrder, IOrderResult, IProduct } from '../types';
import { Api, ApiListResponse } from './base/Api' 

export interface ILarekApi {
	getProductList: () => Promise<IProduct[]>; // Получение списка товаров
	getOrder: (order: IOrder) => Promise<IOrderResult>; // Оформление заказа товаров
}

export class LarekApi extends Api implements ILarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}