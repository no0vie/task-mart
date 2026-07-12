import { test, expect, type Page } from "@playwright/test";
import {
  RECIPE_ITEM_MODAL,
  RECIPE_MODAL,
  RECIPE_SIDER,
} from "../src/constants/testIds";

/** Helper to reset the app state before each test */
async function resetApp(page: Page) {
  await page.goto("/");
  // Clear persisted data so demo recipes are loaded again.
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
}

/** Locators for RecipeItemModal fields */
const nameInput = (page: Page) =>
  page.locator(`#${RECIPE_ITEM_MODAL.NAME_INPUT}`);

const valueInput = (page: Page) => page.locator('input[placeholder="500"]'); // value field is an InputNumber

const quantityInput = (page: Page) =>
  page.locator(`#${RECIPE_ITEM_MODAL.QUANTITY_INPUT}`);

const recipeModal = (page: Page) => page.locator(`#${RECIPE_MODAL.FORM}`);

const recipeItemModal = (page: Page) =>
  page.locator(`#${RECIPE_ITEM_MODAL.FORM}`);

/** Helper to locate the edit button for an item */
function editButton(page: Page) {
  return page.getByRole("button", { name: "Редактировать" }).first();
}

// Main test suite for RecipeItemModal workflow

test.describe("RecipeItemModal – workflow", () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test("should allow adding a shopping item to a newly created recipe and editing it", async ({
    page,
  }) => {
    // 1. Create a new recipe first.
    const createRecipeBtn = page.getByRole("button", { name: "Новый рецепт" });
    await createRecipeBtn.click();

    const modal = recipeModal(page);
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Unique title for the recipe.
    const recipeTitle = `TestRecipe-${Date.now()}`;

    const titleInput = page.getByPlaceholder("Например: Борщ украинский");
    await titleInput.fill(recipeTitle);
    // Leave other optional fields blank.
    await page.getByRole("button", { name: "Создать" }).click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // 2. Verify the new recipe appears in sidebar and select it.
    const recipeRow = page.locator(
      `#${RECIPE_SIDER.RECIPE_LIST_ITEM_PREFIX}${recipeTitle}`,
    );
    await expect(recipeRow).toBeVisible({ timeout: 5000 });
    await recipeRow.click();

    // 3. Open modal to add a new shopping item.
    await page.getByRole("button", { name: "Добавить покупку" }).click();
    await expect(recipeItemModal(page)).toBeVisible({ timeout: 5000 });

    // Generate unique name for the test item.
    const uniqueItemName = `TestItem-${Date.now()}`;

    const itemNameField = nameInput(page);
    await itemNameField.fill(uniqueItemName);

    const valueField = valueInput(page);
    await valueField.fill("200");

    const qtyField = quantityInput(page);
    await qtyField.type("г");
    // Ensure suggestion is selected.
    await qtyField.press("ArrowDown");
    await qtyField.press("Enter");

    // 4. Submit the form.
    const addBtn = page.locator(`#${RECIPE_ITEM_MODAL.SUBMIT_BUTTON}`);
    await addBtn.click();
    await expect(recipeItemModal(page)).not.toBeVisible({ timeout: 5000 });

    // 5. Verify item appears in the list.
    const addedItem = page.getByText(uniqueItemName);
    await expect(addedItem).toBeVisible({ timeout: 5000 });

    // todo Ниже фактически начинается другой тест которвый надо вынести

    // 6. Edit the newly added item.
    const editBtn = editButton(page);
    await editBtn.click();
    await expect(recipeItemModal(page)).toBeVisible({ timeout: 5000 });

    // Change name and value.
    const newUniqueName = `Updated-${Date.now()}`;
    await itemNameField.fill(newUniqueName);
    await valueField.fill("300");
    const saveBtn = page.locator(`#${RECIPE_ITEM_MODAL.SUBMIT_BUTTON}`);
    await saveBtn.click();

    // 7. Verify updated item.
    await expect(recipeItemModal(page)).not.toBeVisible({ timeout: 5000 });
    const updatedItem = page.getByText(newUniqueName);
    await expect(updatedItem).toBeVisible({ timeout: 5000 });
  });
});
