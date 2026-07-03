import React from "react";
import { Card, Divider } from "antd";
import type { Recipe, GroupByType, GroupedItems, ShoppingItem } from "../types";
import { shoppingItemState } from "../states/ShoppingItemState";
import ShoppingListItem from "./ShoppingListItem";
import { AVAILABLE_TAGS } from "../constants/ui";

export interface ShoppingListProps {
  selectedRecipe: Recipe | null;
  groupBy: GroupByType;
  searchText: string;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const getGroupedItems = (
  selectedRecipe: Recipe | null,
  groupBy: GroupByType,
  searchText?: string,
): GroupedItems => {
  if (!selectedRecipe) return {};

  // Resolve shopping item IDs to actual objects
  const ids = selectedRecipe.shoppingList;
  const items: ShoppingItem[] = ids
    .map((id) => shoppingItemState.items.find((item) => item.id === id))
    .filter((i): i is ShoppingItem => !!i);

  const filtered = searchText
    ? items.filter((i) =>
        i.name.toLowerCase().includes(searchText.toLowerCase()),
      )
    : items;

  const groupItems = filtered;

  switch (groupBy) {
    case "recipe":
      return { [selectedRecipe.title]: groupItems };
    case "tag": {
      const grouped: GroupedItems = {};
      groupItems.forEach((item) => {
        if (item.tags.length === 0) {
          if (!grouped["Без тега"]) grouped["Без тега"] = [];
          grouped["Без тега"].push(item);
        } else {
          item.tags.forEach((tagId) => {
            const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
            const name = tag?.name || tagId;
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push(item);
          });
        }
      });
      return grouped;
    }
    case "none":
      // All items in one group
      return { [selectedRecipe.title]: groupItems };
    default:
      return { [selectedRecipe.title]: groupItems };
  }
};

const ShoppingList: React.FC<ShoppingListProps> = ({
  selectedRecipe,
  groupBy,
  searchText,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const groupedItems = getGroupedItems(selectedRecipe, groupBy, searchText);

  return (
    <>
      {Object.entries(groupedItems).map(([groupName, items]) => {
        const isNoneGroup =
          groupBy === "none" &&
          selectedRecipe &&
          groupName === selectedRecipe.title;
        if (isNoneGroup) {
          const incomplete = items.filter((i) => !i.completed);
          const completed = items.filter((i) => i.completed);
          return (
            <Card
              key={groupName}
              style={{ marginBottom: "12px" }}
              title={groupName}
            >
              {incomplete.map((item) => (
                <ShoppingListItem
                  key={item.id}
                  item={item}
                  showTag={true}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))}
              {completed.length > 0 && (
                <>
                  <Divider orientation="horizontal"></Divider>
                  {completed.map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      showTag={true}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggle={onToggle}
                    />
                  ))}
                </>
              )}
            </Card>
          );
        }
        return (
          <Card
            key={groupName}
            style={{ marginBottom: "12px" }}
            title={groupName}
          >
            {items.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                showTag={groupBy !== "tag"}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))}
          </Card>
        );
      })}
    </>
  );
};

export default ShoppingList;
