import {FileIdInfo, UniqFileIdInfo} from "./types/FileIdInfo";

const PHOTOSIZE_SOURCE_LEGACY = 0;
const PHOTOSIZE_SOURCE_THUMBNAIL = 1;
const PHOTOSIZE_SOURCE_DIALOGPHOTO_SMALL = 2;
const PHOTOSIZE_SOURCE_DIALOGPHOTO_BIG = 3;
const PHOTOSIZE_SOURCE_STICKERSET_THUMBNAIL = 4;
const UNIQUE_WEB = 0;
const UNIQUE_PHOTO = 1;
const UNIQUE_DOCUMENT = 2;
const UNIQUE_SECURE = 3;
const UNIQUE_ENCRYPTED = 4;
const UNIQUE_TEMP = 5;

class Util {
  static FLAGS = {
    FILE_REFERENCE_FLAG: 1 << 25,
    WEB_LOCATION_FLAG: 1 << 24
  }
  static TYPES = [
    'thumbnail',
    'profile_photo',
    'photo',
    'voice',
    'video',
    'document',
    'encrypted',
    'temp',
    'sticker',
    'audio',
    'animation',
    'encrypted_thumbnail',
    'wallpaper',
    'video_note',
    'secure_raw',
    'secure',
    'background',
    'size'
  ]
  static UNIQUE_TYPES = [
    'web',
    'photo',
    'document',
    'secure',
    'encrypted',
    'temp'
  ];

  private static rleDecode(input: Buffer) {
    let last = '',
        news = '', splited = input.toString('binary');
    for (let cur of splited) {
      if (last === "\0") {
        news += last.repeat(cur.charCodeAt(0))
        last = ''
      } else {
        news += last;
        last = cur;
      }
    }

    let str = news + last;


    return Buffer.from(str, 'binary');
  }


  private static posmod(a: number, b: number) {
    let resto = a % b;
    return resto < 0 ? resto + Math.abs(b) : resto;
  }

  private static readTLString(data: Buffer) {
    let l = data[0];
    let x: Buffer;
    if (l > 254) {
      throw new Error("Length Too big");
    }
    if (l === 254) {
      let tmpBuff = Buffer.alloc(4);
      data.copy(tmpBuff, 0, 0, 3);
      tmpBuff.write("\0", 3);
      let long_len = tmpBuff.readInt32LE();
      x = data.slice(4, 4 + long_len);
      let resto = Util.posmod(-long_len, 4);
      if (resto > 0) {
        data = data.slice(4 + long_len + resto);
      } else {
        data = data.slice(4 + long_len);
      }
    } else {
      x = l ? data.slice(1, 1 + l) : Buffer.from('');
      let resto = Util.posmod(-(l + 1), 4);
      if (resto > 0) {
        data = data.slice(1 + l + resto);
      } else {
        data = data.slice(1 + l);
      }
    }
    return {x, newData: data};
  }

  private static packTLString(input: string) {
    let l = Buffer.from(input).length;
    let output = '';
    console.log("L:" + l)
    if (l <= 253) {
      output += String.fromCharCode(l);
      output += input;
      output += "\0".repeat(Util.posmod(-l - 1, 4));
    } else {
      output += String.fromCharCode(254);
      let buff = Buffer.alloc(32);
      buff.writeInt32LE(l);
      let nodeOut = buff.slice(0, 3);
      console.log(nodeOut.toString('hex'))
      output += nodeOut.toString()
      output += input;

      let t2 = "\0".repeat(Util.posmod(-l, 4));
      output += t2
    }
    return output;
  }

  private static base64UrlDecode(string: string) {
    return Buffer.from(string.replace(/-/g, '+')
        .replace(/_/, '/'), 'base64');
  }

  static decodeFileId(fileId: string): FileIdInfo {
    let base64Decoded = Util.base64UrlDecode(fileId);
    let rlDecoded = Util.rleDecode(base64Decoded);
    let out: FileIdInfo = {} as FileIdInfo;
    out.version = rlDecoded[rlDecoded.length - 1]
    out.subVersion = out.version === 4 ? rlDecoded[rlDecoded.length - 2] : 0
    out.typeId = rlDecoded.readUInt32LE(0);
    out.dcId = rlDecoded.readUInt32LE(4);
    out.hasReference = !!(out.typeId & Util.FLAGS.FILE_REFERENCE_FLAG);
    out.hasWebLocation = !!(out.typeId & Util.FLAGS.WEB_LOCATION_FLAG);
    out.typeId &= ~Util.FLAGS.FILE_REFERENCE_FLAG;
    out.typeId &= ~Util.FLAGS.WEB_LOCATION_FLAG;

    out.fileType = Util.TYPES[out.typeId];
    rlDecoded = rlDecoded.slice(8);
    if (out.hasReference) {
      let {x, newData} = Util.readTLString(rlDecoded);
      rlDecoded = newData;
      out.fileReference = x.toString('hex');
    }
    if (out.hasWebLocation) {
      let {x} = Util.readTLString(rlDecoded)
      out.url = x.toString();
      out.access_hash = rlDecoded.readBigInt64LE(8);
      return out;
    }
    out.id = rlDecoded.readBigUInt64LE()
    out.access_hash = rlDecoded.readBigUInt64LE(8);
    rlDecoded = rlDecoded.slice(128 / 8);
    // its photo
    if (out.typeId <= 2) {
      out.volumeId = rlDecoded.readBigInt64LE();
      out.secret = 0;
      out.photoSizeSource = out.version >= 4 ? rlDecoded.readUInt32LE(8) : 0;

      switch (out.photoSizeSource) {
        case PHOTOSIZE_SOURCE_LEGACY:
          out.secret = rlDecoded.readBigInt64LE(12);
          out.localId = rlDecoded.readInt32LE(20);
          break;
        case PHOTOSIZE_SOURCE_THUMBNAIL:
          out.fileType = rlDecoded.readUInt32LE(12);
          out.thumbnailType = rlDecoded.slice(16, 20).toString().replace(/\u0000/g, '')
          out.localId = rlDecoded.readInt32LE(20);
          break;
        case PHOTOSIZE_SOURCE_DIALOGPHOTO_BIG:
        case PHOTOSIZE_SOURCE_DIALOGPHOTO_SMALL:
          out.photoSize = out.photoSizeSource === PHOTOSIZE_SOURCE_DIALOGPHOTO_SMALL ? "small" : 'big';
          out.dialogId = rlDecoded.readBigUInt64LE(12);
          out.dialogAccessHash = rlDecoded.readBigUInt64LE(20);
          out.localId = rlDecoded.readInt32LE(28);
          break;
        case PHOTOSIZE_SOURCE_STICKERSET_THUMBNAIL:
          out.stickerSetId = rlDecoded.readBigUInt64LE(12);
          out.stickerSetAccessHash = rlDecoded.readBigUInt64LE(20)
          out.localId = rlDecoded.readInt32LE(28);
          break;
      }


    }
    return out;
  }

  static decodeUniqueFileId(input: string) {
    let rlDecoded = Util.rleDecode(Util.base64UrlDecode(input));

    let out = {} as UniqFileIdInfo;
    out.typeId = rlDecoded.readUInt32LE();
    if (!Util.UNIQUE_TYPES[out.typeId]) {
      throw new Error("Invalid file type provided: " + out.typeId);
    }
    out.type = Util.UNIQUE_TYPES[out.typeId]
    rlDecoded = rlDecoded.slice(4);

    if (out.typeId === UNIQUE_WEB) {
      let {x, newData} = Util.readTLString(rlDecoded.slice())
      out.url = x.toString();

    } else if (rlDecoded.length === 12) {
      out.volumeId = rlDecoded.readBigUInt64LE();
      out.localId = rlDecoded.readUInt32LE(8);

    } else {
      out.id = rlDecoded.readBigUInt64LE();

    }
    return out;

  }

}

export default Util;
