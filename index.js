/**
 * @Author: maple
 * @Date: 2020-09-14 09:29:53
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 11:07:06
 */

const CSVReader = require('./lib/CSV_Reader');
const CSV = require('./lib/CSV');

const reader = new CSVReader();

module.exports = {
  CSVReader: CSVReader,
  CSV: CSV,
  from: function (csv) {
    return reader.readCSV(csv);
  }
};
