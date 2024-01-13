const puppeteer = require("puppeteer");

const searchCars = async () => {
  const minYear = 2006;
  const maxYear = 2010;
  const url = `https://www.carsales.com.au/cars/mitsubishi/pajero/?doors=3&seats=5&yearmin=${minYear}&yearmax=${maxYear}`;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    const carLinks = await page.$$eval(".listing-item .listing-item__title a", (links) =>
      links.map((link) => `https://www.carsales.com.au${link.getAttribute("href")}`)
    );

    const resultsCountElement = await page.$(".listing-search-keyword__count");
    if (!resultsCountElement) {
      throw new Error("Unable to find results count element");
    }
    const resultsCountText = await resultsCountElement.evaluate((el) => el.textContent.trim().replace(",", ""));
    const resultsCount = parseInt(resultsCountText, 10);

    console.log(`Results Count: ${resultsCount}`);

    console.log("Car Listings:");
    carLinks.forEach((link, index) => {
      console.log(`${index + 1}: ${link}`);
    });

    await browser.close();
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

searchCars();
