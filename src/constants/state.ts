import { DemoRecipeData } from "../types";

import type { ShoppingItem } from "../types";

export const DEMO_SHOPPING_ITEMS: ShoppingItem[] = [];

export const DEMO_RECIPES_DATA: DemoRecipeData[] = [
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

// Build shopping items array from demo recipes
DEMO_RECIPES_DATA.forEach((recipe) => {
  recipe.shoppingList.forEach((item) => {
    DEMO_SHOPPING_ITEMS.push({ ...item });
  });
});
