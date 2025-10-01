const groupByCustomer = (data) => {
  const grouped = {};

  for (const item of data) {
    const { CardCode, CardName } = item;

    if (!grouped[CardCode]) {
      grouped[CardCode] = {
        CardCode,
        CardName,
        details: []
      };
    }

    grouped[CardCode].details.push(item);
  }

  return Object.values(grouped);
}

module.exports = {
  groupByCustomer
}