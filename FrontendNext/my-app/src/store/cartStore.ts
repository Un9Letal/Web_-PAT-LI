
import { create } from 'zustand';
import { ImagePlaceholder } from '@/lib/placeholder-images';

interface CartItem extends ImagePlaceholder {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: ImagePlaceholder) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      const newItems = items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      set({ items: newItems, total: calculateTotal(newItems) });
    } else {
      const newItems = [...items, { ...product, quantity: 1 }];
      set({ items: newItems, total: calculateTotal(newItems) });
    }
  },
  removeItem: (productId) => {
    const newItems = get().items.filter((item) => item.id !== productId);
    set({ items: newItems, total: calculateTotal(newItems) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    const newItems = get().items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    set({ items: newItems, total: calculateTotal(newItems) });
  },
  clearCart: () => set({ items: [], total: 0 }),
}));

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};
