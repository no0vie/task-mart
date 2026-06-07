import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  List,
  Form,
  Input,
  Empty,
  Badge,
  Popconfirm,
  Statistic,
  Segmented,
  Progress,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
  DownOutlined,
  UpOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Recipe, ShoppingItem, GroupByType } from "./types";
import { AVAILABLE_TAGS } from "./constants/tags";
import ShoppingListItem from "./components/ShoppingListItem";
import RecipeModal from "./components/RecipeModal";
import RecipeItemModal from "./components/RecipeItemModal";

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByType>("recipe");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [searchText, setSearchText] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const handleItemModalClose = () => {
    setIsItemModalVisible(false);
    setEditingItem(null);
    // itemForm reset handled inside modal
  };

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem("recipes");
    if (savedRecipes) {
      const parsed = JSON.parse(savedRecipes);
      // Преобразуем строки дат обратно в объекты Date
      const recipesWithDates = parsed.map((recipe: any) => ({
        ...recipe,
        createdAt: new Date(recipe.createdAt),
        updatedAt: new Date(recipe.updatedAt),
      }));
      setRecipes(recipesWithDates);
      if (recipesWithDates.length > 0) {
        setSelectedRecipe(recipesWithDates[0]);
      }
    } else {
      // Добавляем демо-рецепты
      const demoRecipes = createDemoRecipes();
      setRecipes(demoRecipes);
      setSelectedRecipe(demoRecipes[0]);
    }
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem("recipes", JSON.stringify(recipes));
    }
  }, [recipes]);

  const createDemoRecipes = (): Recipe[] => {
    return [
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  };

  // Создание нового рецепта
  const handleCreateRecipe = (values: any) => {
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
    setRecipes([...recipes, newRecipe]);
    setSelectedRecipe(newRecipe);
    setIsModalVisible(false);
    form.resetFields();
    message.success("Рецепт создан!");
  };

  // Обновление рецепта
  const handleUpdateRecipe = (values: any) => {
    if (!editingRecipe) return;

    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === editingRecipe.id
        ? {
            ...recipe,
            ...values,
            updatedAt: new Date(),
          }
        : recipe,
    );
    setRecipes(updatedRecipes);
    setSelectedRecipe(
      updatedRecipes.find((r) => r.id === editingRecipe.id) || null,
    );
    setEditingRecipe(null);
    setIsModalVisible(false);
    form.resetFields();
    message.success("Рецепт обновлен!");
  };

  // Удаление рецепта
  const handleDeleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter((r) => r.id !== recipeId);
    setRecipes(updatedRecipes);
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(updatedRecipes[0] || null);
    }
    message.success("Рецепт удален!");
  };

  // Переключение статуса выполнения
  const handleToggleItem = (itemId: string) => {
    if (!selectedRecipe) return;
    const updatedShoppingList = selectedRecipe.shoppingList.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    const updatedRecipe = {
      ...selectedRecipe,
      shoppingList: updatedShoppingList,
      updatedAt: new Date(),
    };
    const updatedRecipes = recipes.map((r) =>
      r.id === selectedRecipe.id ? updatedRecipe : r,
    );
    setRecipes(updatedRecipes);
    setSelectedRecipe(updatedRecipe);
  };

  // Добавление/обновление пункта списка покупок
  const handleSaveItem = (values: any) => {
    if (!selectedRecipe) return;

    const updatedShoppingList = editingItem
      ? selectedRecipe.shoppingList.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...values, tags: values.tags || [] }
            : item,
        )
      : [
          ...selectedRecipe.shoppingList,
          {
            id: Date.now().toString(),
            ...values,
            tags: values.tags || [],
            completed: false,
          },
        ];

    const updatedRecipe = {
      ...selectedRecipe,
      shoppingList: updatedShoppingList,
      updatedAt: new Date(),
    };

    const updatedRecipes = recipes.map((r) =>
      r.id === selectedRecipe.id ? updatedRecipe : r,
    );

    setRecipes(updatedRecipes);
    setSelectedRecipe(updatedRecipe);
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

    const updatedShoppingList = selectedRecipe.shoppingList.filter(
      (item) => item.id !== itemId,
    );

    const updatedRecipe = {
      ...selectedRecipe,
      shoppingList: updatedShoppingList,
      updatedAt: new Date(),
    };

    const updatedRecipes = recipes.map((r) =>
      r.id === selectedRecipe.id ? updatedRecipe : r,
    );

    setRecipes(updatedRecipes);
    setSelectedRecipe(updatedRecipe);
    message.success("Пункт удален!");
  };

  // Группировка элементов
  const getGroupedItems = (): { [key: string]: ShoppingItem[] } => {
    if (!selectedRecipe) return {};

    let items = selectedRecipe.shoppingList.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );

    switch (groupBy) {
      case "recipe":
        return { [selectedRecipe.title]: items };

      case "tag":
        const grouped: { [key: string]: ShoppingItem[] } = {};
        items.forEach((item) => {
          if (item.tags.length === 0) {
            if (!grouped["Без тега"]) grouped["Без тега"] = [];
            grouped["Без тега"].push(item);
          } else {
            item.tags.forEach((tagId) => {
              const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
              const tagName = tag?.name || tagId;
              if (!grouped[tagName]) grouped[tagName] = [];
              grouped[tagName].push(item);
            });
          }
        });
        return grouped;

      case "none":
        return { "Все покупки": items };

      default:
        return { [selectedRecipe.title]: items };
    }
  };

  // Статистика
  const getRecipeStats = (recipe: Recipe) => {
    const total = recipe.shoppingList.length;
    const completed = recipe.shoppingList.filter(
      (item) => item.completed,
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const currentStats = selectedRecipe
    ? getRecipeStats(selectedRecipe)
    : { total: 0, completed: 0, percentage: 0 };

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <BookOutlined />,
      label: "Мои рецепты",
    },
    {
      key: "2",
      icon: <ShoppingCartOutlined />,
      label: "Список покупок",
    },
  ];

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
          defaultSelectedKeys={["1"]}
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
        <Sider
          width={280}
          style={{
            background: "#fff",
            padding: "20px 0",
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <div style={{ padding: "0 16px", marginBottom: "16px" }}>
            <Title level={5}>Мои рецепты ({recipes.length})</Title>
          </div>
          <List
            dataSource={recipes}
            renderItem={(recipe) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  background:
                    selectedRecipe?.id === recipe.id
                      ? "#e6f7ff"
                      : "transparent",
                  borderLeft:
                    selectedRecipe?.id === recipe.id
                      ? "3px solid #1890ff"
                      : "3px solid transparent",
                }}
                onClick={() => setSelectedRecipe(recipe)}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRecipe(recipe);
                      form.setFieldsValue(recipe);
                      setIsModalVisible(true);
                    }}
                  />,
                  <Popconfirm
                    title="Удалить рецепт?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteRecipe(recipe.id);
                    }}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      count={
                        recipe.shoppingList.filter((i) => !i.completed).length
                      }
                      style={{ backgroundColor: "#52c41a" }}
                    >
                      <BookOutlined style={{ fontSize: "20px" }} />
                    </Badge>
                  }
                  title={
                    <Text strong={selectedRecipe?.id === recipe.id}>
                      {recipe.title}
                    </Text>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      {recipe.cookingTime && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <ClockCircleOutlined /> {recipe.cookingTime} мин
                        </Text>
                      )}
                      {recipe.servings && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <TeamOutlined /> {recipe.servings} порций
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          {selectedRecipe ? (
            <>
              {/* Заголовок рецепта */}
              <Card style={{ marginBottom: "24px" }}>
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Title level={2} style={{ margin: 0 }}>
                      {selectedRecipe.title}
                    </Title>
                    {selectedRecipe.description && (
                      <Paragraph style={{ marginTop: "8px", marginBottom: 0 }}>
                        {selectedRecipe.description}
                      </Paragraph>
                    )}
                    <Space style={{ marginTop: "12px" }}>
                      {selectedRecipe.cookingTime && (
                        <Tag icon={<ClockCircleOutlined />} color="blue">
                          {selectedRecipe.cookingTime} минут
                        </Tag>
                      )}
                      {selectedRecipe.servings && (
                        <Tag icon={<TeamOutlined />} color="green">
                          {selectedRecipe.servings} порций
                        </Tag>
                      )}
                      <Text type="secondary">
                        Обновлено:{" "}
                        {selectedRecipe.updatedAt.toLocaleDateString()}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Card size="small">
                      <Statistic
                        title="Прогресс покупок"
                        value={currentStats.percentage}
                        suffix="%"
                        prefix={<ShoppingCartOutlined />}
                      />
                      <Progress
                        percent={currentStats.percentage}
                        size="small"
                        style={{ marginTop: "8px" }}
                      />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {currentStats.completed} из {currentStats.total} куплено
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Панель управления */}
              <Card style={{ marginBottom: "24px" }}>
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Space size="large">
                      <Input
                        placeholder="Поиск по списку..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: "250px" }}
                        allowClear
                      />
                      <Segmented
                        value={groupBy}
                        onChange={(value) => setGroupBy(value as GroupByType)}
                        options={[
                          {
                            label: "По рецепту",
                            value: "recipe",
                            icon: <BookOutlined />,
                          },
                          {
                            label: "По тегам",
                            value: "tag",
                            icon: <TagsOutlined />,
                          },
                          {
                            label: "Без группировки",
                            value: "none",
                            icon: <UnorderedListOutlined />,
                          },
                        ]}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingItem(null);
                        itemForm.resetFields();
                        setIsItemModalVisible(true);
                      }}
                    >
                      Добавить покупку
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Список покупок с группировкой */}
              {Object.entries(getGroupedItems()).map(([groupName, items]) => (
                <Card
                  key={groupName}
                  style={{ marginBottom: "24px" }}
                  title={
                    <Space>
                      <Text strong style={{ fontSize: "16px" }}>
                        {groupName}
                      </Text>
                      <Badge
                        count={items.length}
                        style={{ backgroundColor: "#1890ff" }}
                      />
                      <Badge
                        count={items.filter((i) => i.completed).length}
                        style={{ backgroundColor: "#52c41a" }}
                      >
                        <CheckCircleOutlined />
                      </Badge>
                    </Space>
                  }
                  extra={
                    <Button
                      type="text"
                      icon={
                        collapsedSections.includes(groupName) ? (
                          <DownOutlined />
                        ) : (
                          <UpOutlined />
                        )
                      }
                      onClick={() => {
                        if (collapsedSections.includes(groupName)) {
                          setCollapsedSections(
                            collapsedSections.filter((s) => s !== groupName),
                          );
                        } else {
                          setCollapsedSections([
                            ...collapsedSections,
                            groupName,
                          ]);
                        }
                      }}
                    />
                  }
                >
                  {!collapsedSections.includes(groupName) &&
                    (items.length > 0 ? (
                      <List
                        dataSource={items}
                        renderItem={(item) => (
                          <ShoppingListItem
                            item={item}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                            onToggle={handleToggleItem}
                          />
                        )}
                      />
                    ) : (
                      <Empty description="Нет покупок в этой категории" />
                    ))}
                </Card>
              ))}

              {Object.keys(getGroupedItems()).length === 0 && (
                <Empty
                  description="Список покупок пуст"
                  style={{ marginTop: "50px" }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingItem(null);
                      itemForm.resetFields();
                      setIsItemModalVisible(true);
                    }}
                  >
                    Добавить первую покупку
                  </Button>
                </Empty>
              )}
            </>
          ) : (
            <Empty
              description="Выберите рецепт или создайте новый"
              style={{ marginTop: "100px" }}
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

export default App;
