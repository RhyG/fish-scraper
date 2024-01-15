import fs from "fs";

import { FishDoc } from "../sheet";

let htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>Fish</title>
<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
}
#catalog {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Default to four columns */
  gap: 10px;
  justify-content: center;
  align-items: start;
  max-width: 1024px;
  margin: auto;
}

/* Media query for screens that are 768px wide or less */
@media (max-width: 1000px) {
  #catalog {
    grid-template-columns: repeat(3, 1fr); /* Switch to three columns for mobile devices */
  }
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
  align-items: flex-start;
}

.tile strong {
  display: block;
  margin-bottom: 0.5em; /* Adds spacing between each key-value pair */
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
<h1>Fish</h1>
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
