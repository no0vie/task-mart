import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Form, message, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Recipe, ShoppingItem, GroupByType } from "./types";
import { recipeState } from "./states/RecipeState";
import { shoppingItemState } from "./states/ShoppingItemState";
import { MENU_ITEMS } from "./constants/ui";
import RecipeCard from "./components/RecipeCard";
import RecipeModal from "./components/RecipeModal";
import RecipeItemModal from "./components/RecipeItemModal";
import RecipeShoppingList from "./components/RecipeShoppingList";
import RecipeSider from "./components/RecipeSider";

const { Content, Header } = Layout;

const AppInner: React.FC = () => {
  const { recipes, selectedRecipe } = recipeState;
  const [groupBy, setGroupBy] = useState<GroupByType>("recipe");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>("1");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [searchText, setSearchText] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

  // Загрузка рецептов при монтировании компонента
  useEffect(() => {
    if (!recipeState.hasRecipes) {
      recipeState.loadRecipes();
    }
  }, []);

  // Обёртка для setSelectedRecipe, совместимая с Dispatch<SetStateAction>
  const handleSelectRecipe = (
    value: Recipe | null | ((prev: Recipe | null) => Recipe | null),
  ) => {
    if (typeof value === "function") return;
    recipeState.selectRecipe(value);
  };

  const handleItemModalClose = () => {
    setIsItemModalVisible(false);
    setEditingItem(null);
    // itemForm reset handled inside modal
  };

  // Создание нового рецепта
  const handleCreateRecipe = (values: any) => {
    recipeState.createRecipe({
      title: values.title,
      description: values.description,
      cookingTime: values.cookingTime,
      servings: values.servings,
    });
    setIsModalVisible(false);
    setEditingRecipe(null);
    form.resetFields();
    message.success("Рецепт создан!");
  };

  // Обновление рецепта
  const handleUpdateRecipe = (values: any) => {
    if (!editingRecipe) return;

    recipeState.updateRecipe(editingRecipe.id, {
      title: values.title,
      description: values.description,
      cookingTime: values.cookingTime,
      servings: values.servings,
    });
    setEditingRecipe(null);
    setIsModalVisible(false);
    form.resetFields();
    message.success("Рецепт обновлен!");
  };

  // Удаление рецепта
  const handleDeleteRecipe = (recipeId: string) => {
    recipeState.deleteRecipe(recipeId);
    message.success("Рецепт удален!");
  };

  // Переключение статуса выполнения
  const handleToggleItem = (itemId: string) => {
    if (!selectedRecipe) return;
    recipeState.toggleShoppingItem(selectedRecipe.id, itemId);
  };

  // Добавление/обновление пункта списка покупок
  const handleSaveItem = (values: any) => {
    if (!selectedRecipe) return;

    if (editingItem) {
      recipeState.updateShoppingItem(selectedRecipe.id, editingItem.id, {
        name: values.name,
        amount: values.amount,
        tags: values.tags || [],
      });
    } else {
      recipeState.addShoppingItem(selectedRecipe.id, {
        name: values.name,
        amount: values.amount,
        tags: values.tags || [],
      });
    }

    setIsItemModalVisible(false);
    setEditingItem(null);
    message.success(editingItem ? "Пункт обновлен!" : "Пункт добавлен!");
  };

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsItemModalVisible(true);
  };

  // Удаление пункта списка
  const handleDeleteItem = (itemId: string) => {
    if (!selectedRecipe) return;
    recipeState.deleteShoppingItem(selectedRecipe.id, itemId);
    message.success("Пункт удален!");
  };

  // Статистика
  const getRecipeStats = (recipe: Recipe) => {
    const total = recipe.shoppingList.length;
    const completed = recipe.shoppingList.reduce(
      (acc, id) => acc + (shoppingItemState.byId.get(id)?.completed ? 1 : 0),
      0,
    );
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const currentStats = selectedRecipe
    ? getRecipeStats(selectedRecipe)
    : { total: 0, completed: 0, percentage: 0 };

  const menuItems: MenuProps["items"] = MENU_ITEMS;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1890ff",
            marginRight: "40px",
          }}
        >
          🍳 CookBook Pro
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedMenuKey]}
          onClick={({ key }) => setSelectedMenuKey(key)}
          items={menuItems}
          style={{ flex: 1, border: "none" }}
        />
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecipe(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Новый рецепт
          </Button>
        </Space>
      </Header>

      <Layout>
        <RecipeSider
          recipes={recipes}
          selectedRecipe={selectedRecipe}
          setSelectedRecipe={handleSelectRecipe}
          setIsModalVisible={setIsModalVisible}
          setEditingRecipe={setEditingRecipe}
          form={form}
          handleDeleteRecipe={handleDeleteRecipe}
        />

        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          {selectedMenuKey === "2" ? (
            <RecipeShoppingList />
          ) : (
            <RecipeCard
              selectedRecipe={selectedRecipe}
              currentStats={currentStats}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              searchText={searchText}
              setSearchText={setSearchText}
              collapsedSections={collapsedSections}
              setCollapsedSections={setCollapsedSections}
              itemForm={itemForm}
              setIsItemModalVisible={setIsItemModalVisible}
              setEditingItem={setEditingItem}
              handleEditItem={handleEditItem}
              handleDeleteItem={handleDeleteItem}
              handleToggleItem={handleToggleItem}
            />
          )}
        </Content>
      </Layout>

      {/* Модальное окно для рецепта */}
      <RecipeModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingRecipe(null);
          form.resetFields();
        }}
        onSubmit={editingRecipe ? handleUpdateRecipe : handleCreateRecipe}
        editingRecipe={editingRecipe}
        form={form}
      />

      {/* Модальное окно для пункта списка */}
      <RecipeItemModal
        visible={isItemModalVisible}
        onClose={handleItemModalClose}
        onSubmit={handleSaveItem}
        editingItem={editingItem}
      />
    </Layout>
  );
};

export default observer(AppInner);
