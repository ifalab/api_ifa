const parseCommaSeparatedNumbers = (str) => {
  return str
    .toString()
    .split(',')
    .map(val => val.trim())
    .filter(val => val !== '')
    .map(Number);
};

module.exports = {
  parseCommaSeparatedNumbers
};