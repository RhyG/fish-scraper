// main.ts
import puppeteer, { Page } from "puppeteer";
import { generateHTML } from "./generateHTML";

interface CarListing {
  title: string;
  detailsUrl: string;
  imgSrc: string;
  price: string;
  odometer: string;
  engine: string;
}

const searchCars = async (): Promise<void> => {
  const url = "https://www.carsales.com.au/cars/mitsubishi/pajero/3-doors/";

  try {
    const browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });
    // @ts-ignore
    const resultsCountText: string = await page.$eval("h1.title", (el) => el.textContent!.trim().split(" ")[0]);
    const resultsCount: number = parseInt(resultsCountText, 10);
    console.log(`Results Count: ${resultsCount}`);

    const carLinks = await page.$$(".listing-item");

    console.log("Car Listings:");

    const carListings: CarListing[] = [];

    for (let index = 0; index < carLinks.length; index++) {
      const carLink = carLinks[index];

      const titleLink = await carLink.$(".card-body h3 a");
      let title = "N/A";
      let detailsUrl = "N/A";
      if (titleLink) {
        // @ts-ignore
        title = await titleLink.evaluate((el) => el.textContent!.trim());
        // @ts-ignore
        detailsUrl = await titleLink.evaluate((el) => el.getAttribute("href"));
      }

      const imgElement = await carLink.$(".carousel-item.active img");
      let imgSrc = "N/A";
      if (imgElement) {
        // @ts-ignore
        imgSrc = await imgElement.evaluate((el) => el.getAttribute("src"));
      }
      // @ts-ignore
      const price = await carLink.evaluate((el) => el.getAttribute("data-webm-price"));

      const keyDetails = await carLink.$$(".key-details li");
      // @ts-ignore
      const odometer = await keyDetails[0].evaluate((el) => el.textContent);
      // @ts-ignore
      const engine = await keyDetails[3].evaluate((el) => el.textContent);

      // @ts-ignore
      carListings.push({ title, detailsUrl, imgSrc, price, odometer, engine });
    }

    generateHTML(resultsCount, carListings);

    await browser.close();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching data:", error.message);
    } else {
      console.error("Unknown error fetching data");
    }
  }
};

searchCars();
