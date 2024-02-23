import puppeteer, { Page } from "puppeteer";
import { FishDoc } from "../../sheet";

// const firstBatch = [
//   "https://berkley-fishing.com.au/gulp/",
//   "https://berkley-fishing.com.au/gulp-alive/",
//   "https://berkley-fishing.com.au/powerbait/",
//   "https://berkley-fishing.com.au/shimma/",
//   "https://berkley-fishing.com.au/berkley-pro_tech/",
// ];
// "https://berkley-fishing.com.au/berkley-nitro-jig-heads/",
const categories = [
  "https://berkley-fishing.com.au/troutbait/",
  // "https://berkley-fishing.com.au/product/berkley-skid-jig/",
];

interface BerkleyLure {
  Model: string;
  SKU?: string;
  Packaging?: string;
  Colour?: string;
  "Package Count"?: string;
  "Bait Length"?: string;
  Weight?: string;
  "Bait Shape"?: string;
  RRP?: string;
  DESCRIPTION?: string;
  LENGTH?: string;
  "BAIT SHAPE"?: string;
  COLOUR?: string;
  WEIGHT?: string;
  SIZE?: string;
  Color?: string;
  Description?: string;
  Size?: string;
  "Fishing Type"?: string;
  MODEL?: string;
  DEPTH?: string;
  "TACKLE SIZE"?: string;
  "Bait Size"?: string;
}

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
  const completed: BerkleyLure[] = [];
  let total = 0;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const category of categories) {
    console.log("Running", category);
    // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.goto(category, { waitUntil: "networkidle2" });
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

      completed.push(...(rows as BerkleyLure[]));
    }

    total += products.length;
  }

  console.log("Total products --------------------------------");
  console.log(total);
  console.log("Total products --------------------------------");
  browser.close();

  return completed;
}

scrapeLures().then(async (lures) => {
  console.log("WE GOT REELS BABY:", lures.length);

  const start = performance.now();
  try {
    const sheet = FishDoc.sheetsByIndex[5];
    for await (const lure of lures) {
      // console.log({ lure });
      sheet.addRow({
        BRAND: "Berkley",
        NAME: lure.Model ?? lure.MODEL ?? lure.DESCRIPTION ?? lure.Description,
        "ITEM CODE": lure.SKU ?? "",
        COLOUR: lure.Colour ?? lure.COLOUR ?? lure.Color ?? "",
        LENGTH: lure["Bait Length"] ?? lure.LENGTH ?? lure.Size ?? "",
        WEIGHT: lure.Weight ?? lure.WEIGHT ?? lure["TACKLE SIZE"] ?? lure["Bait Size"] ?? "",
        RRP: lure.RRP ?? "",
        SHAPE: lure["Bait Shape"] ?? lure["BAIT SHAPE"] ?? "",
        "PACKAGE COUNT": lure["Package Count"] ?? "",
        TYPE: lure["Fishing Type"] ?? "",
        DEPTH: lure.DEPTH ?? "",
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

// const x = [
//   {
//     Model: 'SHIMMA  PRO RIG 4.5" GOLD CHARTREUSE',
//     SKU: "1562043",
//     Packaging: "Blister",
//     Colour: "Gold Chartreuse",
//     "Package Count": "1",
//     "Bait Length": "4.5in | 11.5cm",
//     Weight: "18g",
//     "Bait Shape": "Paddletail",
//     RRP: "$15.99",
//   },
//   {
//     Model: 'SHIMMA  PRO RIG 4.5" DIRTY PERCH',
//     SKU: "1562044",
//     Packaging: "Blister",
//     Colour: "Dirty Perch",
//     "Package Count": "1",
//     "Bait Length": "4.5in | 11.5cm",
//     Weight: "18g",
//     "Bait Shape": "Paddletail",
//     RRP: "$15.99",
//   },
//   {
//     Model: 'SHIMMA  PRO RIG 4.5" SILVER CHARTREUSE',
//     SKU: "1562045",
//     Packaging: "Blister",
//     Colour: "Chartreuse",
//     "Package Count": "1",
//     "Bait Length": "4.5in | 11.5cm",
//     Weight: "18g",
//     "Bait Shape": "Paddletail",
//     RRP: "$15.99",
//   },
//   {
//     Model: 'SHIMMA  PRO RIG 4.5" SILVER GHOST',
//     SKU: "1562046",
//     Packaging: "Blister",
//     Colour: "Silver Ghost",
//     "Package Count": "1",
//     "Bait Length": "4.5in | 11.5cm",
//     Weight: "18g",
//     "Bait Shape": "Paddletail",
//     RRP: "$15.99",
//   },
//   {
//     SKU: "1595762",
//     DESCRIPTION: "SHIMMA VECTOR 100MM HERRING",
//     LENGTH: "100MM",
//     "BAIT SHAPE": "VIBE",
//     COLOUR: "HERRING",
//     WEIGHT: "21G",
//     RRP: "$16.99",
//   },
//   {
//     SKU: "1595763",
//     DESCRIPTION: "SHIMMA VECTOR 100MM AYU PEARL",
//     LENGTH: "100MM",
//     "BAIT SHAPE": "VIBE",
//     COLOUR: "AYU PEARL",
//     WEIGHT: "21G",
//     RRP: "$16.99",
//   },
//   {
//     SKU: "1595764",
//     DESCRIPTION: "SHIMMA VECTOR 100MM NATURAL SHAD",
//     LENGTH: "100MM",
//     "BAIT SHAPE": "VIBE",
//     COLOUR: "NATURAL SHAD",
//     WEIGHT: "21G",
//     RRP: "$16.99",
//   },
//   {
//     SKU: "1595765",
//     DESCRIPTION: "SHIMMA VECTOR 100MM TROTTER",
//     LENGTH: "100MM",
//     "BAIT SHAPE": "VIBE",
//     COLOUR: "TROTTER",
//     WEIGHT: "21G",
//     RRP: "$16.99",
//   },
//   {
//     SKU: "1595766",
//     DESCRIPTION: "SHIMMA VECTOR 100MM MULLET",
//     LENGTH: "100MM",
//     "BAIT SHAPE": "VIBE",
//     COLOUR: "MULLET",
//     WEIGHT: "21G",
//     RRP: "$16.99",
//   },
//   {
//     DESCRIPTION: "PBHB4-AY PB HLWBLY 4IN AYU",
//     COLOUR: "AYU",
//     SIZE: '4"',
//     RRP: "$12.99",
//   },
//   {
//     DESCRIPTION: "PBHB4-BG PB HLWBLY 4IN BLUEGILL",
//     COLOUR: "BLUE GILL",
//     SIZE: '4"',
//     RRP: "$12.99",
//   },
//   {
//     DESCRIPTION: "PBHB4-BNSD PB HLWBLY 4IN BONE SHAD",
//     COLOUR: "BONE SHAD",
//     SIZE: '4"',
//     RRP: "$12.99",
//   },
//   {
//     Model: "PB BUZZ N SPEED TOAD BLACK",
//     SKU: "1552991",
//     Packaging: "Bag",
//     Color: "Black",
//     "Package Count": "4",
//     "Bait Length": "4.25in | 11cm",
//     "Bait Shape": "Toad",
//     RRP: "$9.99",
//   },
//   {
//     Model: "PB BUZZ N SPEED TOAD CHART/WHITE",
//     SKU: "1552992",
//     Packaging: "Bag",
//     Color: "Chartreuse/White",
//     "Package Count": "4",
//     "Bait Length": "4.25in | 11cm",
//     "Bait Shape": "Toad",
//     RRP: "$9.99",
//   },
//   {
//     Model: "PB BUZZ N SPEED TOAD GRN PUMPKIN",
//     SKU: "1552993",
//     Packaging: "Bag",
//     Color: "Green Pumpkin",
//     "Package Count": "4",
//     "Bait Length": "4.25in | 11cm",
//     "Bait Shape": "Toad",
//     RRP: "$9.99",
//   },
//   {
//     Model: "PB BUZZ N SPEED TOAD WTRMLN RDFLK PRLBLY",
//     SKU: "1552994",
//     Packaging: "Bag",
//     Color: "Watermelon Red Fleck Pearl Belly",
//     "Package Count": "4",
//     "Bait Length": "4.25in | 11cm",
//     "Bait Shape": "Toad",
//     RRP: "$9.99",
//   },
//   {
//     SKU: "1595934",
//     Description: "GSMI3-RBT SW MNW 3IN RAINBOW TRT",
//     Size: "3IN | 7.5CM",
//     "Bait Shape": "Minnow",
//     Colour: "Rainbow Trout",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1105005",
//     Description: "GMI3-SMLT GULP MNOW SMELT PK 3IN",
//     Size: "3IN | 7.5CM",
//     "Bait Shape": "Minnow",
//     Colour: "Smelt",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1595935",
//     Description: "GSMI3-STRYN SW MNW 3IN STRYNGT",
//     Size: "3IN | 7.5CM",
//     "Bait Shape": "Minnow",
//     Colour: "Starry Night",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1595937",
//     Description: "GSMI3-VIOHF SW MNW 3IN VIOHAZEFLEC",
//     Size: "3IN | 7.5CM",
//     "Bait Shape": "Minnow",
//     Colour: "Violet Haze Fleck",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1130689",
//     Description: "GMI3-WMPR GULP MNW 3IN WATERMLN PEARL WI",
//     Size: "3IN | 7.5CM",
//     "Bait Shape": "Minnow",
//     Colour: "Watermelon Pearl",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1199464",
//     Description: "GMI4-BPW GULP MINNOW 4IN BANANA PRAWN YN",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Banana Prawn",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1115862",
//     Description: "GMI4-CS GULP MNOW 4IN CHARTREUSE SHAD LD",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Chartreuse Shad",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1226047",
//     Description: "GMI4-FT GULP MINNOW 4IN FIRETIGER 29",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Firetiger",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1595940",
//     Description: "GSMI4-GREHF SW MNW 4IN GREHAZFLEC",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Green Haze Fleck",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1128660",
//     Description: "GSMI4-LTG GULP SW 4IN MNW LIMETIGRGLO SW",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Lime Tiger Glow",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1130691",
//     Description: "GMI4-NP GULP MINNOW 4IN NEW PENNY IR",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "New Penny",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1128659",
//     Description: "GSMI4-NCH GULP SW 4IN MNW NUC CHICKEN SX",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Nuclear Chicken",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1115864",
//     Description: "GMI4-PSL GULP MINNOW 4IN PRL SILVER PE",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Pearl Silver",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1140556",
//     Description: "GMI4-PP GULP 4IN MINNOW PEPPERD PRAWN YM",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Peppered Prawn",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1199468",
//     Description: "GMI4-PIL GULP MINNOW 4IN PILCHARD AAO",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Pilchard",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1128658",
//     Description: "GSMI4-PS GULP SW 4IN MNW PUMPKINSEED 76",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Pumpkinseed",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1595938",
//     Description: "GSMI4-RBT SW MNW 4IN RAINBOW TRT",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Rainbow Trout",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1115860",
//     Description: "GMI4-SMLT GULP MINNOW 4IN SMELT PK",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Smelt",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1595939",
//     Description: "GSMI4-STRYN SW MNW 4IN STRYNGT",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Starry Night",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1595941",
//     Description: "GSMI4-VIOHF SW MNW 4IN VIOHAZEFLEC",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Violet Haze Fleck",
//     RRP: "$11.99",
//   },
//   {
//     SKU: "1130692",
//     Description: "GMI4-WMPR GULP MNW 4IN WATERMLN PEARL WI",
//     Size: "4IN | 10CM",
//     "Bait Shape": "Minnow",
//     Colour: "Watermelon Pearl",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSCLJS7-PW GULP S CRZLGJRKSH 7IN PRLWH",
//     SKU: "1573933",
//     Packaging: "Bag",
//     Colour: "Pearl White",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Crazy Legs Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSCLJS7-NCH GULP S CRZLGJRKSH 7IN NKCHK",
//     SKU: "1573934",
//     Packaging: "Bag",
//     Colour: "Nuclear Chicken",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Crazy Legs Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSCLJS7-PIL GULP S CRZLGJRKSH 7IN PLCHRD",
//     SKU: "1573935",
//     Packaging: "Bag",
//     Colour: "Pilchard",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Crazy Legs Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSCLJS7-AMC GULPS CRZLGJRKSH 7IN AMERICA",
//     SKU: "1573936",
//     Packaging: "Bag",
//     Colour: "America",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Crazy Legs Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSCLJS7-NP GULP S CRZLGJRKSH 7IN NW PNNY",
//     SKU: "1573937",
//     Packaging: "Bag",
//     Colour: "New Penny",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Crazy Legs Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSCLJS7-OBS GULP S CRZLGJRKSH 7IN ORBSHR",
//     SKU: "1573938",
//     Packaging: "Bag",
//     Colour: "Orange Belly Shrimp",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Crazy Legs Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-C SW GULP JERK SHAD 5IN CAMO 14",
//     SKU: "1120261",
//     Packaging: "Bag",
//     Colour: "Camo",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-GL SW GULP JERK SHAD 5IN GLOW DE",
//     SKU: "1120262",
//     Packaging: "Bag",
//     Colour: "Glow",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-BPN SW GULP JRK SHD 5IN BLPPRNE TB",
//     SKU: "1121791",
//     Packaging: "Bag",
//     Colour: "Blue Pepper Neon",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-NCH SW GULP JRK SHD 5IN NUC CKN SX",
//     SKU: "1121794",
//     Packaging: "Bag",
//     Colour: "Nuclear Chicken",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GJS5-PW GULP JRK SHD 5IN PEARL WHITE BQ",
//     SKU: "1123762",
//     Packaging: "Bag",
//     Colour: "Pearl White",
//     "Package Count": "6",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-PSH SWGULPJERKSHAD 5IN PNKSHINE UH",
//     SKU: "1123828",
//     Packaging: "Bag",
//     Colour: "Pink Shine",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-PS SW GULP JERK SHAD 5IN PSEED 76",
//     SKU: "1138186",
//     Packaging: "Bag",
//     Colour: "Pumpkinseed",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-SCH GULP SW 5IN JRKSHD SATAYCKN YH",
//     SKU: "1140530",
//     Packaging: "Bag",
//     Colour: "Satay Chicken",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-PIL SWGULP JRKSHAD5IN PILCHARDAAO",
//     SKU: "1199479",
//     Packaging: "Bag",
//     Colour: "Pilchard",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-FT GULP JRKSHD 5IN FIRETIGER",
//     SKU: "1292914",
//     Packaging: "Bag",
//     Colour: "Firetiger",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-YKSNK GULP SW 5IN JRKSHD YAKKASNAK",
//     SKU: "1395293",
//     Packaging: "Bag",
//     Colour: "Yakka Snak",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-BLFZ GULP SW 5IN JRKSHD BLU FUZE",
//     SKU: "1409998",
//     Packaging: "Bag",
//     Colour: "Blue Fuze",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-VIOHF SW 5IN JERK SHAD VIOHAZEFLEC",
//     SKU: "1588569",
//     Packaging: "Bag",
//     Colour: "Violet Haze Fleck",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-OCSFT SW 5IN JERK SHAD OCEANSHIFT",
//     SKU: "1588570",
//     Packaging: "Bag",
//     Colour: "Ocean Shift",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-BLUHF SW 5IN JRKSHD BLUHAZFLEC",
//     SKU: "1595932",
//     Packaging: "Bag",
//     Colour: "Blue Haze Fleck",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS5-GREHF SW 5IN JRKSHD GREHAZFLEC",
//     SKU: "1595933",
//     Packaging: "Bag",
//     Colour: "Green Haze Fleck",
//     "Package Count": "5",
//     "Bait Length": "5in | 13cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-BPN SWGULP JERKSHAD 7IN BLPPRNN TB",
//     SKU: "1123844",
//     Packaging: "Bag",
//     Colour: "Blue Pepper Neon",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-NCH SWGULP JRK SHD 7IN NCLRCHKN SX",
//     SKU: "1123850",
//     Packaging: "Bag",
//     Colour: "Nuclear Chicken",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-PW SW GULP JERKSHAD 7IN PRL WH BQ",
//     SKU: "1123851",
//     Packaging: "Bag",
//     Colour: "Pearl White",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-PSH SWGULP JERKSHAD7IN PNKSHINE UH",
//     SKU: "1123852",
//     Packaging: "Bag",
//     Colour: "Pink Shine",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-AN SW GULP JRK SHAD 7IN ANCHOVY NW",
//     SKU: "1130846",
//     Packaging: "Bag",
//     Colour: "Anchovy",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-PIL SWGULP JRK SHAD7IN PILCHARDAAO",
//     SKU: "1199480",
//     Packaging: "Bag",
//     Colour: "Pilchard",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-FT GULP JRKSHD 7IN FIRETIGER",
//     SKU: "1292918",
//     Packaging: "Bag",
//     Colour: "Firetiger",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-WMPR GULP JRKSHD 7IN WMELON PEARL",
//     SKU: "1292919",
//     Packaging: "Bag",
//     Colour: "Watermelon Pearl",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-YKSNK GULP SW 7IN JRKSHD YAKKASNAK",
//     SKU: "1395297",
//     Packaging: "Bag",
//     Colour: "Yakka Snak",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-BLFZ GULP SW 7IN JRKSHD BLU FUZE",
//     SKU: "1409999",
//     Packaging: "Bag",
//     Colour: "Blue Fuze",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
//   {
//     Model: "GSJS7-SMUL GULP SW 7IN JRKSHD SLVR MLT",
//     SKU: "1562587",
//     Packaging: "Bag",
//     Colour: "Silver Mullet",
//     "Package Count": "4",
//     "Bait Length": "7in | 18cm",
//     "Bait Shape": "Jerkshad",
//     RRP: "$11.99",
//   },
// ];

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
//       uniqueKeys.add(key);
//     });
//   });

//   // Convert the Set to an array and return it
//   // The spread operator (...) is used to expand the Set into an array
//   return [...uniqueKeys];
// }

// console.log(extractUniqueKeys(x));
