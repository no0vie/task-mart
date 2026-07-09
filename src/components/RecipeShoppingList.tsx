import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import type { GroupByType, Recipe, ShoppingItem } from "../types";
import { recipeState } from "../states/RecipeState";
import { shoppingItemState } from "../states/ShoppingItemState";
import ShoppingListHeader from "./ShoppingListHeader";
import ShoppingList from "./ShoppingList";
import RecipeItemModal from "./RecipeItemModal";

const RecipeShoppingList: React.FC = observer(() => {
  const { items: recipes } = recipeState;
  const [groupBy, setGroupBy] = useState<GroupByType>("recipe");
  const [searchText, setSearchText] = useState("");

  // Modal state for editing items
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const handleAdd = () => {
    setIsItemModalVisible(true);
  };

  // Prepare aggregated data when in 'none' group
  const mergedItems: ShoppingItem[] = recipes
    .flatMap((r) =>
      r.shoppingList.map((id) =>
        shoppingItemState.items.find((item) => item.id === id),
      ),
    )
    .filter((i): i is ShoppingItem => !!i);
  const virtualRecipe: Recipe = {
    id: "all",
    title: "Общий список",
    description: "",
    cookingTime: 0,
    servings: 0,
    shoppingList: mergedItems.map((i) => i.id),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const openEdit = (rid: string | null, item: ShoppingItem) => {
    setEditingRecipeId(rid);
    setEditingItem(item);
    setIsItemModalVisible(true);
  };

  const handleDeleteAggregated = (rid: string | null, id: string) => {
    recipeState.deleteShoppingItem(rid, id);
  };

  const handleToggleAggregated = (id: string) => {
    shoppingItemState.toggleCompleted(id);
  };

  if (!recipes.length) return <div>Нет рецептов для отображения.</div>;

  return (
    <>
      <ShoppingListHeader
        searchText={searchText}
        setSearchText={setSearchText}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        onAdd={handleAdd}
      />
      {groupBy === "recipe" ? (
        recipes.map((r) => (
          <ShoppingList
            key={r.id}
            selectedRecipe={r}
            groupBy={groupBy}
            searchText={searchText}
            onEdit={(item) => openEdit(r.id, item)}
            onDelete={(id: string) => recipeState.deleteShoppingItem(r.id, id)}
            onToggle={(id: string) => shoppingItemState.toggleCompleted(id)}
          />
        ))
      ) : (
        <ShoppingList
          selectedRecipe={virtualRecipe}
          groupBy={groupBy}
          searchText={searchText}
          onEdit={(item) => openEdit(null, item)}
          onDelete={(id: string) => handleDeleteAggregated(null, id)}
          onToggle={(id: string) => handleToggleAggregated(id)}
        />
      )}
      {isItemModalVisible && (
        <RecipeItemModal
          visible={isItemModalVisible}
          onClose={() => setIsItemModalVisible(false)}
          recepies={recipes}
          onSubmit={(values) => {
            const recipeId = values.recipe;
            if (!recipeId) {
              // no selection, error handling maybe
              return;
            }
            if (editingRecipeId && editingItem) {
              recipeState.updateShoppingItem(editingRecipeId, editingItem.id, {
                name: values.name,
                quantity: values.quantity,
                value: values.value,
                tags: values.tags || [],
              });
            } else if (editingRecipeId) {
              // adding to specific recipe from list view
              recipeState.addShoppingItem(editingRecipeId, {
                name: values.name,
                quantity: values.quantity,
                value: values.value,
                tags: values.tags || [],
              });
            } else {
              // adding when not editing a recipe; use selected recipe id
              const selectedRecipeId = values.recipe;
              recipeState.addShoppingItem(selectedRecipeId, {
                name: values.name,
                quantity: values.quantity,
                value: values.value,
                tags: values.tags || [],
              });
            }
            setIsItemModalVisible(false);
          }}
          editingItem={editingItem}
        />
      )}
    </>
  );
});

export default RecipeShoppingList;
