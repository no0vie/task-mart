import { test, expect, type Page } from "@playwright/test";

/** Helper to reset the app state before each test */
async function resetApp(page: Page) {
  await page.goto("/");
  // Clear persisted data so demo recipes are loaded again.
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
}

/** Locators for RecipeModal fields */
const titleInput = (page: Page) =>
  page.getByPlaceholder("Например: Борщ украинский");
const descriptionTextarea = (page: Page) =>
  page.getByPlaceholder("Краткое описание рецепта");
const cookingTimeInput = (page: Page) =>
  page.getByLabel("Время приготовления (мин)");
const servingsInput = (page: Page) => page.getByLabel("Количество порций");
const createButton = (page: Page) =>
  page.getByRole("button", { name: "Создать" });
const saveButton = (page: Page) =>
  page.getByRole("button", { name: "Сохранить" });
const modalDialog = (page: Page) => page.locator(".ant-modal");

/** Find a recipe row in the sidebar by its title */
function recipeRow(page: Page, title: string) {
  return page.locator(".ant-list-item").filter({ hasText: title });
}
const editIcon = (row: Locator) => row.locator("span.anticon-edit");

// Helper type for locator objects.
type Locator = import("@playwright/test").Locator;

/** Test suite for RecipeModal interactions */
test.describe("RecipeModal – workflow", () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test("should allow creating a new recipe with all form fields", async ({
    page,
  }) => {
    // Open the modal to create a new recipe.
    await page.getByRole("button", { name: "Новый рецепт" }).click();
    await expect(modalDialog(page)).toBeVisible({ timeout: 5000 });

    // Verify all form fields are present.
    await expect(titleInput(page)).toBeVisible();
    await expect(descriptionTextarea(page)).toBeVisible();
    await expect(cookingTimeInput(page)).toBeVisible();
    await expect(servingsInput(page)).toBeVisible();

    // Fill out the form.
    await titleInput(page).fill("Test Recipe");
    await descriptionTextarea(page).fill("A simple recipe for testing");
    await cookingTimeInput(page).fill("15");
    await servingsInput(page).fill("2");

    // Submit the new recipe.
    await createButton(page).click();
    await expect(modalDialog(page)).not.toBeVisible({ timeout: 5000 });

    // Verify that the new recipe appears in the sidebar list.
    const createdRow = recipeRow(page, "Test Recipe");
    await expect(createdRow).toBeVisible({ timeout: 5000 });
  });

  test("should allow editing an existing recipe and persist changes", async ({
    page,
  }) => {
    // Step 1: Create a recipe to edit.
    await page.getByRole("button", { name: "Новый рецепт" }).click();
    await expect(modalDialog(page)).toBeVisible({ timeout: 5000 });
    await titleInput(page).fill("Initial Recipe");
    await descriptionTextarea(page).fill("Initial description");
    await cookingTimeInput(page).fill("10");
    await servingsInput(page).fill("1");
    await page.getByRole("button", { name: "Создать" }).click();
    await expect(modalDialog(page)).not.toBeVisible({ timeout: 5000 });

    const initialRow = recipeRow(page, "Initial Recipe");
    await expect(initialRow).toBeVisible({ timeout: 5000 });

    // Step 2: Edit the recipe.
    await editIcon(initialRow as unknown as Locator).click();
    await expect(modalDialog(page)).toBeVisible();
    await titleInput(page).fill("Updated Recipe");
    await descriptionTextarea(page).fill("Updated description");
    await cookingTimeInput(page).fill("20");
    await servingsInput(page).fill("3");
    await saveButton(page).click();
    await expect(modalDialog(page)).not.toBeVisible({ timeout: 5000 });

    // Verify the updated title in the sidebar.
    const updatedRow = recipeRow(page, "Updated Recipe");
    await expect(updatedRow).toBeVisible({ timeout: 5000 });

    // Step 3: Open modal again to confirm values are pre‑filled.
    await editIcon(updatedRow as unknown as Locator).click();
    await expect(modalDialog(page)).toBeVisible();
    await expect(titleInput(page)).toHaveValue("Updated Recipe");
    await expect(descriptionTextarea(page)).toHaveValue("Updated description");
    await expect(cookingTimeInput(page)).toHaveValue("20");
    await expect(servingsInput(page)).toHaveValue("3");
  });

  test("should allow creating a recipe and editing it twice, with all fields persisted", async ({
    page,
  }) => {
    // Open the modal to create a new recipe.
    await page.getByRole("button", { name: "Новый рецепт" }).click();
    await expect(modalDialog(page)).toBeVisible({ timeout: 5000 });

    // Verify all form fields are present.
    await expect(titleInput(page)).toBeVisible();
    await expect(descriptionTextarea(page)).toBeVisible();
    await expect(cookingTimeInput(page)).toBeVisible();
    await expect(servingsInput(page)).toBeVisible();

    // Fill out the form.
    await titleInput(page).fill("Test Recipe");
    await descriptionTextarea(page).fill("A simple recipe for testing");
    await cookingTimeInput(page).fill("15");
    await servingsInput(page).fill("2");

    // Submit the new recipe.
    await createButton(page).click();
    await expect(modalDialog(page)).not.toBeVisible({ timeout: 5000 });

    // Verify that the new recipe appears in the sidebar list.
    const createdRow = recipeRow(page, "Test Recipe");
    await expect(createdRow).toBeVisible({ timeout: 5000 });

    // First edit – change all fields.
    await editIcon(createdRow as unknown as Locator).click();
    await expect(modalDialog(page)).toBeVisible();
    await titleInput(page).fill("Edited Recipe");
    await descriptionTextarea(page).fill("Updated description");
    await cookingTimeInput(page).fill("20");
    await servingsInput(page).fill("3");
    await saveButton(page).click();
    await expect(modalDialog(page)).not.toBeVisible({ timeout: 5000 });

    // Verify updated title in list.
    const editedRow = recipeRow(page, "Edited Recipe");
    await expect(editedRow).toBeVisible({ timeout: 5000 });

    // Second edit – change again.
    await editIcon(editedRow as unknown as Locator).click();
    await expect(modalDialog(page)).toBeVisible();
    await titleInput(page).fill("Final Recipe");
    await descriptionTextarea(page).fill("Final changes");
    await cookingTimeInput(page).fill("25");
    await servingsInput(page).fill("4");
    await saveButton(page).click();
    await expect(modalDialog(page)).not.toBeVisible({ timeout: 5000 });

    // Verify final changes.
    const finalRow = recipeRow(page, "Final Recipe");
    await expect(finalRow).toBeVisible({ timeout: 5000 });

    // Open the modal again to confirm form is pre‑filled with last values.
    await editIcon(finalRow as unknown as Locator).click();
    await expect(modalDialog(page)).toBeVisible();
    await expect(titleInput(page)).toHaveValue("Final Recipe");
    await expect(descriptionTextarea(page)).toHaveValue("Final changes");
    await expect(cookingTimeInput(page)).toHaveValue("25");
    await expect(servingsInput(page)).toHaveValue("4");
  });
});
