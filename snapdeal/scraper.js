const puppeteer = require("puppeteer");
const ss = require("string-similarity-js");
async function scraper(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const ISBN = data.ISBN;
  const notFound = {
    URL: "NA",
    Site: "NA",
    Found: "No",
    Author: "NA",
    Publisher: "NA",
    Price: "NA",
    Stock: "NA",
  };
  let dataTitle = data["Book Title"];
  function cleanTitle(title) {
    return title.toLowerCase().split(":")[0].split("-")[0].split("(")[0].trim();
    //.replace(/\([^()]*\)/g, "")
  }
  const bookTitle = cleanTitle(dataTitle);

  //the pageUrl is already given the sort query to get the lowest price on our product
  const pageUrl = `https://www.snapdeal.com/search?keyword=${ISBN}&sort=plth`;
  try {
    await page.goto(pageUrl, { waitUntil: "networkidle2" });
    await page.waitForSelector("#content_wrapper", {
      timeout: 60000,
    });

    //Getting all the products and matching the titles

    const productWrapper = await page.$("#content_wrapper");

    const productSection = await productWrapper.$(
      ".col-xs-24.reset-padding.marT22"
    );
    const sectionContainer = await productSection.$(
      ".comp.comp-right-wrapper.ref-freeze-reference-point.clear .product-row"
    );
    const sectionList = await sectionContainer.$$(".js-section");
    const productList = [];
    for (const section of sectionList) {
      const productElement = await section.$$(".product-tuple-listing");
      productList.push(...productElement);
    }
    let bookFound = "No";
    let bookUrl = " ";
    for (const product of productList) {
      let productTitle = await product.$eval(
        ".product-tuple-description .product-title",
        (element) => element.textContent
      );
      productTitle = cleanTitle(productTitle);
      const productUrl = await product.$eval(
        ".product-tuple-description .dp-widget-link",
        (element) => element.getAttribute("href")
      );
      const match = ss.stringSimilarity(productTitle, bookTitle) * 100;
      if (match >= 90) {
        bookFound = "Yes";
        await page.goto(productUrl, { waitUntil: "networkidle2" });
        bookUrl = productUrl;
        break;
      }
    }
    if (bookFound === "No") return notFound;
    //Scraping all the details of our found book

    //Starting with the Author and Publisher
    const bookWrapper = await page.$("#content_wrapper");
    const bookDetails = await bookWrapper.$(
      ".pdp-two-col .product-specs .tab-container .spec-body .dtls-list"
    );
    const bookSpecList = await bookDetails.$$eval(".dtls-li", (elements) =>
      elements.map((element) => element.textContent)
    );
    let bookAuthor = " ";
    let bookPublisher = " ";

    for (const spec of bookSpecList) {
      if (spec.includes("Author:")) {
        bookAuthor = spec.split(":")[1].trim();
      }
      if (spec.includes("Publisher:")) {
        bookPublisher = spec.split(":")[1].trim();
      }
    }

    //Scraping the Price and In stock status

    const priceDetails = await bookWrapper.$(
      ".pdp-section .product-detail .pdp-elec-topcenter-inner"
    );
    const bookPrice = await priceDetails.$eval(
      ".elecPriceTile .pdp-final-price .payBlkBig",
      (element) => element.textContent
    );
    const buyContainer = await priceDetails.$(
      ".grey-contnr .pdp-comp .buy-button-container .buyNow"
    );
    const bookStock = await buyContainer.$eval(".intialtext", (element) =>
      element.textContent === "buy now" ? "Yes" : "No"
    );
    return {
      URL: bookUrl,
      Site: "Snapdeal",
      Found: "Yes",
      Author: bookAuthor,
      Publisher: bookPublisher,
      Price: bookPrice,
      Stock: bookStock,
    };
  } catch (error) {
    console.log("Book Not Found");
    return notFound;
  }
}

module.exports = scraper;

//try {
//  const notFoundElement = await page.$eval(
//    ".sysMsgHome .alert-heading",
//    (element) =>
//      element.textContent ===
//      "Oops! Looks like something went wrong, please try again in sometime."
//        ? true
//        : false
//  );
//  if (notFoundElement) {
//    console.log("Book not found on Snapdeal");
//    return notFound;
//  }
//} catch {
//  console.log("Book Found!!");
//}
