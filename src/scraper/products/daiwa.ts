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
  weight: string;
  depth: string;
  length: string;
}

interface Reel {
  model: string;
  "ball bearing": string;
  "drag pressure": string;
  gear: string;
  "spool capacity": string;
  weight: string;
  sku: string;
  price: string;
  drag: string;
  bearings: string;
  ratio: string;
  "handle type": string;
  "mono capacity": string;
  "j-braid capacity": string;
  "spool capacity (mono)": string;
  "spool capacity (j-braid)": string;
}

const luresURL = "https://daiwafishing.com.au/collections/lures";
const reelsURL = "https://daiwafishing.com.au/collections/reels";

// Instantiate document
(async function () {
  try {
    await FishDoc.loadInfo();
    console.log("Retrieved doc:", FishDoc.title);
  } catch (error) {
    console.error(error);
  }
})();

async function scrapeLures() {
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

// scrapeLures().then(async (lures) => {
//   console.log("WE GOT LURES BABY:", lures.length);

//   const start = performance.now();
//   try {
//     const sheet = FishDoc.sheetsByIndex[5];
//     for await (const lure of lures) {
//       sheet.addRow({
//         BRAND: lure.brand,
//         NAME: lure.model,
//         "ITEM CODE": lure.sku,
//         LENGTH: lure["length (mm)"] ?? lure.length,
//         RRP: lure.price,
//         WEIGHT: lure.weight,
//         DEPTH: lure.depth,
//       });
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     }
//   } catch (error) {
//     console.log(error);
//   } finally {
//     const end = performance.now();
//     console.log("Time taken:", end - start);
//   }
// });

async function scrapeReels() {
  const reels: Reel[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.goto(reelsURL, { waitUntil: "domcontentloaded" });
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

      const selector = ".grid.grid-border";
      const parent = document.querySelector(selector);
      if (!parent) return [];

      // Select all div children directly under the parent
      // Then find the anchor tag inside each div and get its href attribute
      // @ts-ignore
      const arr = Array.from(parent.querySelectorAll("div > a")).map((a) => a.href);
      return Array.from(new Set(arr.filter((a) => a !== "" && a.includes("https"))));
    });

    console.log("Got products:", products.length);

    for (const product of products) {
      // Open the product page
      const detailPage = await browser.newPage();
      await detailPage.goto(product, { waitUntil: "domcontentloaded" });

      // Assuming the table is uniquely identified by its ID, we'll use it to locate the table
      const tableSelector = "#DataTables_Table_0";

      // Extract the data
      const extractedData = await detailPage.evaluate((tableSelector) => {
        const table = document.querySelector(tableSelector);

        if (!table) return [];

        const heads = table.querySelectorAll("thead th");
        const rows = table.querySelectorAll("tbody tr");
        // @ts-ignore
        const headers = Array.from(heads).map((th) => th.dataset.attr || th.innerText.trim());
        const data = Array.from(rows).map((row) => {
          const cells = row.querySelectorAll("td");
          const rowData = {} as Reel;
          cells.forEach((cell, index) => {
            const key = headers[index]; // Using the headers as keys
            // @ts-ignore
            rowData[key] = cell.innerText.trim();
          });
          return rowData;
        });

        return data;
      }, tableSelector);

      reels.push(...extractedData);
    }
  } catch (error) {
    console.error(error);
  } finally {
    browser.close();
    return reels;
  }
}

scrapeReels().then(async (reels) => {
  console.log("WE GOT REELS BABY:", reels.length);

  const start = performance.now();
  try {
    const sheet = FishDoc.sheetsByIndex[6];
    for await (const reel of reels) {
      sheet.addRow({
        BRAND: "Daiwa",
        NAME: reel.model,
        "ITEM CODE": reel.sku,
        PRICE: reel.price,
        GEAR: reel.gear,
        WEIGHT: reel.weight,
        "BALL BEARING": reel["ball bearing"] ?? reel.bearings,
        DRAG: reel.drag ?? reel["drag pressure"],
        RATIO: reel.ratio,
        "HANDLE TYPE": reel["handle type"],
        "MONO CAPACITY": reel["mono capacity"] ?? reel["spool capacity (mono)"],
        "J-BRAID CAPACITY": reel["j-braid capacity"] ?? reel["spool capacity (j-braid)"],
        "SPOOL CAPACITY": reel["spool capacity"],
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.log(error);
  } finally {
    const end = performance.now();
    console.log("Time taken:", end - start);
  }
});

// const x = {
//   model: "MARINEPOWER 3000 (12V)",
//   "ball bearing": "16BB (2CRBB-1MSBB)",
//   "drag pressure": "90kg",
//   gear: "1.7",
//   "spool capacity": "PE 1400/120lb; 1000/150lb",
//   weight: "5560g",
//   sku: "26866",
//   price: "$5899.00",
// };
// const z = {
//   model: "23 MAVERICK 6000-XH",
//   gear: "6.2",
//   weight: "430g",
//   "ball bearing": "7BB (1 CRBB, 1MSBB, 1RB)",
//   drag: "12kg",
//   "spool capacity": "PE 3/300m",
//   "spool capacity (j-braid)": "PE 2/ 300m",
//   "spool capacity (mono)": "20lb- 150m",
//   sku: "22141",
//   price: "$599.00",
//   ratio: "6.2:1",
// };

// const y = {
//   model: "23 TD SOL HD 3000D-XH",
//   gear: "6.2:1 (93cm)",
//   weight: "255g",
//   bearings: "8+1 (5 CRBB)",
//   "drag pressure": "10kg",
//   "spool capacity": "PE 1.5/300m",
//   sku: "21716",
//   price: "$409.00",
// };

// const f = {
//   model: "16 SALTIST 6500",
//   "ball bearing": "7CRBB +1MJ; 1RB",
//   "drag pressure": "15kg",
//   gear: "5.3",
//   "spool capacity": "PE 5/500m; 6/400m",
//   weight: "850g",
//   sku: "22246",
//   price: "$339.00",
// };

// const a = {
//   model: "AGGREST LT 5000 SPIN REEL",
//   "ball bearing": "4BB; 1RB",
//   "drag pressure": "12kg",
//   gear: "5.2",
//   "spool capacity": "PE 1.5/200m",
//   weight: "280g",
//   sku: "21473",
//   price: "$0.00",
//   "handle type": "Soft Touch",
// };
