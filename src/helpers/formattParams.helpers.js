
const formattParam = (param) => {
    if (param === null || param === undefined) {
        return 'null'
    }
    if (typeof param === 'string') {
        return `'${param}'`
    }
    return param
}

module.exports = { formattParam }