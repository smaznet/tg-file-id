let f = require('./dist/src/index');

console.assert(f.decodeFileId("AwACAgQAAxkBAAEE3SZgO-PbHlWtxRt5cPWvXlGRWHXM3AACuwgAAj0d4FF_jv-i_-7iQR4E").fileType === 'voice','Check fileType');
console.assert(f.decodeUniqFileId('AgADuwgAAj0d4FE').type==='document','check type')
