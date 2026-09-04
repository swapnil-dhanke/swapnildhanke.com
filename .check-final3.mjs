import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForSelector("nav");
await page.waitForTimeout(400);

for (const href of ["/about", "/projects", "/contact", "/blogs"]) {
  await page.click(`nav a[href="${href}"]`);
  await page.waitForURL(`**${href}`);
  await page.waitForTimeout(350);
}

console.log("final label:", await page.locator(".nav-label-enter").textContent());
console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
await browser.close();
