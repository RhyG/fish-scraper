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

const reelsURL = "https://www.jarviswalker.com.au/collections/reels";

interface Reel {
  model: string;
  code: string;
  bearings: string;
  "line cap. mono": string;
  "line cap. braid": string;
  "gear ratio": string;
  "line retrieve": string;
  weight: string;
  "max. drag": string;
}

async function scrapeReels() {
  const reels: Reel[] = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(reelsURL, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 1080, height: 1024 });

  const products = await page.$$(".product-block");

  console.log("Got products", products.length);

  for (const product of products) {
    const href = await product.$eval("a", (e) => e?.href);

    const detailPage = await browser.newPage();
    await detailPage.goto(href, { waitUntil: "networkidle2" });
    detailPage.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    const table = await detailPage.waitForSelector(".tablepress");

    const data = await detailPage.evaluate(() => {
      // @ts-ignore
      const models = Array.from(document.querySelectorAll(".dataTables_scrollHead th:not(:first-child)")).map((th) =>
        // @ts-ignore
        th.textContent.trim()
      );
      const attributes = Array.from(document.querySelectorAll(".dataTables_scrollBody tbody tr")).map((tr) => {
        // @ts-ignore
        return Array.from(tr.querySelectorAll("td")).map((td) => td.textContent.trim());
      });

      // Transpose the array to group by model instead of attribute
      const transposed = models.map((_, colIndex) => attributes.map((row) => row[colIndex]));

      // Combine the model names with their corresponding data
      return models.map((model, index) => ({
        model: model,
        code: transposed[index][0] || "",
        bearings: transposed[index][1] || "",
        "line cap. mono": transposed[index][2] || "",
        "line cap. braid": transposed[index][3] || "",
        "gear ratio": transposed[index][4] || "",
        "line retrieve": transposed[index][5] || "",
        weight: transposed[index][6] || "",
        "max. drag": transposed[index][7] || "",
      }));
    });
    reels.push(...data);
  }

  browser.close();
  return reels;
}

scrapeReels().then(async (reels) => {
  console.log("Got reels:", reels.length);

  try {
    const sheet = FishDoc.sheetsByIndex[6];
    for await (const reel of reels) {
      sheet.addRow({
        BRAND: "Jarvis Walker",
        NAME: reel.model,
        "ITEM CODE": reel.code,
        GEAR: reel["gear ratio"],
        WEIGHT: reel.weight,
        "BEARING COUNT": reel.bearings,
        DRAG: reel["max. drag"],
        RATIO: reel["gear ratio"],
        "MONO CAPACITY": reel["line cap. mono"],
        "J-BRAID CAPACITY": reel["line cap. braid"],
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.log(error);
  }
});

const x = [
  {
    model: "Smoke Heavy Duty SHD200HPT",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Smoke Heavy Duty SHD200SPT",
    code: "25660",
    bearings: "6+1",
    "line cap. mono": "12lb/180yd",
    "line cap. braid": "30lb/230yd",
    "gear ratio": "7.3:1",
    "line retrieve": "76cm",
    weight: "195g",
    "max. drag": "25lb",
  },
  {
    model: "Smoke Heavy Duty SHD201HPT",
    code: "25661",
    bearings: "6+1",
    "line cap. mono": "12lb/180yd",
    "line cap. braid": "30lb/230yd",
    "gear ratio": "6.6:1",
    "line retrieve": "71cm",
    weight: "195g",
    "max. drag": "25lb",
  },
  {
    model: "Smoke S3 SM100HPT (RHW)",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Smoke S3 SM100PPT (RHW)",
    code: "25681",
    bearings: "10+1",
    "line cap. mono": "12lb/170yd",
    "line cap. braid": "30lb/210yd",
    "gear ratio": "7.3:1",
    "line retrieve": "81cm",
    weight: "195g",
    "max. drag": "25lb",
  },
  {
    model: "Smoke S3 SM100SPT (RHW)",
    code: "25682",
    bearings: "10+1",
    "line cap. mono": "12lb/170yd",
    "line cap. braid": "30lb/210yd",
    "gear ratio": "5.1:1",
    "line retrieve": "58cm",
    weight: "195g",
    "max. drag": "25lb",
  },
  {
    model: "Smoke S3 SM100XPT (RHW)",
    code: "25683",
    bearings: "10+1",
    "line cap. mono": "12lb/170yd",
    "line cap. braid": "30lb/210yd",
    "gear ratio": "6.1:1",
    "line retrieve": "68cm",
    weight: "195g",
    "max. drag": "25lb",
  },
  {
    model: "Smoke S3 SM101SPT (LHW)",
    code: "25684",
    bearings: "10+1",
    "line cap. mono": "12lb/170yd",
    "line cap. braid": "30lb/210yd",
    "gear ratio": "8.1:1",
    "line retrieve": "91cm",
    weight: "195g",
    "max. drag": "25lb",
  },
  {
    model: "Smoke Inshore S3 25 SSM25XPT",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Smoke Inshore S3 30 SSM30XPT",
    code: "25483",
    bearings: "11+1",
    "line cap. mono": "8lb/150yd",
    "line cap. braid": "20lb/160yd",
    "gear ratio": "6.0:1",
    "line retrieve": "81cm",
    weight: "227g",
    "max. drag": "18lb",
  },
  {
    model: "Smoke Inshore S3 40 SSM40XPT",
    code: "25484",
    bearings: "11+1",
    "line cap. mono": "10lb/150yd",
    "line cap. braid": "20lb/220yd",
    "gear ratio": "6.0:1",
    "line retrieve": "89cm",
    weight: "235g",
    "max. drag": "20lb",
  },
  {
    model: "Smoke Inshore S3 50 SSM50XPT",
    code: "25485",
    bearings: "11+1",
    "line cap. mono": "10lb/230yd",
    "line cap. braid": "30lb/200yd",
    "gear ratio": "6.0:1",
    "line retrieve": "96cm",
    weight: "292g",
    "max. drag": "22lb",
  },
  {
    model: "Reliance PT 30 XPT Spin",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Reliance PT 40 XPT Spin",
    code: "25686",
    bearings: "5+1",
    "line cap. mono": "10lb/150yd",
    "line cap. braid": "20lb/205yd",
    "gear ratio": "6.2:1",
    "line retrieve": "83cm",
    weight: "275g",
    "max. drag": "20lb",
  },
  {
    model: "Reliance PT 55 XPT Spin",
    code: "25687",
    bearings: "5+1",
    "line cap. mono": "10lb/285yd",
    "line cap. braid": "30lb/260yd",
    "gear ratio": "6.0:1",
    "line retrieve": "94cm",
    weight: "397g",
    "max. drag": "25lb",
  },
  {
    model: "Reliance PT 65 XPT Spin",
    code: "25688",
    bearings: "5+1",
    "line cap. mono": "14lb/315yd",
    "line cap. braid": "50lb/255yd",
    "gear ratio": "5.6:1",
    "line retrieve": "104cm",
    weight: "620g",
    "max. drag": "35lb",
  },
  {
    model: "Reliance PT 85 XPT Spin",
    code: "25689",
    bearings: "5+1",
    "line cap. mono": "20lb/275yd",
    "line cap. braid": "65lb/240yd",
    "gear ratio": "5.6:1",
    "line retrieve": "109cm",
    weight: "652g",
    "max. drag": "40lb",
  },
  {
    model: "Verum II 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP.",
    "line cap. braid": "GEAR RATIO",
    "gear ratio": "LINE RETRIEVE",
    "line retrieve": "WEIGHT",
    weight: "MAX. DRAG",
    "max. drag": "",
  },
  {
    model: "Verum II 3000",
    code: "23280",
    bearings: "5+1",
    "line cap. mono": "0.20mm/240m",
    "line cap. braid": "5.1:1",
    "gear ratio": "-",
    "line retrieve": "210g",
    weight: "5kg",
    "max. drag": "",
  },
  {
    model: "Verum II 4000",
    code: "23281",
    bearings: "5+1",
    "line cap. mono": "0.25mm/240m",
    "line cap. braid": "5.0:1",
    "gear ratio": "-",
    "line retrieve": "225g",
    weight: "5kg",
    "max. drag": "",
  },
  {
    model: "Throttle II Spin 30",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Throttle II Spin 40",
    code: "25690",
    bearings: "10+1",
    "line cap. mono": "10lb/150yd",
    "line cap. braid": "20lb/220yd",
    "gear ratio": "5.2:1",
    "line retrieve": "76cm",
    weight: "278g",
    "max. drag": "8lb",
  },
  {
    model: "Big Boss III 4000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Big Boss III 6000",
    code: "24700",
    bearings: "6+1",
    "line cap. mono": "12lb/251yd",
    "line cap. braid": "20lb/251yd",
    "gear ratio": "5.2:1",
    "line retrieve": "78cm",
    weight: "358g",
    "max. drag": "17lb",
  },
  {
    model: "Big Boss III 8000",
    code: "24701",
    bearings: "6+1",
    "line cap. mono": "15lb/262yd",
    "line cap. braid": "30lb/300yd",
    "gear ratio": "4.9:1",
    "line retrieve": "85cm",
    weight: "568g",
    "max. drag": "33lb",
  },
  {
    model: "Exostrike 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Exostrike 4000",
    code: "28116",
    bearings: "7+1",
    "line cap. mono": "6lb braid/131yd",
    "line cap. braid": "6lb/131yd",
    "gear ratio": "5.1:1",
    "line retrieve": "68cm",
    weight: "258g",
    "max. drag": "13lb",
  },
  {
    model: "Exostrike 5000",
    code: "28117",
    bearings: "7+1",
    "line cap. mono": "10lb braid/197yd",
    "line cap. braid": "10lb/197yd",
    "gear ratio": "5.0:1",
    "line retrieve": "79cm",
    weight: "300g",
    "max. drag": "18lb",
  },
  {
    model: "Oberon Baitcast RHW",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Odyssey 30LWS Overhead",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "GEAR RATIO",
    "gear ratio": "WEIGHT",
    "line retrieve": "MAX. DRAG",
    weight: "",
    "max. drag": "",
  },
  {
    model: "Tactical 2500",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "GEAR RATIO",
    "gear ratio": "LINE RETRIEVE",
    "line retrieve": "WEIGHT",
    weight: "MAX. DRAG",
    "max. drag": "",
  },
  {
    model: "Tactical 4000",
    code: "29690",
    bearings: "4+1",
    "line cap. mono": "9lb/255yds",
    "line cap. braid": "5.0:1",
    "gear ratio": "69cm",
    "line retrieve": "288g",
    weight: "11lb",
    "max. drag": "",
  },
  {
    model: "Tactical 6000",
    code: "29687",
    bearings: "4+1",
    "line cap. mono": "12lb/255yds",
    "line cap. braid": "5.0:1",
    "gear ratio": "79cm",
    "line retrieve": "402g",
    weight: "17lb",
    "max. drag": "",
  },
  {
    model: "Tactical 8000",
    code: "29688",
    bearings: "4+1",
    "line cap. mono": "15lb/255yds",
    "line cap. braid": "5.0:1",
    "gear ratio": "83cm",
    "line retrieve": "562g",
    weight: "22lb",
    "max. drag": "",
  },
  {
    model: "Powerspin Baitfeeder 3000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Powerspin Baitfeeder 5000",
    code: "28114",
    bearings: "3+1",
    "line cap. mono": "10lb braid/284yd",
    "line cap. braid": "10lb/284yd",
    "gear ratio": "5.2:1",
    "line retrieve": "80cm",
    weight: "340g",
    "max. drag": "12lb",
  },
  {
    model: "Graphcast 3000 Spin",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Graphcast 6000 Spin",
    code: "28170",
    bearings: "5+1",
    "line cap. mono": "10lb/185yd",
    "line cap. braid": "12lb/350yd",
    "gear ratio": "5.2:1",
    "line retrieve": "80cm",
    weight: "315g with line",
    "max. drag": "12lb",
  },
  {
    model: "Graphcast 7000 Spin",
    code: "28171",
    bearings: "5+1",
    "line cap. mono": "12lb/252yd",
    "line cap. braid": "20lb/360yd",
    "gear ratio": "5.2:1",
    "line retrieve": "98cm",
    weight: "466g w line",
    "max. drag": "14lb",
  },
  {
    model: "Pro Power 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Pro Power 4000",
    code: "28228",
    bearings: "3+1",
    "line cap. mono": "6lb/165yd",
    "line cap. braid": "6lb/262yd",
    "gear ratio": "5.2:1",
    "line retrieve": "77cm",
    weight: "274g with line",
    "max. drag": "9lb",
  },
  {
    model: "Pro Power 6000",
    code: "28230",
    bearings: "3+1",
    "line cap. mono": "10lb/190yd",
    "line cap. braid": "10lb/262yd",
    "gear ratio": "5.2:1",
    "line retrieve": "86cm",
    weight: "326g with line",
    "max. drag": "12lb",
  },
  {
    model: "",
    code: "28232",
    bearings: "3+1",
    "line cap. mono": "15lb/205yd",
    "line cap. braid": "20lb/394yd",
    "gear ratio": "5.2:1",
    "line retrieve": "98cm",
    weight: "450g with line",
    "max. drag": "14lb",
  },
  {
    model: "Applause 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Applause 3000",
    code: "28221",
    bearings: "3+1",
    "line cap. mono": "6lb/165yd",
    "line cap. braid": "6lb/262yd",
    "gear ratio": "5.2:1",
    "line retrieve": "77cm",
    weight: "274g with line",
    "max. drag": "9lb",
  },
  {
    model: "Applause 4000",
    code: "28222",
    bearings: "3+1",
    "line cap. mono": "10lb/165yd",
    "line cap. braid": "10lb/218yd",
    "gear ratio": "5.2:1",
    "line retrieve": "80cm",
    weight: "310g with line",
    "max. drag": "12lb",
  },
  {
    model: "Applause 6000",
    code: "28223",
    bearings: "3+1",
    "line cap. mono": "10lb/190yd",
    "line cap. braid": "10lb/262yd",
    "gear ratio": "5.2:1",
    "line retrieve": "86cm",
    weight: "326g with line",
    "max. drag": "12lb",
  },
  {
    model: "Applause 8000",
    code: "28225",
    bearings: "3+1",
    "line cap. mono": "15lb/205yd",
    "line cap. braid": "20lb/394yd",
    "gear ratio": "5.2:1",
    "line retrieve": "98cm",
    weight: "450g with line",
    "max. drag": "14lb",
  },
  {
    model: "Pro Hunter 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Pro Hunter 3000",
    code: "29960",
    bearings: "3+1",
    "line cap. mono": "6lb/165yd",
    "line cap. braid": "6lb/262yd",
    "gear ratio": "5.2:1",
    "line retrieve": "77cm",
    weight: "274g with line",
    "max. drag": "9lb",
  },
  {
    model: "Pro Hunter 5000",
    code: "29961",
    bearings: "3+1",
    "line cap. mono": "10lb/165yd",
    "line cap. braid": "10lb/218yd",
    "gear ratio": "5.2:1",
    "line retrieve": "80cm",
    weight: "310g with line",
    "max. drag": "12lb",
  },
  {
    model: "Pro Hunter 6000",
    code: "29963",
    bearings: "3+1",
    "line cap. mono": "20lb/105yd",
    "line cap. braid": "20lb/306yd",
    "gear ratio": "5.2:1",
    "line retrieve": "91cm",
    weight: "422g with line",
    "max. drag": "14lb",
  },
  {
    model: "Pro Hunter 8000",
    code: "29964",
    bearings: "3+1",
    "line cap. mono": "20lb/125yd",
    "line cap. braid": "20lb/394yd",
    "gear ratio": "5.2:1",
    "line retrieve": "98cm",
    weight: "450g with line",
    "max. drag": "14lb",
  },
  {
    model: "Powergraph 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "LINE CAP. BRAID",
    "gear ratio": "GEAR RATIO",
    "line retrieve": "LINE RETRIEVE",
    weight: "WEIGHT",
    "max. drag": "MAX. DRAG",
  },
  {
    model: "Powergraph 3000",
    code: "28164",
    bearings: "3+1",
    "line cap. mono": "6lb/165yd",
    "line cap. braid": "6lb/262yd",
    "gear ratio": "5.2:1",
    "line retrieve": "77cm",
    weight: "274g with line",
    "max. drag": "9lb",
  },
  {
    model: "Powergraph 5000",
    code: "28165",
    bearings: "3+1",
    "line cap. mono": "10lb/165yd",
    "line cap. braid": "10lb/218yd",
    "gear ratio": "5.2:1",
    "line retrieve": "80cm",
    weight: "310g with line",
    "max. drag": "12lb",
  },
  {
    model: "Powergraph 8000",
    code: "28166",
    bearings: "3+1",
    "line cap. mono": "15lb/165yd",
    "line cap. braid": "20lb/306yd",
    "gear ratio": "5.2:1",
    "line retrieve": "91cm",
    weight: "422g with line",
    "max. drag": "14lb",
  },
  {
    model: "Rampage 300",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "GEAR RATIO",
    "gear ratio": "LINE RETRIEVE",
    "line retrieve": "WEIGHT",
    weight: "MAX. DRAG",
    "max. drag": "",
  },
  {
    model: "Rampage 400",
    code: "28030",
    bearings: "2",
    "line cap. mono": "10lb/165yd",
    "line cap. braid": "5.2:1",
    "gear ratio": "80cm",
    "line retrieve": "280g with line",
    weight: "12lb",
    "max. drag": "",
  },
  {
    model: "Rampage 600",
    code: "28031",
    bearings: "2",
    "line cap. mono": "10lb/190yd",
    "line cap. braid": "5.2:1",
    "gear ratio": "86cm",
    "line retrieve": "302g with line",
    weight: "12lb",
    "max. drag": "",
  },
  {
    model: "Rampage 800",
    code: "28032",
    bearings: "2",
    "line cap. mono": "20lb/125yd",
    "line cap. braid": "5.2:1",
    "gear ratio": "98cm",
    "line retrieve": "416g with line",
    weight: "14lb",
    "max. drag": "",
  },
  {
    model: "Crusader 2000",
    code: "CODE",
    bearings: "BEARINGS",
    "line cap. mono": "LINE CAP. MONO",
    "line cap. braid": "GEAR RATIO",
    "gear ratio": "LINE RETRIEVE",
    "line retrieve": "WEIGHT",
    weight: "MAX. DRAG",
    "max. drag": "",
  },
  {
    model: "Crusader 4000",
    code: "27981",
    bearings: "1",
    "line cap. mono": "6lb/195m",
    "line cap. braid": "5.2:1",
    "gear ratio": "77cm",
    "line retrieve": "240g with line",
    weight: "9lb",
    "max. drag": "",
  },
  {
    model: "Crusader 6000",
    code: "27982",
    bearings: "1",
    "line cap. mono": "10lb/205m",
    "line cap. braid": "5.2:1",
    "gear ratio": "86cm",
    "line retrieve": "300g with line",
    weight: "10lb",
    "max. drag": "",
  },
  {
    model: "Crusader 8000",
    code: "27984",
    bearings: "1",
    "line cap. mono": "15lb/190m",
    "line cap. braid": "5.2:1",
    "gear ratio": "98cm",
    "line retrieve": "414g with line",
    weight: "16lb",
    "max. drag": "",
  },
];

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

// console.log(extractUniqueKeys(x));
