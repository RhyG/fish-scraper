import puppeteer, { Page } from "puppeteer";
import { FishDoc } from "../../sheet";

const product_categories = [
  "https://fish.shimano.com/en-AU/product/lures/hardbody.html",
  "https://fish.shimano.com/en-AU/product/lures/jigginglures.html",
  "https://fish.shimano.com/en-AU/product/lures/squidjigs.html",
  "https://fish.shimano.com/en-AU/product/lures/softplastics.html",
  "https://fish.shimano.com/en-AU/product/lures/stickbaits.html",
  "https://fish.shimano.com/en-AU/product/lures/poppers.html",
];

const productData = {};

// Instantiate document
(async function () {
  try {
    await FishDoc.loadInfo();
    console.log("Retrieved doc:", FishDoc.title);
  } catch (error) {
    console.error(error);
  }
})();

async function scrapeProds(url: string) {
  console.log("Scraping URL", url);
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const productSelector = ".thumbnail__item";
    const products = await page.$$(productSelector);

    console.log(`Got ${products.length} products`);

    let specsArray = [];

    for (const product of products) {
      // @ts-ignore
      const title = await product.$eval(".thumbnail__title", (e) => e?.innerText);
      // console.log(title.trim());

      const href = await product.$eval("a", (e) => e?.href);
      // console.log("Got href:", `${href}#specification`);

      // Open the product page
      const detailPage = await browser.newPage();
      await detailPage.goto(`${href}#specification`, { waitUntil: "domcontentloaded" });

      await detailPage.waitForSelector(".spec-table__thead");

      // Assuming you want to capture the inner text of each header
      // const allHeaders = await detailPage.$$eval(".spec-table__thead--clone th p", (ths) =>
      //   ths.map((th) => th.innerText.trim())
      // );

      // Extracting row data
      const rowData = await detailPage.evaluate(() => {
        const data: any[] = [];
        const rows = document.querySelectorAll(".spec-table__tbody tr");
        rows.forEach((row) => {
          // console.log("Got row:", row);
          const rowObj = {};
          const cells = row.querySelectorAll("td");
          cells.forEach((cell, index) => {
            // Assuming headers is available in this scope, else fetch similarly
            // @ts-ignore
            const header = document.querySelectorAll(".spec-table__thead--original th p")[index].innerText.trim();
            // @ts-ignore
            rowObj[header] = cell.innerText.trim();
          });
          data.push(rowObj);
        });
        return data;
      });

      // @ts-ignore
      productData[title] = rowData;
    }

    browser.close();

    return {};
  } catch (error) {
    console.log("Error:", error);
  } finally {
  }
}

(async function () {
  for await (const category of product_categories) {
    await scrapeProds(category);
  }

  try {
    const sheet = FishDoc.sheetsByIndex[4];

    for (const [NAME, variants] of Object.entries(productData)) {
      // @ts-ignore
      for (const variant of variants) {
        await sheet.addRow({ NAME, ...variant });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.log(error);
  }
})();

const x = "https://fish.shimano.com/en-AU/product/lures/hardbody/a155f00000cqeoqqa1.html";
