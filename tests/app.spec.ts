import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
const password = "Test-only-passphrase-123!";
// Each scenario represents a different visitor. Avoid sharing localhost's rate-limit bucket.
test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({
    "x-forwarded-for": `198.18.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
  });
});
async function signup(page: Page) {
  const email = `automated-test-${randomUUID()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name", { exact: true }).fill("Automated Test");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30000 });
  return email;
}
test("signup, application CRUD, logout, and login persist across browsers", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Start tracking for free" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  const email = await signup(page);
  await expect(page.locator("tbody tr")).toHaveCount(0);
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
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByLabel("Search applications").fill("campus recruiter");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Edit Test Company Engineering Intern" })
    .click();
  await page.getByLabel("Status", { exact: true }).selectOption("Offer");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Filter by status").selectOption("Applied");
  await expect(page.getByText("No matching applications")).toBeVisible();
  await page.getByLabel("Filter by status").selectOption("Offer");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.screenshot({
    path: `test-results/dashboard-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  const context = await browser.newContext();
  const returning = await context.newPage();
  await returning.goto("/login");
  await returning.getByLabel("Email").fill(email);
  await returning.getByLabel("Password").fill("wrong-password");
  await returning.getByRole("button", { name: "Log in" }).click();
  await expect(returning.locator(".error-banner[role=alert]")).toHaveText(
    "Email or password is incorrect.",
  );
  await returning.getByLabel("Password").fill(password);
  await returning.getByRole("button", { name: "Log in" }).click();
  await expect(returning).toHaveURL(/\/dashboard$/);
  await expect(returning.locator("tbody tr")).toHaveCount(1);
  await expect(returning.locator("tbody")).toContainText("Offer");
  await returning
    .getByRole("button", { name: "Delete Test Company Engineering Intern" })
    .click();
  await returning.getByRole("button", { name: "Keep application" }).click();
  await expect(returning.locator("tbody tr")).toHaveCount(1);
  await returning
    .getByRole("button", { name: "Delete Test Company Engineering Intern" })
    .click();
  await returning.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(returning.getByRole("dialog")).not.toBeVisible();
  await returning.reload();
  await expect(returning.locator("tbody tr")).toHaveCount(0);
  await context.close();
});
test("another account cannot read, update, or delete an owner's applications", async ({
  page,
  browser,
}) => {
  await signup(page);
  await page
    .getByRole("button", { name: "Add your first application" })
    .click();
  await page.getByLabel("Company", { exact: false }).fill("Private Company");
  await page.getByLabel("Position", { exact: false }).fill("Private Role");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add application" })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Edit Private Company Private Role" })
    .click();
  await page.getByLabel("Notes", { exact: true }).fill("Private notes");
  const updateRequest = page.waitForRequest(
    (req) => req.method() === "POST" && !!req.headers()["next-action"],
  );
  await page.getByRole("button", { name: "Save changes" }).click();
  const captured = await updateRequest;
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await signup(otherPage);
  await expect(otherPage.locator("tbody tr")).toHaveCount(0);
  const actionHeaders = {
    "next-action": captured.headers()["next-action"],
    "content-type": captured.headers()["content-type"],
    origin: "http://localhost:3000",
  };
  const attack = await otherContext.request.post(captured.url(), {
    headers: actionHeaders,
    data: captured.postData()!,
  });
  expect(await attack.text()).toContain("unavailable");
  await page.route("**/dashboard", async (route) => {
    if (route.request().method() === "POST") await route.abort();
    else await route.continue();
  });
  await page
    .getByRole("button", { name: "Delete Private Company Private Role" })
    .click();
  const deleteRequest = page.waitForRequest(
    (req) => req.method() === "POST" && !!req.headers()["next-action"],
  );
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  const deletion = await deleteRequest;
  const deleteAttack = await otherContext.request.post(deletion.url(), {
    headers: {
      ...actionHeaders,
      "next-action": deletion.headers()["next-action"],
    },
    data: deletion.postData()!,
  });
  expect(await deleteAttack.text()).toContain("unavailable");
  await page.unroute("**/dashboard");
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Edit Private Company Private Role" })
    .click();
  await expect(page.getByLabel("Notes", { exact: true })).toHaveValue(
    "Private notes",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await otherPage.getByRole("button", { name: "Log out" }).click();
  await expect(otherPage).toHaveURL(/\/login$/);
  const unauthenticated = await otherContext.request.post(captured.url(), {
    headers: actionHeaders,
    data: captured.postData()!,
  });
  expect(await unauthenticated.text()).toContain("session expired");
  await otherContext.close();
});
