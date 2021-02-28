var assert = require('assert');
var tgFileId = require('../dist/index');
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
        assert.strictEqual(out.typeId,fileUniqIds[type].typeId)
        assert.strictEqual(type, out.type);
      });
    });
  }
});
