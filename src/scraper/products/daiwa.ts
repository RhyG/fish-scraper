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

// scrapeReels().then(async (reels) => {
//   console.log("WE GOT REELS BABY:", reels.length);

//   const start = performance.now();
//   try {
//     const sheet = FishDoc.sheetsByIndex[6];
//     for await (const reel of reels) {
// sheet.addRow({
//   BRAND: "Daiwa",
//   NAME: reel.model,
//   "ITEM CODE": reel.sku,
//   PRICE: reel.price,
//   GEAR: reel.gear,
//   WEIGHT: reel.weight,
//   "BALL BEARING": reel["ball bearing"] ?? reel.bearings,
//   DRAG: reel.drag ?? reel["drag pressure"],
//   RATIO: reel.ratio,
//   "HANDLE TYPE": reel["handle type"],
//   "MONO CAPACITY": reel["mono capacity"] ?? reel["spool capacity (mono)"],
//   "J-BRAID CAPACITY": reel["j-braid capacity"] ?? reel["spool capacity (j-braid)"],
//   "SPOOL CAPACITY": reel["spool capacity"],
// });
// await new Promise((resolve) => setTimeout(resolve, 2000));
//     }
//   } catch (error) {
//     console.log(error);
//   } finally {
//     const end = performance.now();
//     console.log("Time taken:", end - start);
//   }
// });

interface Rod {
  Model: string;
  action: string;
  castweight: string;
  length: string;
  "Rec. Line": string;
  section: string;
  taper: string;
  type: string;
  sku: string;
  price: string;
}

async function scrapeRods() {
  const rodsURL = "https://daiwafishing.com.au/collections/rods";

  const rods: Rod[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.goto(rodsURL, { waitUntil: "domcontentloaded" });
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
      detailPage.on("console", (msg) => console.log("DETAIL PAGE LOG:", msg.text()));
      await detailPage.goto(product, { waitUntil: "domcontentloaded" });

      const extractedData = await detailPage.evaluate(() => {
        const allRowsData: any[] = [];

        // Find all tables within the container
        const tables = Array.from(document.querySelectorAll(".dataTable"));

        tables.forEach((table) => {
          // Extract headers text, avoiding child elements text (like those in dropdowns)
          const headers = Array.from(table.querySelectorAll("th")).map((th) => {
            // Attempt to directly use textContent of a child <p> or the th itself if <p> is not found
            // @ts-ignore
            const headerText = th.querySelector("p") ? th.querySelector("p").textContent.trim() : th.textContent.trim();
            // console.log("HEADER TEXT", headerText);
            return headerText.replace(/\s+/g, " "); // Normalize whitespace
          });

          // console.log("HEADERS", headers);

          // Iterate over each row in the table
          const rows = Array.from(table.querySelectorAll("tbody tr"));
          rows.forEach((row) => {
            const rowData = {};
            const cells = Array.from(row.querySelectorAll("td"));

            // Map each cell to its corresponding header
            cells.forEach((cell, index) => {
              // console.log("CELL", cell.innerText.trim());
              if (typeof headers[index] === "string")
                // @ts-ignore
                rowData[headers[index] || `unknown${index}`] = cell.innerText.trim();
            });

            // Add the constructed object to the allRowsData array
            allRowsData.push(rowData);
          });
        });

        return allRowsData;
      });
      rods.push(...extractedData);
    }
  } catch (error) {
    console.error(error);
  } finally {
    browser.close();
    return rods;
  }
}

scrapeRods().then(async (rods) => {
  const start = performance.now();
  try {
    console.log("WE GOT RODS BABY:", rods.length);
    const filteredRods = rods.filter((rod) => Object.keys(rod).length > 0);

    const sheet = FishDoc.sheetsByIndex[7];
    for await (const rod of filteredRods) {
      sheet.addRow({
        BRAND: "Daiwa",
        NAME: rod.Model,
        "ITEM CODE": rod.sku,
        PRICE: rod.price,
        ACTION: rod.action,
        CASTWEIGHT: rod.castweight,
        LENGTH: rod.length,
        "REC. LINE": rod["Rec. Line"],
        SECTION: rod.section,
        TAPER: rod.taper,
        TYPE: rod.type,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.log("ERROR:", error);
  } finally {
    const end = performance.now();
    console.log("Time taken:", end - start);
  }
});

const arr = [
  {
    Model: "BEEFSTICK 1403XXHS SURF ROD",
    action: "XX Heavy",
    castweight: "N/A",
    length: `14'0"/427cm`,
    "Rec. Line": "15 - 24 kg",
    section: "3",
    taper: "Reg",
    type: "Spin",
    sku: "12622",
    price: "$99.99",
  },
  {
    Model: "BEEF STICK 701HB",
    action: "Heavy",
    castweight: "N/A",
    length: `7'0"/213cm`,
    "Rec. Line": "6-10kg",
    section: "1",
    taper: "Reg",
    type: "Overhead",
    sku: "12644",
    price: "$69.99",
  },
  {
    Model: "21 SENSOR SANDSTORM 1062M",
    action: "Medium",
    castweight: "10-60g",
    length: `10'6"/320cm`,
    "Rec. Line": "6-12kg",
    section: "2",
    taper: "Fast",
    type: "Spin",
    sku: "11028",
    price: "$249.00",
  },
];
