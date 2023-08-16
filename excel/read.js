const xlsx = require("xlsx");
async function read(file) {
  try {
    const workbook = xlsx.readFile(file, { type: "file" });
    const sheet = "Sheet1";
    const worksheet = workbook.Sheets[sheet];
    return xlsx.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.log("Cant read Excel File");
  }
}

module.exports = read;
