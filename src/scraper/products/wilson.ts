import puppeteer from "puppeteer";
import { FishDoc } from "../../sheet";

const lures = [
  "http://www.wilsonfishing.com/Products/Lures/Venom-Lures",
  "http://www.wilsonfishing.com/Products/Lures/Zerek-Innovation-Lures",
  "http://www.wilsonfishing.com/Products/Lures/Bone-Lures",
  "http://www.wilsonfishing.com/Products/Lures/Duo",
  "http://www.wilsonfishing.com/Products/Lures/Live-Target",
  "http://www.wilsonfishing.com/Products/Lures/Mustad-Lures",
  "http://www.wilsonfishing.com/Products/Lures/McArthy-Baits",
  "http://www.wilsonfishing.com/Products/Lures/Sure-Catch-Lures",
  "http://www.wilsonfishing.com/Products/Lures/Toughfia-",
  "http://www.wilsonfishing.com/Products/Lures/Fish-Art",
];

async function scrapeLures() {
  const completed: any[] = [];
  let total = 0;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const lure of lures) {
    console.log("Running", lure);
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.goto(lure, { waitUntil: "networkidle2" });
    await page.setViewport({ width: 1080, height: 1024 });

    // Selector for most products
    // const products = await page.$$(".col.medium-4.small-6.large-3");

    const products = await page.$$(".product-small");

    console.log("Got products", products.length);

    for (const product of [1]) {
      // const href = await product.$eval("a", (e) => e?.href);

      const detailPage = await browser.newPage();
      await detailPage.goto("https://berkley-fishing.com.au/product/berkley-skid-jig/", { waitUntil: "networkidle2" });

      const table = await detailPage.waitForSelector(".tablepress");

      // Extract the headers
      // @ts-ignore
      const headers = await table.$$eval("thead tr th", (ths) => ths.map((th) => th?.textContent?.trim() ?? "NOTHING"));

      // Extract the rows
      const rows = await detailPage.$$eval(
        "tbody tr",
        (trs, headers) =>
          trs.map((tr) => {
            const cells = tr.querySelectorAll("td");
            const rowObj = {};
            cells.forEach((cell, index) => {
              // Use headers for keys
              const key = headers[index];
              // @ts-ignore
              rowObj[key] = cell.textContent.trim();
            });
            return rowObj;
          }),
        headers
      );

      completed.push(...(rows as any[]));
    }

    total += products.length;
  }

  console.log("Total products --------------------------------");
  console.log(total);
  console.log("Total products --------------------------------");
  browser.close();

  return completed;
}
