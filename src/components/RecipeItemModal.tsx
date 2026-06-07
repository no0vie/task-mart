import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Space, Tag } from "antd";
import { AVAILABLE_TAGS, TAG_ICON_MAP } from "../constants/tags";
import type { ShoppingItem, TagType } from "../types";

interface RecipeItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  editingItem: ShoppingItem | null;
}

const RecipeItemModal: React.FC<RecipeItemModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingItem,
}) => {
  const [form] = Form.useForm();

  const title = editingItem ? "Редактировать покупку" : "Добавить покупку";
  const submitText = editingItem ? "Сохранить" : "Добавить";

  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue(editingItem);
    } else {
      form.resetFields();
    }
  }, [editingItem, form]);

  const getTagIcon = (tagId: TagType) => {
    const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
    if (!tag) return null;
    const IconComp = TAG_ICON_MAP[tag.icon];
    return <IconComp />;
  };

  return (
    <Modal title={title} open={visible} onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Например: Картофель" />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Количество"
          rules={[{ required: true, message: "Укажите количество" }]}
        >
          <Input placeholder="Например: 2 шт или 500 г" />
        </Form.Item>
        <Form.Item name="tags" label="Теги">
          <Select mode="multiple" placeholder="Выберите теги" allowClear>
            {AVAILABLE_TAGS.map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                <Space>
                  {getTagIcon(tag.id)}
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {submitText}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RecipeItemModal;
