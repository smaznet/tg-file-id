"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeUniqFileId = exports.decodeFileId = void 0;
const Util_1 = __importDefault(require("./Util"));
exports.decodeFileId = Util_1.default.decodeFileId;
exports.decodeUniqFileId = Util_1.default.decodeUniqueFileId;
