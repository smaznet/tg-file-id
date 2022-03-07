var assert = require('assert');
var tgFileId = require('../dist/index');
var FileId = require('../dist/FileId').default;
var FileUniqId = require('../dist/FileUniqId').default;
describe('Testing some file_ids', function() {
  let fileIds = {
    sticker: 'CAACAgEAAxkBAAEE3SRgO-OW-HDMHW5rOGsSFWhZScQl4AAC8BIAApa4VwXGFC4AAaCSsQMeBA',
    voice:   'AwACAgQAAxkBAAEE3SZgO-PbHlWtxRt5cPWvXlGRWHXM3AACuwgAAj0d4FF_jv-i_-7iQR4E',
    photo:   'AgACAgQAAxkBAAEE3SJgO-GfzTTuFpKFCl4JYBFqpugg6gAC6bYxGzqI4FEpgFjCLHbVHA-lgCddAAMBAAMCAAN4AAM2rwUAAR4E',
    audio:   'CQACAgQAAxkBAAEE3Y9gPBq7mDBuFlr6rq7wsS1PcGGeiwACqQkAAjp72FGISW9QI52Nfx4E',
  };
  for (let key in fileIds) {
    describe(key, function() {
      it('should return fileType ' + key, function() {
        let output = tgFileId.decodeFileId(fileIds[key]);
        assert.strictEqual(key, output.fileType);
      });
      it('should return same fileId', function() {
        let fId = FileId.fromFileId(fileIds[key]);
        assert.strictEqual(fileIds[key], fId.toFileId());
      });
      it('should return same id for FileUniqId and FileId', function() {
        let fId = FileId.fromFileId(fileIds[key]);
        let fU = FileUniqId.fromFileId(fileIds[key]);
        assert.strictEqual(fId.id, fU.id);
      });
    });
  }
  let profileFileIds = {
    small: 'AQADBAADwawxGxMjtgcACDvytxsABAIAAxMjtgcABPqM9f80seQ8I7wHAAEeBA',
    big:   'AQADBAADwawxGxMjtgcACDvytxsABAMAAxMjtgcABPqM9f80seQ8JbwHAAEeBA',
  };
  for (let key in profileFileIds) {
    describe('Profile Photo ' + key, function() {
      it('should be profile_photo and ' + key, function() {
        let output = tgFileId.decodeFileId(profileFileIds[key]);
        assert.strictEqual(output.fileType, 'profile_photo');
        assert.strictEqual(output.photoSize, key);
      });
    });
  }
  describe('Sticker thumb', function() {
    it('should be thumbnail and has stickerSetId', function() {
      let output = tgFileId.decodeFileId('AAQEABPWoT0jXQADBAADDwADyPrsE2HR5gsnLl4rPkYAAh4E');
      assert.strictEqual(output.fileType, 'thumbnail');
      assert.strictEqual(output.stickerSetId, 1435798118124748815n);
    });
  });
});

describe('Testing some file_uniq_ids', function() {
  let fileUniqIds = {
    document: {
      fid:    'AgADqQkAAjp72FE',
      typeId: 2,
      id:     5897599201079986601n,
    },
    photo:    {
      typeId:   1,
      fid:      'AQADD6WAJ10AAzavBQAB',
      volumeId: 400094700815n,
    },
  };
  for (let type in fileUniqIds) {
    describe(type, function() {
      it('should be ' + type, function() {
        let out = tgFileId.decodeUniqFileId(fileUniqIds[type].fid);
        if (type === 'photo') {
          assert.strictEqual(out.volumeId, fileUniqIds[type].volumeId);
        }else if (type === 'document') {
          assert.strictEqual(out.id, fileUniqIds[type].id);
        }
        assert.strictEqual(out.typeId, fileUniqIds[type].typeId);
        assert.strictEqual(type, out.type);
      });
    });
  }
});
describe('Test convert from mtproto to bot api', function() {
  let value = JSON.parse(
      '{"flags":1,"document":{"flags":1,"id":"1592756632805186045","accessHash":"8648091647552727112","fileReference":{"type":"Buffer","data":[1,0,0,2,99,98,38,9,232,192,109,199,16,52,153,28,112,196,62,180,121,40,55,243,225]},"date":1565305305,"mimeType":"image/webp","size":15974,"thumbs":[{"type":"j","bytes":{"type":"Buffer","data":[25,6,179,2,225,89,6,229,0,89,6,128,89,6,225,25,6,153,6,239,25,6,153,6,225,89,6]}},{"type":"m","w":320,"h":320,"size":9340}],"videoThumbs":null,"dcId":5,"attributes":[{"w":512,"h":512},{"flags":0,"mask":false,"alt":"💨","stickerset":{"id":"1592756632805179695","accessHash":"7107174106550882933"},"maskCoords":null},{"fileName":"sticker.webp"}]},"ttlSeconds":null}');
  let fileId = new FileId();
  fileId.typeId = 8;
  // fileId.url
  fileId.id = BigInt(value.document.id);
  fileId.accessHash = BigInt(value.document.accessHash);
  fileId.fileReference = Buffer.from(Uint8Array.from(Object.values(value.document.fileReference.data))).toString('hex');
  console.log(fileId.fileReference);
  fileId.fileType = 'sticker';
  fileId.version = 4;
  fileId.subVersion = 30;
  fileId.dcId = 5;

  const file_id = fileId.toFileId();
  console.log('gen:', file_id);

});

describe('Test sticker owner id', function() {
  let fileIdStr = 'CAACAgIAAxkBAAIEVF9Do80olppb0490gLH2I1cszuoMAALcCQACAoujAAEqUB3Wl6aD6BsE';
  let fileId = FileId.fromFileId(fileIdStr);
  let owner = fileId.getOwnerId();
  console.log(owner);
  it('should be 10717954', function() {
    assert.strictEqual( owner,10717954);
  });
});
