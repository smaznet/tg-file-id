import {decodeFileId} from "./index";
import Util from "./Util";
import FileUniqId from "./FileUniqId";

class FileId {
  private version = 0;
  private subVersion = 0;
  private dcId = 0;
  public typeId = 0;
  private fileType: string | number = '';
  private fileReference?: string;
  public url?: string;
  public id: bigint = BigInt(0)
  private accessHash: bigint = BigInt(0);
  public volumeId?: bigint = BigInt(0);
  public localId?: number | bigint = 0;
  private photoSizeSource?: 'legacy' | 'thumbnail' | 'dialogPhoto' | 'stickerSetThumbnail'
  private photoSizeSourceId?: number;
  private secret?: bigint | number;
  private dialogId?: number | bigint;
  private dialogAccessHash?: number | bigint;
  private isSmallDialogPhoto?: boolean;

  private stickerSetId?: number | bigint;
  private stickerSetAccessHash?: number | bigint;

  private thumbType?: string;
  private thumbTypeId?: number;


  constructor() {
  }

  static fromFileId(fileId: string) {
    try {
      let decoded = decodeFileId(fileId);
      let inst = new FileId();
      inst.version = decoded.version;
      inst.subVersion = decoded.subVersion;
      inst.dcId = decoded.dcId;
      inst.typeId = decoded.typeId;
      inst.fileType = decoded.fileType;
      if (decoded.hasReference) {
        inst.fileReference = decoded.fileReference;
      }
      if (decoded.hasWebLocation) {
        inst.url = decoded.url;
        return inst;
      }
      inst.id = decoded.id;
      inst.accessHash = decoded.access_hash;
      if (decoded.typeId <= 2) {
        inst.volumeId = decoded.volumeId;
        inst.localId = decoded.localId;
        inst.photoSizeSourceId = decoded.photoSizeSource;
        switch (inst.photoSizeSourceId) {
          case Util.PHOTOSIZE_SOURCE_LEGACY:
            inst.secret = decoded.secret;
            inst.photoSizeSource = 'legacy';
            break;
          case Util.PHOTOSIZE_SOURCE_THUMBNAIL:
            inst.thumbType = decoded.thumbnailType;
            inst.photoSizeSource = 'thumbnail';
            inst.thumbTypeId = decoded.thumbTypeId;
            break;
          case Util.PHOTOSIZE_SOURCE_DIALOGPHOTO_SMALL:
          case Util.PHOTOSIZE_SOURCE_DIALOGPHOTO_BIG:
            inst.photoSizeSource = 'dialogPhoto';
            inst.dialogId = decoded.dialogId;
            inst.dialogAccessHash = decoded.dialogAccessHash
            inst.isSmallDialogPhoto = decoded.photoSizeSource === Util.PHOTOSIZE_SOURCE_DIALOGPHOTO_SMALL;
            break;

          case Util.PHOTOSIZE_SOURCE_STICKERSET_THUMBNAIL:
            inst.photoSizeSource = 'stickerSetThumbnail';
            inst.stickerSetId = decoded.stickerSetId;
            inst.stickerSetAccessHash = decoded.stickerSetAccessHash;
            break;
        }
      }
      return inst;
    } catch (e) {
      console.log(e);
      throw new Error("Invalid fileId")
    }

  }


  toFileId(): string {
    let type = this.typeId;
    if (this.fileReference)
      type |= Util.FLAGS.FILE_REFERENCE_FLAG;
    if (this.url)
      type |= Util.FLAGS.WEB_LOCATION_FLAG;
    let out = '';

    out += Util.to32bitBuffer(type);
    out += Util.to32bitBuffer(this.dcId);
    if (this.fileReference) {
      let tlString = Util.packTLString(Buffer.from(this.fileReference, 'hex'));

      out += tlString.toString('binary')
    }
    if (this.url) {
      let tlString = Util.packTLString(Buffer.from(this.url));
      out += tlString.toString('binary')
      if (this.accessHash) {
        out += Util.to64bitBuffer(this.accessHash);
      }
      return Util.base64UrlEncode(Util.rleEncode(out));
    }

    out += Util.to64bitBuffer(this.id);
    out += Util.to64bitBuffer(this.accessHash);

    if (this.typeId <= 2 && this.volumeId && this.photoSizeSourceId) {
      out += Util.to64bitBuffer(this.volumeId);
      if (this.version >= 4) {
        out += Util.to32bitBuffer(this.photoSizeSourceId);
      }
      switch (this.photoSizeSource) {
        case "legacy":
          // @ts-ignore
          out += Util.to64bitBuffer(this.secret);
          break;
        case "thumbnail":
          // @ts-ignore
          out += Util.to32bitBuffer(this.thumbTypeId);
          out += this.thumbType?.padEnd(4, "\0");
          break;
        case "dialogPhoto":
          // @ts-ignore
          out += Util.to64bitBuffer(this.dialogId);
          // @ts-ignore
          out += Util.to64bitBuffer(this.dialogAccessHash);
          break;
        case "stickerSetThumbnail":
          // @ts-ignore
          out += Util.to64bitBuffer(this.stickerSetId);
          // @ts-ignore
          out += Util.to64bitBuffer(this.stickerSetAccessHash)
          break;
      }
      // @ts-ignore
      out += Util.to32bitSignedBuffer(this.localId);

    }
    if (this.version >= 4) {
      out += String.fromCharCode(this.subVersion);
    }
    out += String.fromCharCode(this.version);
    return Util.base64UrlEncode(Util.rleEncode(out));
  }
  toFileUniqId(){
    return FileUniqId.fromFileIdInstance(this).toFileUniqId();
  }
}

export default FileId;
// php
// 030000020400000019010004dd26603be3db1e55adc51b7970f5af5e51915875ccdc0000bb0800003d1de0517f8effa2ffeee2411e04
//node
// 030000020400000019010004dd26603be3db1e55adc51b7970f5af5e51915875ccdc0000bb0800003d1de05100000000000000001e04
