import { FishDoc } from "../sheet";
import { generateFishData, AusFish } from "./generateFishData";

(async function () {
  await FishDoc.loadInfo();
  const sheet = FishDoc.sheetsByIndex[2];
  const rows = await sheet.getRows();

  // Iterate over each row in the sheet
  for (const row of rows) {
    const name = row.get("Name");
    const scientificName = row.get("(Details) Scientific Name");

    console.log("Running on", name);

    // Check that we have the fields we need before getting ChatGPT to generate the info.
    if (name && scientificName) {
      const fishInfo = await generateFishData(name, scientificName);

      if (fishInfo) {
        for (const key in fishInfo) {
          // Set it in the row, not saving at this point to avoid rate limit.
          console.log(`Setting ${key} for ${name}`);
          row.set(key, fishInfo[key as keyof AusFish]);
        }
      }
    }
  }

  // Hacky method to avoid hitting rate limits.
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  for (const row of rows) {
    await row.save();
    await delay(10000); // Set to 10s to be really sure but can be about 1s.
  }
})();
