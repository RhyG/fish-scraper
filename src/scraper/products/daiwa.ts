import puppeteer, { Page } from "puppeteer";
import { FishDoc } from "../../sheet";

interface Lure {
  brand: string;
  model: string;
  "length (in)": string;
  "length (mm)": string;
  "qty per pack": string;
  sku: string;
  price: string;
}

const luresURL = "https://daiwafishing.com.au/collections/lures";

// Instantiate document
(async function () {
  try {
    await FishDoc.loadInfo();
    console.log("Retrieved doc:", FishDoc.title);
  } catch (error) {
    console.error(error);
  }
})();

async function scrapeReels() {
  const lures: Lure[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.goto(luresURL, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.evaluate(async () => {
      await new Promise((resolve) => {
        var totalHeight = 0;
        var distance = 1000; // Should be less than or equal to window.innerHeight
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve("");
          }
        }, 2000);
      });

      const parent = document.querySelector(".grid-item.large--one-whole.collection-all");
      if (!parent) return [];

      // Select all div children directly under the parent
      // Then find the anchor tag inside each div and get its href attribute
      // @ts-ignore
      const arr = Array.from(parent.querySelectorAll("div > a")).map((a) => a.href);
      return Array.from(new Set(arr.filter((a) => a !== "")));
    });

    for (const product of products) {
      // Open the product page
      const detailPage = await browser.newPage();
      await detailPage.goto(product, { waitUntil: "domcontentloaded" });

      // Assuming the table is uniquely identified by its ID, we'll use it to locate the table
      const tableSelector = "#DataTables_Table_0";

      // Extract the data
      const extractedData = await detailPage.evaluate((tableSelector) => {
        const table = document.querySelector(tableSelector);
        // @ts-ignore
        const heads = table.querySelectorAll("thead th");
        // @ts-ignore
        const rows = table.querySelectorAll("tbody tr");
        // @ts-ignore
        const headers = Array.from(heads).map((th) => th.dataset.attr || th.innerText.trim());
        const data = Array.from(rows).map((row) => {
          const cells = row.querySelectorAll("td");
          const rowData = { brand: "Daiwa" } as Lure;
          cells.forEach((cell, index) => {
            const key = headers[index]; // Using the headers as keys
            // @ts-ignore
            rowData[key] = cell.innerText.trim();
          });
          return rowData;
        });

        return data;
      }, tableSelector);

      lures.push(...extractedData);
    }
  } catch (error) {
    console.error(error);
  } finally {
    browser.close();
    return lures;
  }
}

scrapeReels().then(async (lures) => {
  console.log("WE GOT LURES BABY:", lures.length);

  try {
    const sheet = FishDoc.sheetsByIndex[5];

    for await (const lure of lures) {
      sheet.addRow({
        BRAND: lure.brand,
        NAME: lure.model,
        "ITEM CODE": lure.sku,
        LENGTH: lure["length (mm)"],
        RRP: lure.price,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.log(error);
  }
});
