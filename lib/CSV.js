const util = require('./util');
const path = require('path');
class CSV {
  constructor (initData, options = {}) {
    this.titlesLength = initData.titlesLength;
    this.maxLength = initData.maxLength;
    this.rowsNumber = initData.rowsNumber;
    this.titles = initData.titles;
    this.rows = initData.rows;

    this._options = options;
    this.separator = options.separator || ',';
    this.importSeparator = options.importSeparator || ',';
    this.csvEncodingFormat = options.csvEncodingFormat;
  }

  export () {
    const title = this.titles.join(this.separator);
    const rowsText = this.rows.map(row => row.map(block =>
      block.indexOf(this.separator > 0) ? `"${block}"` : block
    ).join(this.separator)).join('\n');
    return `${title}\n${rowsText}\n`;
  }

  async exportFile (filePath) {
    let basePath = this.execFilePath;
    if (!this.basePath && ['/', '\\'].indexOf(filePath) < 0) {
      const paths = util.stack;
      basePath = paths[2].dir;
    }

    let csv = this.export();
    if (this._options.csvEncodingFormat) {
      csv = this.csvEncodingFormat(Buffer.from(csv));
    }

    await util.writeFile(path.resolve(basePath, filePath), csv);
  }

  getTitle () {
    return this.titles.map(t => t); // clone
  }

  getRow (rowNo, withName) {
    if (rowNo < 1 || rowNo > this.rowsNumber) {
      return [];
    }

    const row = this.rows[rowNo - 1];

    if (!withName) {
      const result = [];
      for (let i = 0; i < this.maxLength; i++) {
        result.push(row[i] || '');
      }
      return result;
    }
    const result = [];
    for (let i = 0; i < this.maxLength; i++) {
      result.push({
        name: this.titles[i] || '',
        value: row[i] || ''
      });
    }
    return result;
  }

  getRows (withName) {
    const ids = [];
    for (let i = 1; i < this.rowsNumber + 1; i++) {
      ids.push(i);
    }
    return ids.map(id => this.getRow(id, withName));
  }

  getValue (rowNo, columnNo, withName) {
    if (rowNo > this.rowsNumber ||
      columnNo > this.maxLength ||
      rowNo < 1 ||
      columnNo < 1) {
      return '';
    }
    const value = this.rows[rowNo - 1][columnNo - 1] || '';
    if (withName) {
      return {
        name: this.titles[columnNo - 1],
        value
      };
    }
    return value;
  }

  rowNo (rowNo) {
    const self = this;
    return {
      columnNo (columnNo) {
        return {
          get: self.getValue.bind(self, rowNo, columnNo),
          update: self.updateValue.bind(self, rowNo, columnNo),
          reset: self.updateValue.bind(self, rowNo, columnNo, '')
        };
      }
    };
  }

  getValueByTitle (title, rowNo, withName) {
    const index = this.titles.indexOf(title);
    if (index < 0) return null; // 返回 null 区分 ''

    return this.getValue(rowNo, index + 1, withName);
  }

  getMaxRowsNum () {
    return this.rowsNumber;
  }

  appendRows (items) {
    this.rowsNumber++;
    this.rows.push(items);
  }

  appendRowsInFrontOf (items) {
    this.rowsNumber++;
    this.rows.unshift(items);
  }

  insertRows (rowNo, items) {
    const index = rowNo - 1;
    if (index < 0 || index > this.rowsNumber) {
      throw new Error('out of index');
    }
    if (index === this.rowsNumber) {
      return this.appendRows(items);
    } else if (index === 0) {
      return this.appendRowsInFrontOf(items);
    }

    const first = this.rows.slice(0, index + 1);
    const second = this.rows.slice(index + 1, this.rowsNumber);
    this.rows = [].concat(first, [items], second);
    this.rowsNumber++;
  }

  appendRowsByText (rowText, separator) {
    const items = util.dealLine(rowText, separator || this.importSeparator || ',');
    this.appendRows(items);
  }

  removeRows (rowNo) {
    const index = rowNo - 1;
    if (index < 0 || index >= this.rowsNumber) {
      throw new Error('out of index');
    }
    this.rowsNumber--;
    if (index === 0) {
      this.rows.shift();
    } else if (index === this.rowsNumber - 1) {
      this.rows.pop();
    }
    const first = this.rows.slice(0, index);
    const second = this.rows.slice(index + 1, this.rowsNumber);
    this.rows = [].concat(first, second);
    this.rowsNumber++;
  }

  updateRows (rowNo, row) {
    const index = rowNo - 1;
    if (index < 0 || index >= this.rowsNumber) {
      throw new Error('out of index');
    }

    this.rows[index] = row;
    if (row.length > this.maxLength) {
      this.maxLength = row.length;
    }
  }

  updateRowsByText (rowNo, rowText, separator) {
    const items = util.dealLine(rowText, separator || this.importSeparator || ',');
    this.updateRows(rowNo, items);
  }

  updateValue (rowNo, columnNo, value) {
    if (rowNo > this.rowsNumber ||
      columnNo > this.maxLength ||
      rowNo < 1 ||
      columnNo < 1) {
      throw new Error(`index range out of rowNo: 1-${this.rowsNumber} & columnNo: 1-${this.maxLength}`);
    }
    this.rows[rowNo - 1][columnNo - 1] = value;
  }
}

module.exports = CSV;
