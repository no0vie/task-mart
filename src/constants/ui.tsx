import { Tag } from "../types";
import {
  ShoppingOutlined,
  AppleOutlined,
  ExperimentOutlined,
  FireOutlined,
  CoffeeOutlined,
  GiftOutlined,
  BugOutlined,
  DatabaseOutlined,
  BookOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

export const AVAILABLE_TAGS: Tag[] = [
  {
    id: "bakaleya",
    name: "Бакалея",
    color: "#faad14",
    icon: "ShoppingOutlined",
  },
  {
    id: "conservy",
    name: "Консервы",
    color: "#722ed1",
    icon: "DatabaseOutlined",
  },
  { id: "ovoshi", name: "Овощи", color: "#52c41a", icon: "BugOutlined" },
  { id: "myaso", name: "Мясо", color: "#f5222d", icon: "FireOutlined" },
  {
    id: "molochnoe",
    name: "Молочное",
    color: "#1890ff",
    icon: "CoffeeOutlined",
  },
  { id: "frukty", name: "Фрукты", color: "#eb2f96", icon: "AppleOutlined" },
  { id: "specy", name: "Специи", color: "#fa8c16", icon: "ExperimentOutlined" },
  { id: "drinks", name: "Напитки", color: "#13c2c2", icon: "GiftOutlined" },
];

export const TAG_ICON_MAP: Record<string, any> = {
  ShoppingOutlined,
  DatabaseOutlined,
  BugOutlined,
  FireOutlined,
  CoffeeOutlined,
  AppleOutlined,
  ExperimentOutlined,
  GiftOutlined,
};

export const GROUP_BY_OPTIONS = [
  { label: 'По рецепту', value: 'recipe' as const, icon: <BookOutlined /> },
  { label: 'По тегам', value: 'tag' as const, icon: <TagsOutlined /> },
  { label: 'Без группировки', value: 'none' as const, icon: <UnorderedListOutlined /> }
];

export const MENU_ITEMS = [
  { key: "1", icon: <BookOutlined />, label: "Мои рецепты" },
  { key: "2", icon: <ShoppingCartOutlined />, label: "Список покупок" },
];
