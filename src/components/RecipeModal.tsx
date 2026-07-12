import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, Space } from "antd";
import type { Recipe } from "../types";
import { RECIPE_MODAL } from "../constants/testIds";

interface RecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  editingRecipe: Recipe | null;
  form: any;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingRecipe,
  form,
}) => {
  const title = editingRecipe ? "Редактировать рецепт" : "Новый рецепт";
  const submitText = editingRecipe ? "Сохранить" : "Создать";

  useEffect(() => {
    if (editingRecipe) {
      form.setFieldsValue(editingRecipe);
    } else {
      form.resetFields();
    }
  }, [editingRecipe, form]);

  return (
    <Modal title={title} open={visible} onCancel={onClose} footer={null}>
      <Form
        id={RECIPE_MODAL.FORM}
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="title"
          label="Название рецепта"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Например: Борщ украинский" />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} placeholder="Краткое описание рецепта" />
        </Form.Item>
        <Form.Item name="cookingTime" label="Время приготовления (мин)">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="servings" label="Количество порций">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {submitText}
            </Button>
            <Button onClick={onClose}>Отмена</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RecipeModal;
