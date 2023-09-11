export enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

export interface PageRequest {
  page: number;
  pageSize: number;
  sortOrder: Order;
}

export const DefaultPageRequest: PageRequest = { page: 0, pageSize: 10, sortOrder: Order.ASC };
