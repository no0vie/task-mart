import { makeAutoObservable, runInAction } from "mobx";
import { shoppingItemState } from "./ShoppingItemState";
import type { DemoRecipeData, Recipe, TagType } from "../types";
import { DEMO_RECIPES_DATA as IMPORTED_DEMO_RECIPES_DATA } from "../constants/state";

const convertToRecipe = (data: DemoRecipeData): Recipe => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    cookingTime: data.cookingTime,
    servings: data.servings,
    shoppingList: data.shoppingList.map((item) => item.id),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Recipe;
};

export class RecipeState {
  items: Recipe[] = [];
  selectedItem: Recipe | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initialize();
  }

  /** Load initial state from localStorage if available */
  private initialize(): void {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("recipes") : null;
    if (stored) {
      try {
        this.items = JSON.parse(stored);
        if (!this.selectedItem && this.items.length > 0) {
          this.selectedItem = this.items[0];
        }
      } catch (_) {}
    }
  }

  /** Persist recipes to localStorage and record timestamp */
  private saveToLocalStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("recipes", JSON.stringify(this.items));
      localStorage.setItem("recipes_last_saved", Date.now().toString());
    } catch (_) {}
  }

  get hasRecipes(): boolean {
    return this.items.length > 0;
  }

  loadRecipes = async (): Promise<void> => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const demoRecipes = IMPORTED_DEMO_RECIPES_DATA.map(convertToRecipe);
      runInAction(() => {
        this.items = demoRecipes;
        this.selectedItem = demoRecipes[0];
        this.isLoading = false;
      });
      this.saveToLocalStorage();
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Неизвестная ошибка";
        this.isLoading = false;
      });
    }
  };

  selectRecipe = (recipe: Recipe | null): void => {
    this.selectedItem = recipe;
  };

  createRecipe = (values: {
    title: string;
    description?: string;
    cookingTime?: number;
    servings?: number;
  }): void => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: values.title,
      description: values.description,
      cookingTime: values.cookingTime,
      servings: values.servings,
      shoppingList: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    runInAction(() => {
      this.items = [...this.items, newRecipe];
      this.selectedItem = newRecipe;
    });
    this.saveToLocalStorage();
  };

  updateRecipe = (
    recipeId: string,
    values: {
      title?: string;
      description?: string;
      cookingTime?: number;
      servings?: number;
    },
  ): void => {
    runInAction(() => {
      const index = this.items.findIndex((r) => r.id === recipeId);
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...values,
          updatedAt: new Date(),
        };
        if (this.selectedItem?.id === recipeId) {
          this.selectedItem = { ...this.items[index] };
        }
      }
    });
    this.saveToLocalStorage();
  };

  deleteRecipe = (recipeId: string): void => {
    runInAction(() => {
      this.items = this.items.filter((r) => r.id !== recipeId);
      if (this.selectedItem?.id === recipeId) {
        this.selectedItem = this.items[0] || null;
      }
    });
    this.saveToLocalStorage();
  };

  addShoppingItem = (
    recipeId: string,
    item: { name: string; amount: string; tags: TagType[] },
  ): void => {
    runInAction(() => {
      const newItem = shoppingItemState.addItem(item);
      const recipe = this.items.find((r) => r.id === recipeId);

      if (recipe) {
        recipe.shoppingList = [...(recipe?.shoppingList || [])];
        recipe.shoppingList.push(newItem.id);
        recipe.updatedAt = new Date();
        if (this.selectedItem?.id === recipeId) {
          this.selectedItem = { ...recipe };
        }
      }
    });
  };

  updateShoppingItem = (
    recipeId: string,
    itemId: string,
    values: { name?: string; amount?: string; tags?: TagType[] },
  ): void => {
    runInAction(() => {
      shoppingItemState.updateItem(itemId, values);
      const recipe = this.items.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.updatedAt = new Date();
        if (this.selectedItem?.id === recipeId) {
          this.selectedItem = { ...recipe };
        }
      }
    });
  };

  deleteShoppingItem = (recipeId: string, itemId: string): void => {
    runInAction(() => {
      shoppingItemState.deleteItem(itemId);
      const recipe = this.items.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.updatedAt = new Date();
        if (this.selectedItem?.id === recipeId) {
          this.selectedItem = { ...recipe };
        }
      }
    });
  };

  setRecipes(recipes: Recipe[]): void {
    runInAction(() => {
      this.items = recipes;
    });
    this.saveToLocalStorage();
  }

  setSelectedRecipe(recipe: Recipe | null): void {
    runInAction(() => {
      this.selectedItem = recipe;
    });
  }
}

export const recipeState = new RecipeState();
