import React from "react";
import {
  List,
  Tooltip,
  Button,
  Popconfirm,
  Checkbox,
  Space,
  Tag,
  Typography,
  Flex,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ShoppingItem } from "../types";
import { AVAILABLE_TAGS, TAG_ICON_MAP } from "../constants/ui";

const { Text } = Typography;

const getTagIcon = (tagId: string) => {
  const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
  if (!tag) return null;
  const IconComponent = TAG_ICON_MAP[tag.icon];
  return <IconComponent />;
};

export interface ShoppingListItemProps {
  item: ShoppingItem;
  showTag?: boolean;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onEdit,
  showTag,
  onDelete,
  onToggle,
}) => {
  const actions = [
    <Tooltip title="Редактировать" key="edit">
      <Button
        style={{ flexShrink: 0 }}
        type="text"
        icon={<EditOutlined />}
        onClick={() => onEdit(item)}
      />
    </Tooltip>,
    <Popconfirm
      title="Удалить пункт?"
      onConfirm={() => onDelete(item.id)}
      okText="Да"
      cancelText="Нет"
      key="delete"
    >
      <Button
        style={{ flexShrink: 0 }}
        type="text"
        danger
        icon={<DeleteOutlined />}
      />
    </Popconfirm>,
  ];

  return (
    <List.Item>
      <List.Item.Meta
        title={
          <Flex style={{ gap: 8 }} align="baseline">
            <Checkbox
              style={{ flexShrink: 0 }}
              checked={item.completed}
              onChange={() => onToggle(item.id)}
            />
            <Text
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textDecoration: item.completed ? "line-through" : "none",
                color: item.completed ? "#999" : "#000",
              }}
            >
              {item.name}
            </Text>
            {actions.map((item) => item)}
          </Flex>
        }
        description={
          <Space size={4} wrap>
            <Text type="secondary">{item.amount}</Text>
            {showTag &&
              item.tags.map((tagId) => {
                const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                return tag ? (
                  <Tag
                    key={tagId}
                    color={tag.color}
                    icon={getTagIcon(tagId)}
                    style={{ margin: "2px" }}
                  >
                    {tag.name}
                  </Tag>
                ) : null;
              })}
          </Space>
        }
      />
    </List.Item>
  );
};

export default ShoppingListItem;
