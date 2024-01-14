import puppeteer, { Page } from "puppeteer";

import { FishDoc } from "./sheet";
import { promptForReword } from "./ai";
import { generateData } from "./gen-fish-data";

(async function () {
  try {
    await FishDoc.loadInfo();
    console.log("Retrieved doc:", FishDoc.title);
  } catch (error) {
    console.error(error);
  }
})();

async function scrapeFishDetails(page: Page, url: string) {
  await page.goto(url);

  const fishInfoSelector = ".fish-info";

  await page.waitForSelector(fishInfoSelector);

  const fishDetails = await page.$$eval(`${fishInfoSelector} tr`, (rows) => {
    let details = {};
    rows.forEach((row) => {
      const test = row.querySelectorAll("td");
      const first = test[0];
      const second = test[1];

      const title = first?.textContent?.trim();
      const desc = second?.textContent?.trim();

      if (!!title && !!desc) {
        if (title.includes("Recipes")) return;
        // @ts-expect-error
        details[title] = desc;
      }
    });
    return details;
  });

  return fishDetails;
}

const searchFish = async (): Promise<any[]> => {
  const url = "https://www.fishspecies.nz/";

  try {
    const browser = await puppeteer.launch();
    const page: Page = await browser.newPage();

    // Enable console logging
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1080, height: 1024 });

    const postContainerSelector = ".posts > div";
    const posts = await page.$$(postContainerSelector);

    let fishArray = [];

    for (const post of posts) {
      const name = await post.$eval(".post-header .post-title a", (e) => e?.textContent?.trim());
      // @ts-expect-error
      const detailsUrl = await post.$eval(".featured-media", (e) => e.href);

      // Open a new page for details
      const detailPage = await browser.newPage();
      await detailPage.goto(detailsUrl);

      // Scrape the fish details in the new page
      const details = await scrapeFishDetails(detailPage, detailsUrl);
      let fishInfo = { Name: name, ...details };
      fishArray.push(fishInfo);

      // Close the details page
      await detailPage.close();
    }

    await browser.close();
    return fishArray;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching data:", error.message);
    } else {
      console.error("Unknown error fetching data");
    }

    return [];
  }
};

// searchFish().then(async (fishArray) => {
//   try {
//     const sheet = FishDoc.sheetsByIndex[0];

//     for (const fish of fishArray) {
//       if (fish.Information) {
//         const old = fish.Information;
//         const newInfo = await promptForReword(old);
//         fish["Information (Reworded)"] = newInfo;
//       }

//       if (fish["Location / Habitat"]) {
//         const old = fish["Location / Habitat"];
//         const newInfo = await promptForReword(old);
//         fish["Location / Habitat (Reworded)"] = newInfo;
//       }

//       // fish.Information = await promptForReword(fish.Information);
//       console.log("Adding fish:", fish);
//       await sheet.addRow(fish);
//       // const test = await promptForReword(fish.Information);
//     }
//   } catch (error) {
//     console.log("Error writing to sheet:", error);
//   }
// });

(async function () {
  await FishDoc.loadInfo();
  const sheet = FishDoc.sheetsByIndex[2];
  const rows = await sheet.getRows();

  for (const row of rows) {
    const name = row.get("Name");
    const scientificName = row.get("(Details) Scientific Name");

    // row.set("(Details) Description", description);
    console.log("Running on", name);

    if (name && scientificName) {
      const fishInfo = await generateData(name, scientificName);
      for (const key in fishInfo) {
        console.log(`Setting ${key} for ${name}`);
        row.set(key, fishInfo[key]);
      }
    }
  }

  // Function to delay execution
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Save each row with a delay to avoid hitting the API limit
  for (const row of rows) {
    await row.save();
    await delay(10000); // Delay of 1 second; adjust as necessary
  }
})();

type AusFish = {
  "I.D Photos source": string;
  Name: string;
  "ANIMA PICS": string;
  "(Details) Scientific Name": string;
  "(Details) Other Names": string;
  "(Details) Family": string;
  "(Details) Description": string;
  "(Details) Category": string;
  "(Details) Found": string;
  "(Rules) QLD Rules": string;
  "(Rules) W.A Rules": string;
  "(Rules) N.T Rules": string;
  "(Rules) NSW Rules": string;
  "(Rules) VIC Rules": string;
  "(Rules) S.A Rules": string;
  "(Rules) TAS Rules": string;
  "(Rules) A.C.T Rules": string;
  "Info/Habitat": string;
  "Strike times": string;
  "Spearfishing tips": string;
  "Bait Tips": string;
  "Lure Tips": string;
  "Fly Fishing Tips": string;
  "Eating rating and serving suggestion": string;
};
