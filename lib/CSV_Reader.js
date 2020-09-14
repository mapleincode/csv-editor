/**
 * @Author: maple
 * @Date: 2020-09-13 09:25:38
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 13:15:44
 */
const path = require('path');
const CSV = require('./CSV');
const util = require('./util');

class CSVReader {
  constructor (options = {}) {
    this._options = options;

    this.csvData = (typeof options.csv === 'string' ? options.csv : '').trim(); // csv 文件
    this.csvInit = !!this.csvInit; // 是否 csv 已填充
    this.execFilePath = options.execFilePath; // 执行文件的目录，用于读取文件和写入文件用
    this.separator = options.separator || ','; // 分隔符
    this.exportSeparator = options.exportSeparator || ',';
    this.bufferFormat = options.bufferFormat;
    this.csvEncodingFormat = options.csvEncodingFormat;
  }

  readCSV (csvText) {
    // let titlesLength // title length
    // let maxLength // max length
    // let rowsNumber // rows number
    // let titles // titles
    // let rows // rows

    const _rows = csvText.split('\n').map(s => s.trim()).filter(s => s);
    const titles = util.dealLine(_rows.shift(), this.separator);
    const titlesLength = titles.length;
    let maxLength = titles.length;

    const rows = _rows.map(row => util.dealLine(row, this.separator))
      .filter(row => row.length);
    rows.forEach(row => {
      if (row.length > maxLength) {
        maxLength = row.length;
      }
      return row;
    });

    const rowsNumber = rows.length;

    const data = {
      titlesLength,
      maxLength,
      rowsNumber,
      titles,
      rows
    };
    const csv = new CSV(data, {
      ...this._options,
      importSeparator: this.separator,
      separator: this.exportSeparator
    });
    return csv;
  }

  async readCSVFile (filePath, options = {}) {
    let { encoding = 'utf8' } = options;

    let basePath = this.execFilePath;
    if (!this.basePath && ['/', '\\'].indexOf(filePath) < 0) {
      const paths = util.stack;
      basePath = paths[2].dir;
    }

    const csvBuffer = await util.readFile(path.resolve(basePath, filePath));
    if (encoding !== 'binary' || !this.bufferFormat) {
      if (encoding === 'binary') {
        encoding = 'utf8';
      }
      return this.readCSV(csvBuffer.toString(encoding));
    }
    return this.readCSV(this.bufferFormat(csvBuffer));
  }
}

module.exports = CSVReader;
