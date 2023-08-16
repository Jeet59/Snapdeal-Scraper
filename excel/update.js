const xlsx = require("xlsx");

async function update(file, response, originalData) {
  try {
    const finalData = {
      A: originalData.No,
      B: originalData["Book Title"],
      C: originalData.ISBN,
      D: response.Site,
      E: response.Found,
      F: response.URL,
      G: response.Price,
      H: response.Author,
      I: response.Publisher,
      J: response.Stock,
    };

    const workbook = xlsx.readFile(file, { cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    for (let i = 65; i < 75; i++) {
      const columnNo = String.fromCharCode(i);
      const cellReference = `${columnNo}${finalData.A + 1}`;

      if (finalData[columnNo] !== undefined) {
        const cell = worksheet[cellReference] || {};
        cell.v = finalData[columnNo];
        worksheet[cellReference] = cell;
      }
    }

    await xlsx.writeFile(workbook, file);

    console.log("Excel updated successfully.");
  } catch (error) {
    console.error(error);
  }
}

module.exports = update;
