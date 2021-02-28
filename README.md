# tg-file-id
A simple nodejs module to decode file_id and file_uniq_id of telegram bots


example usage:

``` js
let f = require('tg-file-id');
let result = f.decodeFileId("AwACAgQAAxkBAAEE3SZgO-PbHlWtxRt5cPWvXlGRWHXM3AACuwgAAj0d4FF_jv-i_-7iQR4E")
```
result will be:
``` js
{
  version: 4,
  subVersion: 30,
  typeId: 3,
  dcId: 4,
  hasReference: true,
  hasWebLocation: false,
  fileType: 'voice',
  fileReference: '010004dd26603be3db1e55adc51b7970f5af5e51915875ccdc',
  id: 5899747659685562555n,
  access_hash: 4747619738920652415n
}
```


and for file_uniq_ids
```js
let f = require('tg-file-id')
let result = f.decodeUniqFileId('AgADuwgAAj0d4FE');
```
result will be:
```js
{ typeId: 2, type: 'document', id: 5899747659685562555n }
 ```