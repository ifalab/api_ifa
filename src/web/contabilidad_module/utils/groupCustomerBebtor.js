const groupByCustomer = (data) => {
  const grouped = {};

  for (const item of data) {
    const { CardCode, CardName, GroupCode, GroupName } = item;

    if (!grouped[CardCode]) {
      grouped[CardCode] = {
        CardCode,
        CardName,
        GroupCode,
        GroupName,
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