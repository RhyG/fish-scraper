// generateHTML.ts
import fs from "fs";
import { exec } from "child_process";

interface CarListing {
  title: string;
  detailsUrl: string;
  imgSrc: string;
  price: string;
  odometer: string;
  engine: string;
}

export const generateHTML = (resultsCount: number, carListings: CarListing[]): void => {
  const htmlStart = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Listings</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; }
        h1 { text-align: center; font-size: 36px; background-color: #0099cc; color: white; margin: 0; padding: 10px 0; }
        .container { display: flex; flex-wrap: wrap; justify-content: center; }
        .listing {
            width: 300px;
            background-color: white;
            border: 2px solid #0099cc;
            margin: 10px;
            padding: 10px;
            transition: 0.3s;
            cursor: pointer;
            text-decoration: none;
            color: black;
        }
        .listing:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 16px -3px rgba(0, 0, 0, 0.3),
                        0 4px 5px 0 rgba(0, 0, 0, 0.14),
                        0 2px 10px -5px rgba(0, 0, 0, 0.12);
        }
        img { width: 100%; height: auto; border: 1px solid #0099cc; }
        h2, p { margin: 0 0 10px; }
    </style>
</head>
<body>
    <h1>Car Listings (${resultsCount})</h1>
    <div class="container">
`;

  const htmlEnd = `
    </div>
</body>
</html>
`;

  let htmlListings = "";

  carListings.forEach((listing) => {
    htmlListings += `
        <a class="listing" href="${listing.detailsUrl}" target="_blank">
            <h2>${listing.title}</h2>
            <img src="${listing.imgSrc}" alt="${listing.title}">
            <p>Price: $${listing.price}</p>
            <p>Odometer: ${listing.odometer}</p>
            <p>Engine: ${listing.engine}</p>
        </a>
    `;
  });

  const htmlContent = htmlStart + htmlListings + htmlEnd;

  fs.writeFile("car_listings.html", htmlContent, (err) => {
    if (err) {
      console.error("Error writing HTML file:", err.message);
    } else {
      console.log("HTML file created: car_listings.html");
      exec("open car_listings.html");
    }
  });
};
