const readExcel = require("./excel/read");
const scraper = require("./snapdeal/scraper");
const updateExcel = require("./excel/update");

async function App() {
  try {
    const data = await readExcel("./Input.xlsx");
    console.log(data);
    for (let index = 0; index < data.length; index++) {
      const response = await scraper(data[index]);
      console.log(" response: ", response);
      await updateExcel("./Input.xlsx", response, data[index]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.log(error);
  }
}
App();
module.exports = App;
