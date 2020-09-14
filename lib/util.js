/**
 * @Author: maple
 * @Date: 2020-09-14 10:55:53
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 11:00:42
 */
const fs = require('fs');
const util = require('util');
const path = require('path');

exports.writeFile = util.promisify(fs.writeFile);
exports.readFile = util.promisify(fs.readFile);

function isColon (word) {
  return word === '"' || word === '\'';
}

exports.isColon = isColon;

function dealLine (text, separator) {
  const items = [];
  const colonStack = [];

  let tmp = '';

  for (let i = 0; i < text.length; i++) {
    const word = text[i];
    if (isColon(word)) {
      const last = colonStack.pop();
      if (last !== word) {
        colonStack.push(last);
        tmp += word;
      }
      continue;
    }

    if (colonStack.length === 0 && word === separator) {
      items.push(tmp.trim());
      tmp = '';
      continue;
    }
    tmp += word;
  }
  items.push(tmp.trim());
  return items;
}

exports.dealLine = dealLine;

function stacks () {
  const stacks = (new Error()).stack.split('\n').map(s => s.trim());
  const paths = [];
  for (let i = 1; i < stacks.length; i++) {
    const text = stacks[i];
    const p = text.indexOf('(');

    if (p < 0) {
      continue;
    }

    const file = text.slice(p + 1, text.length - 1);
    const tmp = file.split(':');
    const charsAt = tmp.pop();
    const rowsAt = tmp.pop();
    const fullPath = tmp.join(':');
    paths.push(Object.assign(path.parse(fullPath), { charsAt, rowsAt, fullPath }));
  }
  return paths;
}

exports.stack = stacks;
