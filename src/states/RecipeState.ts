import { makeAutoObservable, runInAction } from "mobx";
import type { Recipe, TagType } from "../types";

interface DemoRecipeData {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  servings: number;
  shoppingList: Array<{
    id: string;
    name: string;
    amount: string;
    tags: TagType[];
    completed: boolean;
  }>;
}

const DEMO_RECIPES_DATA: DemoRecipeData[] = [
  {
    id: "1",
    title: "Борщ украинский",
    description: "Традиционный украинский борщ с мясом и овощами",
    cookingTime: 90,
    servings: 6,
    shoppingList: [
      {
        id: "1-1",
        name: "Свекла",
        amount: "2 шт",
        tags: ["ovoshi"],
        completed: false,
      },
      {
        id: "1-2",
        name: "Капуста",
        amount: "300 г",
        tags: ["ovoshi"],
        completed: false,
      },
      {
        id: "1-3",
        name: "Картофель",
        amount: "4 шт",
        tags: ["ovoshi"],
        completed: false,
      },
      {
        id: "1-4",
        name: "Говядина",
        amount: "500 г",
        tags: ["myaso"],
        completed: false,
      },
      {
        id: "1-5",
        name: "Томатная паста",
        amount: "2 ст.л.",
        tags: ["conservy"],
        completed: false,
      },
      {
        id: "1-6",
        name: "Морковь",
        amount: "1 шт",
        tags: ["ovoshi"],
        completed: false,
      },
      {
        id: "1-7",
        name: "Лук",
        amount: "2 шт",
        tags: ["ovoshi"],
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Оливье классический",
    description: "Любимый новогодний салат",
    cookingTime: 60,
    servings: 8,
    shoppingList: [
      {
        id: "2-1",
        name: "Картофель",
        amount: "4 шт",
        tags: ["ovoshi"],
        completed: false,
      },
      {
        id: "2-2",
        name: "Морковь",
        amount: "2 шт",
        tags: ["ovoshi"],
        completed: false,
      },
      {
        id: "2-3",
        name: "Яйца",
        amount: "6 шт",
        tags: ["molochnoe"],
        completed: false,
      },
      {
        id: "2-4",
        name: "Колбаса докторская",
        amount: "300 г",
        tags: ["myaso"],
        completed: true,
      },
      {
        id: "2-5",
        name: "Огурцы маринованные",
        amount: "200 г",
        tags: ["conservy"],
        completed: false,
      },
      {
        id: "2-6",
        name: "Горошек зеленый",
        amount: "1 банка",
        tags: ["conservy"],
        completed: false,
      },
      {
        id: "2-7",
        name: "Майонез",
        amount: "200 г",
        tags: ["bakaleya"],
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "Паста Карбонара",
    description: "Классическая итальянская паста",
    cookingTime: 30,
    servings: 4,
    shoppingList: [
      {
        id: "3-1",
        name: "Спагетти",
        amount: "400 г",
        tags: ["bakaleya"],
        completed: false,
      },
      {
        id: "3-2",
        name: "Бекон",
        amount: "200 г",
        tags: ["myaso"],
        completed: false,
      },
      {
        id: "3-3",
        name: "Яйца",
        amount: "3 шт",
        tags: ["molochnoe"],
        completed: false,
      },
      {
        id: "3-4",
        name: "Сыр Пармезан",
        amount: "100 г",
        tags: ["molochnoe"],
        completed: false,
      },
      {
        id: "3-5",
        name: "Сливки",
        amount: "200 мл",
        tags: ["molochnoe"],
        completed: false,
      },
      {
        id: "3-6",
        name: "Чеснок",
        amount: "2 зубчика",
        tags: ["ovoshi"],
        completed: false,
      },
    ],
  },
];

const convertToRecipe = (data: DemoRecipeData): Recipe =>
  ({
    id: data.id,
    title: data.title,
    description: data.description,
    cookingTime: data.cookingTime,
    servings: data.servings,
    shoppingList: data.shoppingList.map((item) => ({ ...item })),
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Recipe;

export class RecipeState {
  recipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
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
      // TODO: Заменить на вызов API при готовности бекенда
      // const response = await fetch('/api/recipes');
      // const data = await response.json();
      // runInAction(() => {
      //   this.recipes = data.map(convertToRecipe);
      // });

      // Пока используем демо-данные
      const demoRecipes = DEMO_RECIPES_DATA.map(convertToRecipe);

      runInAction(() => {
        this.recipes = demoRecipes;
        this.selectedRecipe = demoRecipes[0];
        this.isLoading = false;
      });
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
  };

  deleteRecipe = (recipeId: string): void => {
    runInAction(() => {
      this.recipes = this.recipes.filter((r) => r.id !== recipeId);
      if (this.selectedRecipe?.id === recipeId) {
        this.selectedRecipe = this.recipes[0] || null;
      }
    });
  };

  toggleShoppingItem = (recipeId: string, itemId: string): void => {
    runInAction(() => {
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        const updatedList = recipe.shoppingList.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item,
        );
        recipe.shoppingList = updatedList;
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe, shoppingList: [...updatedList] };
        }
      }
    });
  };

  addShoppingItem = (
    recipeId: string,
    item: { name: string; amount: string; tags: TagType[] },
  ): void => {
    runInAction(() => {
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        const newItem = {
          id: Date.now().toString(),
          ...item,
          completed: false,
        };
        recipe.shoppingList = [...recipe.shoppingList, newItem];
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = {
            ...recipe,
            shoppingList: [...recipe.shoppingList],
          };
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
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        const updatedList = recipe.shoppingList.map((item) =>
          item.id === itemId ? { ...item, ...values } : item,
        );
        recipe.shoppingList = updatedList;
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe, shoppingList: [...updatedList] };
        }
      }
    });
  };

  deleteShoppingItem = (recipeId: string, itemId: string): void => {
    runInAction(() => {
      const recipe = this.recipes.find((r) => r.id === recipeId);
      if (recipe) {
        const updatedList = recipe.shoppingList.filter(
          (item) => item.id !== itemId,
        );
        recipe.shoppingList = updatedList;
        recipe.updatedAt = new Date();
        if (this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = { ...recipe, shoppingList: [...updatedList] };
        }
      }
    });
  };

  setRecipes(recipes: Recipe[]): void {
    runInAction(() => {
      this.recipes = recipes;
    });
  }

  setSelectedRecipe(recipe: Recipe | null): void {
    runInAction(() => {
      this.selectedRecipe = recipe;
    });
  }
}

export const recipeState = new RecipeState();
