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
    shoppingList: data.shoppingList.map((item) => {
      // add item to global state
      shoppingItemState.addItem(data.id, {
        name: item.name,
        amount: item.amount,
        tags: item.tags,
      });
      return item.id;
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Recipe;
};

export class RecipeState {
  recipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
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
        this.recipes = JSON.parse(stored);
        if (!this.selectedRecipe && this.recipes.length > 0) {
          this.selectedRecipe = this.recipes[0];
        }
      } catch (_) {}
    }
  }

  /** Persist recipes to localStorage and record timestamp */
  private saveToLocalStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("recipes", JSON.stringify(this.recipes));
      localStorage.setItem("recipes_last_saved", Date.now().toString());
    } catch (_) {}
  }

  get hasRecipes(): boolean {
    return this.recipes.length > 0;
  }

  loadRecipes = async (): Promise<void> => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const demoRecipes = IMPORTED_DEMO_RECIPES_DATA.map(convertToRecipe);
      runInAction(() => {
        this.recipes = demoRecipes;
        this.selectedRecipe = demoRecipes[0];
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
    this.selectedRecipe = recipe;
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
      this.recipes = [...this.recipes, newRecipe];
      this.selectedRecipe = newRecipe;
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
      const index = this.recipes.findIndex((r) => r.id === recipeId);
      if (index !== -1) {
        this.recipes[index] = {
          ...this.recipes[index],
          ...values,
          updatedAt: new Date(),
        };
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...this.recipes[index] };
        }
      }
    });
    this.saveToLocalStorage();
  };

  deleteRecipe = (recipeId: string): void => {
    runInAction(() => {
      this.recipes = this.recipes.filter((r) => r.id !== recipeId);
      if (this.selectedRecipe?.id === recipeId) {
        this.selectedRecipe = this.recipes[0] || null;
      }
    });
    this.saveToLocalStorage();
  };

  toggleShoppingItem = (recipeId: string, itemId: string): void => {
    runInAction(() => {
      shoppingItemState.toggleCompleted(itemId);
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe };
        }
      }
    });
  };

  addShoppingItem = (
    recipeId: string,
    item: { name: string; amount: string; tags: TagType[] },
  ): void => {
    runInAction(() => {
      shoppingItemState.addItem(recipeId, item);
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe };
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
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe };
        }
      }
    });
  };

  deleteShoppingItem = (recipeId: string, itemId: string): void => {
    runInAction(() => {
      shoppingItemState.deleteItem(itemId);
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe };
        }
      }
    });
  };

  setRecipes(recipes: Recipe[]): void {
    runInAction(() => {
      this.recipes = recipes;
    });
    this.saveToLocalStorage();
  }

  setSelectedRecipe(recipe: Recipe | null): void {
    runInAction(() => {
      this.selectedRecipe = recipe;
    });
  }
}

export const recipeState = new RecipeState();
