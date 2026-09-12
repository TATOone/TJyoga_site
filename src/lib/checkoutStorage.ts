export const LAST_ORDER_STORAGE_KEY = 'tj_yoga_last_order_id';
export const LAST_PRODUCT_STORAGE_KEY = 'tj_yoga_last_product_id';

const readSessionValue = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const saveLastCheckoutRefs = (orderId: string, productId: string): void => {
  try {
    sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, orderId);
    sessionStorage.setItem(LAST_PRODUCT_STORAGE_KEY, productId);
  } catch {
    // Private mode or disabled storage should not block checkout redirect.
  }
};

export const readLastOrderId = (): string | null => readSessionValue(LAST_ORDER_STORAGE_KEY);

export const readLastProductId = (): string | null => readSessionValue(LAST_PRODUCT_STORAGE_KEY);
