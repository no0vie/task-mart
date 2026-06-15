import React from "react";
import {
  Layout,
  List,
  Typography,
  Button,
  Popconfirm,
  Badge,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import type { Recipe } from "../types";
import { shoppingItemState } from "../states/ShoppingItemState";

interface RecipeSiderProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  setSelectedRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  form: FormInstance;
  handleDeleteRecipe: (id: string) => void;
}

const { Sider } = Layout;
const { Title, Text } = Typography;

const RecipeSider: React.FC<RecipeSiderProps> = ({
  recipes,
  selectedRecipe,
  setSelectedRecipe,
  setIsModalVisible,
  setEditingRecipe,
  form,
  handleDeleteRecipe,
}) => {
  const lastSaved =
    typeof window !== "undefined"
      ? localStorage.getItem("recipes_last_saved")
      : null;
  const lastSavedDate = lastSaved ? new Date(parseInt(lastSaved)) : null;
  return (
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
        {lastSavedDate ? (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Сохранено {lastSavedDate.toLocaleString()}
          </Text>
        ) : null}
      </div>
      <List
        dataSource={recipes}
        renderItem={(recipe) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              background:
                selectedRecipe?.id === recipe.id ? "#e6f7ff" : "transparent",
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
                  count={recipe.shoppingList.reduce(
                    (acc, id) =>
                      acc + (shoppingItemState.byId.get(id)?.completed ? 1 : 0),
                    0,
                  )}
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
  );
};

export default RecipeSider;
