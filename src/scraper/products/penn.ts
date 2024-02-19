import puppeteer, { Page } from "puppeteer";
import { FishDoc } from "../../sheet";

const reelCategories = [
  "https://pennfishing.com.au/penn-spinning-reels/",
  "https://pennfishing.com.au/overhead-reels/",
  "https://pennfishing.com.au/penn-low-profile-reels/",
];

// Instantiate document
(async function () {
  try {
    await FishDoc.loadInfo();
    console.log("Retrieved doc:", FishDoc.title);
  } catch (error) {
    console.error(error);
  }
})();

interface Reel {
  model: string;
  sku: string;
  "fishing type": string;
  color: string;
  "mono capacity m/mm": string;
  "braid capacity m/mm": string;
  "reel handle position": string;
  "anti-reverse feature": string;
  "gear ratio": string;
  "recovery rate": string;
  "drag material": string;
  "bearing count": string;
  "reel spool material": string;
  "drag type": string;
  "product weight": string;
  price: string;
  colour: string;
  "max drag": string;
  "bail trip": string;
  weight: string;
  rrp: string;
  "mono capacity m / mm": string;
}

async function scrapeReels() {
  const reels: Reel[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    for (const url of reelCategories) {
      console.log("TRYING", url);
      page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.setViewport({ width: 1080, height: 1024 });

      const products = await page.$$(".product-small");
      console.log("Got products", products.length);

      for (const product of products) {
        const href = await product.$eval("a", (a) => a.href);
        console.log("GOT LINK", href);

        const detailPage = await browser.newPage();
        detailPage.on("console", (msg) => console.log("DETAIL PAGE LOG:", msg.text()));
        await detailPage.goto(href, { waitUntil: "networkidle2" });

        await detailPage.waitForSelector(".tablepress");

        const keys = await detailPage.$$eval(".tablepress thead tr th", (ths) =>
          // @ts-ignore
          ths.map((th) => th.textContent.trim())
        );

        const rows = await detailPage.$$eval(
          ".tablepress tbody tr",
          (trs, keys) =>
            trs.map((tr) => {
              const cells = tr.querySelectorAll("td");
              const rowObj = {};
              cells.forEach((cell, index) => {
                const key = keys[index].toLowerCase();
                // @ts-ignore
                rowObj[key] = cell.textContent.trim();
              });
              return rowObj;
            }),
          keys
        );
        // @ts-ignore
        reels.push(...rows);
        await detailPage.close(); // Close the detail page after processing
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close(); // Ensure the browser is closed after all processing
  }
  return reels; // Return the accumulated results
}

// scrapeReels().then(async (reels) => {
//   console.log("WE GOT REELS BABY:", reels.length);

//   const start = performance.now();
//   try {
//     const sheet = FishDoc.sheetsByIndex[6];
//     for await (const reel of reels) {
//       // console.log({ reel });
//       sheet.addRow({
//         BRAND: "Penn",
//         NAME: reel.model,
//         "ITEM CODE": reel.sku,
//         PRICE: reel.price ?? reel.rrp,
//         WEIGHT: reel.weight ?? reel["product weight"],
//         "BEARING COUNT": reel["bearing count"],
//         DRAG: reel["max drag"],
//         "DRAG MATERIAL": reel["drag material"],
//         RATIO: reel["gear ratio"],
//         "MONO CAPACITY": reel["mono capacity m/mm"] ?? reel["mono capacity m / mm"],
//         "J-BRAID CAPACITY": reel["braid capacity m/mm"],
//         COLOUR: reel.colour ?? reel.color,
//         "FISHING TYPE": reel["fishing type"],
//         "REEL SPOOL MATERIAL": reel["reel spool material"],
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

// // @ts-ignore
// function extractUniqueKeys(data) {
//   // Initialize an empty Set to keep track of unique keys
//   const uniqueKeys = new Set();

//   // Loop over each object in the input array
//   // @ts-ignore
//   data.forEach((obj) => {
//     // Loop over each key in the object
//     Object.keys(obj).forEach((key) => {
//       // Add the key to the Set (Sets automatically remove duplicates)
//       uniqueKeys.add(key.toLowerCase());
//     });
//   });

//   // Convert the Set to an array and return it
//   // The spread operator (...) is used to expand the Set into an array
//   return [...uniqueKeys];
// }

// const keys = extractUniqueKeys(x);
// console.log({ keys });
// const y = [
//   "model",
//   "sku",
//   "fishing type",
//   "color",
//   "mono capacity yd/lb",
//   "mono capacity m/mm",
//   "braid capacity yd/lb",
//   "braid capacity m/mm",
//   "reel handle position",
//   "anti-reverse feature",
//   "gear ratio",
//   "recovery rate",
//   "drag material",
//   "bearing count",
//   "max drag lb",
//   "reel spool material",
//   "drag type",
//   "product weight",
//   "price",
//   "colour",
//   "max drag",
//   "bail trip",
//   "weight",
//   "rrp",
//   "mono capacity m / mm",
//   "mono capacity y / lb",
// ];

const rodCategories = ["https://pennfishing.com.au/spinning-rods/", "https://pennfishing.com.au/overhead-rods/"];

interface Rod {
  sap: string;
  description: string;
  "fishing type": string;
  action: string;
  "line rating": string;
  "cast weight": string;
  length: string;
  pcs: string;
  "blank material": string;
  "handle material": string;
  "guide type": string;
  rrp: string;
  model: string;
  sku: string;
  colour: string;
  "number of pieces": string;
  blank: string;
  "rod power": string;
  "rod length": string;
  pieces: string;
  price: string;
}

async function scrapeRods() {
  const reels: Rod[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    for (const url of rodCategories) {
      console.log("TRYING", url);
      page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.setViewport({ width: 1080, height: 1024 });

      const products = await page.$$(".product-small");
      console.log("Got products", products.length);

      for (const product of products) {
        const href = await product.$eval("a", (a) => a.href);
        console.log("GOT LINK", href);

        const detailPage = await browser.newPage();
        detailPage.on("console", (msg) => console.log("DETAIL PAGE LOG:", msg.text()));
        await detailPage.goto(href, { waitUntil: "networkidle2" });

        await detailPage.waitForSelector(".tablepress");

        const keys = await detailPage.$$eval(".tablepress thead tr th", (ths) =>
          // @ts-ignore
          ths.map((th) => th.textContent.trim())
        );

        const rows = await detailPage.$$eval(
          ".tablepress tbody tr",
          (trs, keys) =>
            trs.map((tr) => {
              const cells = tr.querySelectorAll("td");
              const rowObj = {};
              cells.forEach((cell, index) => {
                const key = keys[index].toLowerCase();
                // @ts-ignore
                rowObj[key] = cell.textContent.trim();
              });
              return rowObj;
            }),
          keys
        );
        // @ts-ignore
        reels.push(...rows);
        await detailPage.close(); // Close the detail page after processing
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close(); // Ensure the browser is closed after all processing
  }
  return reels; // Return the accumulated results
}

scrapeRods().then(async (rods) => {
  console.log("WE GOT RODS BABY:", rods.length);

  const start = performance.now();
  try {
    const sheet = FishDoc.sheetsByIndex[7];
    for await (const rod of rods) {
      // console.log({ rod });
      sheet.addRow({
        BRAND: "Penn",
        NAME: rod.model ?? rod.description,
        "ITEM CODE": rod.sku ?? rod.sap,
        PRICE: rod.price ?? rod.rrp,
        CASTWEIGHT: rod["cast weight"],
        LENGTH: rod.length ?? rod["rod length"],
        SECTION: rod.pcs ?? rod["number of pieces"],
        TYPE: rod["fishing type"],
        ACTION: rod.action ?? rod["rod power"],
        "GUIDE TYPE": rod["guide type"],
        "HANDLE MATERIAL": rod["handle material"],
        COLOUR: rod.colour,
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
