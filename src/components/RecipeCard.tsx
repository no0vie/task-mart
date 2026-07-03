import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Statistic,
  Progress,
} from "antd";
import {
  ClockCircleOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import type { Recipe, ShoppingItem, GroupByType } from "../types";
import ShoppingList from "./ShoppingList";
import ShoppingListHeader from "./ShoppingListHeader";

const { Title, Paragraph, Text } = Typography;

export interface RecipeCardProps {
  selectedRecipe: Recipe | null;
  currentStats: { total: number; completed: number; percentage: number };
  groupBy: GroupByType;
  setGroupBy: (value: GroupByType) => void;
  searchText: string;
  setSearchText: (value: string) => void;
  collapsedSections: string[];
  setCollapsedSections: (value: string[]) => void;
  itemForm: FormInstance;
  setIsItemModalVisible: (visible: boolean) => void;
  setEditingItem: (item: ShoppingItem | null) => void;
  handleEditItem: (item: ShoppingItem) => void;
  handleDeleteItem: (id: string) => void;
  handleToggleItem: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  selectedRecipe,
  currentStats,
  groupBy,
  setGroupBy,
  searchText,
  setSearchText,
  itemForm,
  setIsItemModalVisible,
  setEditingItem,
  handleEditItem,
  handleDeleteItem,
  handleToggleItem,
}) => {
  const handleAdd = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setIsItemModalVisible(true);
  };

  return selectedRecipe ? (
    <>
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
                Обновлено: {selectedRecipe.updatedAt?.toLocaleDateString?.()}
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

      <ShoppingListHeader
        hideNoneGroup
        searchText={searchText}
        setSearchText={setSearchText}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        onAdd={handleAdd}
      />

      <ShoppingList
        selectedRecipe={selectedRecipe}
        groupBy={groupBy}
        searchText={searchText}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onToggle={handleToggleItem}
      />
    </>
  ) : (
    <></>
  );
};

export default RecipeCard;
