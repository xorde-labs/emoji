import { TEmojiArray } from "../interfaces/data.interface";
import * as fs from "fs";

export const EmojiData: TEmojiArray = JSON.parse(fs.readFileSync('./emoji.json', 'utf8'));;
