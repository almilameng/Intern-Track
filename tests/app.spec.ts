import { test, expect } from "@playwright/test";
test("landing links and complete application lifecycle persist", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/landing-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Start tracking for free" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page.screenshot({
    path: `test-results/dashboard-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Add application", exact: true })
    .click();
  await page.getByLabel("Company", { exact: false }).fill("Test Company");
  await page
    .getByLabel("Position", { exact: false })
    .fill("Engineering Intern");
  await page.getByLabel("Location", { exact: true }).fill("Remote");
  await page.getByLabel("Deadline", { exact: true }).fill("2027-05-20");
  await page.getByLabel("Status", { exact: true }).selectOption("Applied");
  await page
    .getByLabel("Notes", { exact: true })
    .fill("Follow up with campus recruiter");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add application" })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page.getByLabel("Search applications").fill("campus recruiter");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Edit Test Company Engineering Intern" })
    .click();
  await expect(page.getByLabel("Notes", { exact: true })).toHaveValue(
    "Follow up with campus recruiter",
  );
  await page.getByLabel("Status", { exact: true }).selectOption("Offer");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByLabel("Filter by status").selectOption("Applied");
  await expect(page.getByText("No matching applications")).toBeVisible();
  await page.getByLabel("Filter by status").selectOption("Offer");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Delete Test Company Engineering Intern" })
    .click();
  await page.getByRole("button", { name: "Keep application" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Delete Test Company Engineering Intern" })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("empty saved list is not reseeded and dialog supports Escape", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("interntrack.applications.v1", "[]"),
  );
  await page.goto("/dashboard");
  await expect(
    page.getByText("Your next chapter is a blank page."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add your first application" })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});
test("corrupted storage is reported without silently overwriting it", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("interntrack.applications.v1", "not-json"),
  );
  await page.goto("/dashboard");
  await expect(page.getByRole("alert").filter({ hasText: "could not be loaded" })).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("interntrack.applications.v1"),
    ),
  ).toBe("not-json");
});
