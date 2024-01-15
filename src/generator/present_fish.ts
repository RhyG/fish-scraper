import fs from "fs";

import { FishDoc } from "../sheet";

let htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>Fish Catalog</title>
<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
}
#catalog {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Creates exactly four columns */
  gap: 10px;
  justify-content: center;
  align-items: start; /* Aligns items to the start of the grid area */
  max-width: 1024px;
  margin: auto;
}

.tile {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Aligns content to the start inside the tile */
}

.tile strong {
  display: block;
  margin-top: 0.8em;
}

.tile:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.4);
}
h1 {
  text-align: center;
}
</style>
</head>
<body>
<h1>Fish Catalog</h1>
<div id="catalog">
`;

(async function () {
  await FishDoc.loadInfo();
  const sheet = FishDoc.sheetsByIndex[3];
  const rows = await sheet.getRows();

  const fishArr = rows.map((row) => {
    const fish = row.toObject();
    for (const key of Object.keys(fish)) {
      delete fish["I.D Photos source"];
      delete fish["ANIMA PICS"];
      delete fish["(Rules) QLD Rules"];
      delete fish["(Rules) W.A Rules"];
      delete fish["(Rules) N.T Rules"];
      delete fish["(Rules) NSW Rules"];
      delete fish["(Rules) VIC Rules"];
      delete fish["(Rules) S.A Rules"];
      delete fish["(Rules) TAS Rules"];
      delete fish["(Rules) A.C.T Rules"];

      if (!fish["Eating rating and serving suggestion"])
        fish["Eating rating and serving suggestion"] = "No information available.";

      return fish;
    }
  });
  // console.log(JSON.stringify(fishArr, null, 2));

  const data = JSON.stringify(fishArr);
  // fs.writeFileSync("fishData.json", data);

  fishArr.forEach((fish) => {
    htmlContent += '<div class="tile">';
    // @ts-expect-error
    for (const [key, value] of Object.entries(fish)) {
      htmlContent += `<strong>${key}:</strong> ${value}<br>`;
    }
    htmlContent += "</div>";
  });

  htmlContent += `
</div>
</body>
</html>
`;

  fs.writeFileSync("index.html", htmlContent);

  console.log("Written to file.");
})();
