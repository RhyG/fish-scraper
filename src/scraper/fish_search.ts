import puppeteer, { Page } from "puppeteer";

import { FishDoc } from "../sheet";
import { promptForReword } from "../ai";

// Instantiate document
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

  // The markup of this site is a dog's brekky so some ugly shit required to dig out what we need
  const fishDetails = await page.$$eval(`${fishInfoSelector} tr`, (rows) => {
    let details = {};
    rows.forEach((row) => {
      const test = row.querySelectorAll("td");
      const first = test[0];
      const second = test[1];

      const title = first?.textContent?.trim();
      const desc = second?.textContent?.trim();

      if (!!title && !!desc) {
        // Ignoring recipes for now because they mostly link to other sites
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
      // @ts-expect-error - lib types are wrong this method exists and works
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

searchFish().then(async (fishArray) => {
  try {
    const sheet = FishDoc.sheetsByIndex[0];

    for (const fish of fishArray) {
      if (fish.Information) {
        const old = fish.Information;
        const newInfo = await promptForReword(old);
        fish["Information (Reworded)"] = newInfo;
      }

      if (fish["Location / Habitat"]) {
        const old = fish["Location / Habitat"];
        const newInfo = await promptForReword(old);
        fish["Location / Habitat (Reworded)"] = newInfo;
      }

      console.log("Adding fish:", fish);
      await sheet.addRow(fish);
    }
  } catch (error) {
    console.log("Error writing to sheet:", error);
  }
});
