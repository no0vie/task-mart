import { makeAutoObservable } from "mobx";
import type { ShoppingItem } from "../types";

/**
 * State container for all shopping items.
 * Keeps a flat list of {@link ShoppingItem} and allows lookup by id.
 * Each item knows the recipeId it belongs to via its `recipeId` field.
 */
import { DEMO_SHOPPING_ITEMS } from "../constants/state";

export class ShoppingItemState {
  items: ShoppingItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Load a single ShoppingItem by its ID from the mock backend.
   * @param id The ID of the item to load.
   */
  loadById = (id: string): void => {
    const demoItem = DEMO_SHOPPING_ITEMS.find((i) => i.id === id);
    if (!demoItem) return;
    const idx = this.items.findIndex((i) => i.id === id);
    const newItem = { ...demoItem, completed: false } as ShoppingItem;
    if (idx !== -1) {
      this.items[idx] = newItem;
    } else {
      this.items.push(newItem);
    }
    // If we already know recipe mapping from loadByRecipe, preserve it
  };

  loadByIds = (ids: string[]): void => {
    ids.map(this.loadById);
  };

  /* ---------- Mutations ---------- */
  addItem = (item: Omit<ShoppingItem, "id" | "completed">): ShoppingItem => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      completed: false,
      ...item,
    };
    this.items.push(newItem);

    return newItem;
  };

  toggleCompleted = (id: string): void => {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.items[idx].completed = !this.items[idx].completed;
    }
  };

  updateItem = (
    id: string,
    values: Partial<Pick<ShoppingItem, "name" | "amount" | "tags">>,
  ): void => {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.items[idx] = { ...this.items[idx], ...values };
    }
  };

  deleteItem = (id: string): void => {
    this.items = this.items.filter((i) => i.id !== id);
  };
}

export const shoppingItemState = new ShoppingItemState();
