import puppeteer from "puppeteer";
import { FishDoc } from "../../sheet";

// Instantiate document
(async function () {
  try {
    await FishDoc.loadInfo();
    console.log("Retrieved doc:", FishDoc.title);
  } catch (error) {
    console.error(error);
  }
})();

const reelCategories = [
  "https://abugarcia-fishing.com.au/abu-garcia-spinning-reels/",
  "https://abugarcia-fishing.com.au/abu-garcia-low-profile-reels/",
  "https://abugarcia-fishing.com.au/abu-garcia-round-reels/",
];

interface InitialReel {
  Model?: string;
  SKU?: string;
  "Fishing Type"?: string;
  "Mono Capacity m/mm"?: string;
  "Reel Handle Position"?: string;
  "Anti-Reverse Function"?: string;
  "Gear Ratio"?: string;
  "Recovery Rate"?: string;
  "Bearing Count"?: string;
  "Max Drag lb"?: string;
  "Reel Spool Material"?: string;
  "Drag Type"?: string;
  RRP?: string;
  Colour?: string;
  Size?: string;
  "Braid Capacity m/mm"?: string;
  "Braid Capacity yd/lb"?: string;
  "Mono Capacity yd/lb"?: string;
  "Anti-Reverse Feature"?: string;
  "Max Drag"?: string;
  "Drag Material"?: string;
  Weight?: string;
  Color?: string;
  "Bearing Material"?: string;
  "Braking System"?: string;
  COLOR?: string;
  "FISHING TYPE"?: string;
  "REEL HANDLE POSITION"?: string;
  "ANTI-REVERSE FEATURE"?: string;
  "GEAR RATIO"?: string;
  "BEARING COUNT"?: string;
  "MAX DRAG LB"?: string;
  "DRAG TYPE"?: string;
  "DRAG MATERIAL"?: string;
  "REEL SPOOL MATERIAL"?: string;
  CONTENTS?: string;
  "BRAID CAPACITY YD / LB"?: string;
  BEARINGS?: string;
  "MONO CAPACITY YD/LB"?: string;
  COLOUR?: string;
}

interface Reel extends InitialReel {
  Model?: string;
  SKU?: string;
  Colour?: string;
  "Braid Capacity yd/lb"?: string;
  "Reel Handle Position"?: string;
  "Anti-Reverse Feature"?: string;
  "Gear Ratio"?: string;
  "Bearing Material"?: string;
  "Bearing Count"?: string;
  "Max Drag lb"?: string;
  Weight?: string;
  "Drag Type"?: string;
  RRP?: string;
  "Braid Capacity m/mm"?: string;
  "Mono Capacity m/mm"?: string;
  "Mono Capacity yd/lb"?: string;
  "Braking System"?: string;
  "Recovery Rate"?: string;
  "Max Drag"?: string;
  "Drag Material"?: string;
  "Reel Spool Material"?: string;
  "Fishing Type"?: string;
  MODEL?: string;
  COLOR?: string;
  "FISHING TYPE"?: string;
  "BRAID CAPACITY YD/LB"?: string;
  "REEL HANDLE POSITION"?: string;
  "ANTI-REVERSE FEATURE"?: string;
  "GEAR RATIO"?: string;
  "RECOVERY RATE"?: string;
  "BEARING COUNT"?: string;
  "MAX DRAG LB"?: string;
  "DRAG TYPE"?: string;
  "DRAG MATERIAL"?: string;
  WEIGHT?: string;
  "REEL SPOOL MATERIAL"?: string;
  Color?: string;
  CONTENTS?: string;
  "BRAID CAPACITY YD / LB"?: string;
  BEARINGS?: string;
  "MAX DRAG"?: string;
  "MONO CAPACITY YD/LB"?: string;
  "BRAKING SYSTEM"?: string;
  COLOUR?: string;
  "MONO CAPACITY M/MM"?: string;
  "BRAID CAPACITY M/MM"?: string;
}

async function scrapeReels() {
  const data: Reel[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const category of reelCategories) {
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.goto(category, { waitUntil: "networkidle2" });
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$(".product-small");

    console.log("Got products", products.length);

    for (const product of products) {
      const href = await product.$eval("a", (e) => e?.href);

      const detailPage = await browser.newPage();
      await detailPage.goto(href, { waitUntil: "networkidle2" });
      // detailPage.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

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

      data.push(...rows);
    }
  }

  browser.close();
  return data;
}

// @ts-ignore
// scrapeReels().then(async (reels) => {
//   console.log("Got reels:", reels.length);

//   try {
//     const sheet = FishDoc.sheetsByIndex[6];

//     for await (const reel of reels) {
//       await sheet.addRow({
//         BRAND: "Abu Garcia",
//         NAME: reel.Model ?? reel.MODEL ?? reel.CONTENTS ?? "",
//         "ITEM CODE": reel.SKU ?? "",
//         PRICE: reel.RRP ?? "",
//         GEAR: reel["Gear Ratio"] ?? reel["GEAR RATIO"] ?? "",
//         WEIGHT: reel.Weight ?? reel.WEIGHT ?? "",
//         "BALL BEARING": reel["Bearing Count"] ?? reel["BEARING COUNT"] ?? reel.BEARINGS ?? "",
//         DRAG: reel["MAX DRAG"] ?? reel["Max Drag lb"] ?? reel["MAX DRAG LB"] ?? "",
//         RATIO: reel["GEAR RATIO"] ?? reel["Gear Ratio"] ?? "",
//         "MONO CAPACITY": reel["Mono Capacity m/mm"] ?? reel["MONO CAPACITY M/MM"] ?? "",
//         "J-BRAID CAPACITY": reel["Braid Capacity m/mm"] ?? reel["BRAID CAPACITY M/MM"] ?? "",
//         COLOR: reel.Colour ?? reel.COLOR ?? reel.COLOUR ?? reel.Color ?? "",
//         "BEARING COUNT": reel["Bearing Count"] ?? reel["BEARING COUNT"] ?? reel.BEARINGS ?? "",
//         "DRAG MATERIAL": reel["Drag Material"] ?? reel["DRAG MATERIAL"] ?? "",
//         "FISHING TYPE": reel["Fishing Type"] ?? reel["FISHING TYPE"] ?? "",
//         "REEL SPOOL MATERIAL": reel["Reel Spool Material"] ?? reel["REEL SPOOL MATERIAL"] ?? "",
//       });
//     }
//   } catch (error) {}
// });

interface Rod {
  Model?: string;
  SKU?: string;
  "Fishing Type"?: string;
  Action?: string;
  "Line Rating"?: string;
  "Cast Weight"?: string;
  Length?: string;
  Pieces?: string;
  "Blank Material"?: string;
  "Handle Material"?: string;
  "Guide Type"?: string;
  Butt?: string;
  "Grip Configuration"?: string;
  RRP?: string;
  Name?: string;
  Colour?: string;
  "Number of Pieces"?: string;
  Blank?: string;
}

const rodCategories = [
  "https://abugarcia-fishing.com.au/abu-garcia-spinning-rods/",
  "https://abugarcia-fishing.com.au/abu-garcia-casting-rods/",
];

async function scrapeRods() {
  const data: Rod[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const category of rodCategories) {
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.goto(category, { waitUntil: "networkidle2" });
    await page.setViewport({ width: 1080, height: 1024 });

    const products = await page.$$(".product-small");

    console.log("Got products", products.length);

    for (const product of products) {
      const href = await product.$eval("a", (e) => e?.href);

      const detailPage = await browser.newPage();
      await detailPage.goto(href, { waitUntil: "networkidle2" });
      // detailPage.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

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

      data.push(...rows);
    }
  }

  browser.close();
  return data;
}

scrapeRods().then(async (rods) => {
  console.log("WE GOT RODS BABY:", rods.length);

  const start = performance.now();
  try {
    const sheet = FishDoc.sheetsByIndex[7];
    for await (const rod of rods) {
      // console.log({ rod });
      sheet.addRow({
        BRAND: "Abu Garcia",
        NAME: rod.Model ?? rod.Name ?? "",
        "ITEM CODE": rod.SKU ?? "",
        PRICE: rod.RRP ?? "",
        ACTION: rod.Action ?? "",
        CASTWEIGHT: rod["Cast Weight"] ?? "",
        LENGTH: rod.Length ?? "",
        SECTION: rod.Pieces ?? rod["Number of Pieces"] ?? "",
        TYPE: rod["Fishing Type"] ?? "",
        "GUIDE TYPE": rod["Guide Type"] ?? "",
        "HANDLE MATERIAL": rod["Handle Material"] ?? "",
        COLOUR: rod.Colour ?? "",
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

// @ts-ignore
function extractUniqueKeys(data) {
  // Initialize an empty Set to keep track of unique keys
  const uniqueKeys = new Set();

  // Loop over each object in the input array
  // @ts-ignore
  data.forEach((obj) => {
    // Loop over each key in the object
    Object.keys(obj).forEach((key) => {
      // Add the key to the Set (Sets automatically remove duplicates)
      uniqueKeys.add(key);
    });
  });

  // Convert the Set to an array and return it
  // The spread operator (...) is used to expand the Set into an array
  return [...uniqueKeys];
}
