const groupBatchesByLineNum = (data) => {
    if (!data || !Array.isArray(data)) {
        return [];
    }

    const groupedItems = data.reduce((accumulator, currentItem) => {
        const { LineNum, BatchNum, QtyBatch, ...restOfItem } = currentItem;

        if (!accumulator.has(LineNum)) {
            accumulator.set(LineNum, {
                ...restOfItem, 
                LineNum: LineNum,
                batchNumbers: [] 
            });
        }

        accumulator.get(LineNum).batchNumbers.push({
            BatchNum: BatchNum,
            QtyBatch: Number(QtyBatch)
        });
        return accumulator;
    }, new Map());
    return Array.from(groupedItems.values());
}

module.exports={groupBatchesByLineNum}