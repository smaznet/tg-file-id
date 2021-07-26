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
      '{"_":"document","flags":1,"id":"5350580067338554518","access_hash":"9794799964003395731","file_reference":{"0":3,"1":0,"2":0,"3":1,"4":128,"5":96,"6":71,"7":219,"8":13,"9":140,"10":58,"11":142,"12":201,"13":179,"14":182,"15":207,"16":139,"17":98,"18":228,"19":219,"20":83,"21":233,"22":245,"23":149,"24":98},"date":1615321869,"mime_type":"application/x-tgsticker","size":56507,"thumbs":[{"_":"photoPathSize","type":"j","bytes":{"0":28,"1":4,"2":173,"3":2,"4":220,"5":75,"6":130,"7":71,"8":83,"9":81,"10":88,"11":79,"12":74,"13":105,"14":163,"15":116,"16":144,"17":66,"18":68,"19":65,"20":72,"21":68,"22":75,"23":65,"24":66,"25":69,"26":128,"27":70,"28":67,"29":71,"30":71,"31":68,"32":84,"33":66,"34":93,"35":129,"36":69,"37":74,"38":134,"39":79,"40":132,"41":82,"42":70,"43":90,"44":134,"45":101,"46":66,"47":78,"48":75,"49":119,"50":73,"51":4,"52":121,"53":75,"54":1,"55":65,"56":71,"57":158,"58":72,"59":160,"60":73,"61":128,"62":128,"63":135,"64":86,"65":135,"66":87,"67":129,"68":65,"69":85,"70":94,"71":85,"72":111,"73":128,"74":79,"75":134,"76":92,"77":136,"78":105,"79":131,"80":83,"81":130,"82":102,"83":135,"84":120,"85":142,"86":116,"87":184,"88":72,"89":4,"90":138,"91":8,"92":73,"93":0,"94":154,"95":67,"96":174,"97":68,"98":134,"99":9,"100":138,"101":184,"102":161,"103":134,"104":5,"105":137,"106":2,"107":134,"108":9,"109":143,"110":1,"111":129,"112":139,"113":132,"114":154,"115":131,"116":166,"117":129,"118":133,"119":67,"120":138,"121":67,"122":143,"123":128,"124":137,"125":135,"126":145,"127":132,"128":154,"129":65,"130":133,"131":70,"132":137,"133":70,"134":142,"135":128,"136":146,"137":147,"138":165,"139":147,"140":185,"141":128,"142":145,"143":91,"144":135,"145":9,"146":105,"147":136,"148":9,"149":79,"150":139,"151":97,"152":136,"153":109,"154":142,"155":68,"156":131,"157":131,"158":137,"159":84,"160":139}},{"_":"photoSize","type":"m","location":{"_":"fileLocationToBeDeprecated","volume_id":"200275800184","local_id":33657},"w":128,"h":128,"size":4048}],"dc_id":2,"attributes":[{"_":"documentAttributeImageSize","w":512,"h":512},{"_":"documentAttributeFilename","file_name":"AnimatedSticker.tgs"}]}');
  let fileId = new FileId();
  fileId.typeId = 8;
  // fileId.url
  fileId.id = BigInt(value.id);
  fileId.accessHash = BigInt(value.access_hash);
  fileId.fileReference = Buffer.from(Uint8Array.from(Object.values(value.file_reference))).toString('hex');
  console.log(fileId.fileReference);
  fileId.fileType = 'sticker';
  fileId.version = 4;
  fileId.subVersion = 30;
  fileId.dcId = 2;

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
