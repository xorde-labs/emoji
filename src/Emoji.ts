import { EmojiData } from "./data/emoji.data";
import * as fs from "fs";
import * as http from "https";
import * as cheerio from "cheerio";
import { ElementType } from "domelementtype";
import { IEmojiSupport } from "./interfaces/data.interface";

export class Emoji {
  data: any[] = [];

  async fetch(url:string): Promise<string> {
    return new Promise((resolve, reject) => {
      http.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => resolve(body));
      }).on("error", reject);
    });
  }

  parseFull(dom: any) {
    const domFull = cheerio.load(dom);

    domFull("div.main table tbody tr").get().map(tr => {
      const cols = domFull("td", tr).get();
      if (cols.length == 15 || cols.length == 5) {
        const hasChildImgTag = (col: cheerio.Element) =>
          col ? col.firstChild?.type == ElementType.Tag && col.firstChild?.name == "img" : true;
        const support: IEmojiSupport = {
          apple: hasChildImgTag(cols[3]),
          google: hasChildImgTag(cols[4]),
          facebook: hasChildImgTag(cols[5]),
          windows: hasChildImgTag(cols[6]),
          twitter: hasChildImgTag(cols[7]),
          joy: hasChildImgTag(cols[8]),
          samsung: hasChildImgTag(cols[9]),
          gmail: hasChildImgTag(cols[10]),
          softbank: hasChildImgTag(cols[11]),
          docomo: hasChildImgTag(cols[12]),
          kddi: hasChildImgTag(cols[13])
        };

        const code = domFull('a', cols[1]).contents().first().text();

        if (!this.data.find((f) => f.code == code)) this.data.push({code, support});
        else this.data.map(m => {
          const i = m;
          i.support = support;
          return m.code != code ? m : i;
        })
      }
    });
  }

  parseList(dom: any) {
    const domList = cheerio.load(dom);

    domList("div.main table tbody tr").get().map(tr => {
      const cols = domList("td", tr).get();
      if (cols.length == 5) {
        const code = domList('a', cols[1]).contents().first().text();
        const keywords: string[] = ((<Text><unknown>cols[4].children[0]).data ?? []).split('|').map(m => m.trim());
        const short_name: string = ((<Text><unknown>cols[3].children[0]).data ?? []);

        if (!this.data.find((f) => f.code === code)) this.data.push({code, keywords, short_name});
        else this.data.map(m => {
          if (m.code === code) {
            m.short_name = short_name;
            m.keywords = keywords;
          }
          return m;
        })
      }
    });
  }

  async buildJsonData() {
    const urlFull = 'https://unicode.org/emoji/charts/full-emoji-list.html';
    const urlList = 'https://unicode.org/emoji/charts/emoji-list.html'

    const fetchFull = await this.fetch(urlFull);
    const fetchList = await this.fetch(urlList);

    this.parseFull(fetchFull);
    this.parseList(fetchList);

    console.log('Records fetched', this.data.length);

    const newData = EmojiData.map(m => {
      m.hex = [];
      m.dec = [];
      for (let i = 0; i < m.emoji.length / 2; i++) {
        const pos = i * 2;
        m.hex.push((m["emoji"].codePointAt(pos) ?? 0).toString(16));
        m.dec.push(Number(m["emoji"]?.codePointAt(pos)?.toString(10)));
      }
      m.code = m.hex.map(m => 'U+' + m.toUpperCase()).join(' ');
      const data = this.data.find((s) => s.code == m.code);
      m.support = data?.support ?? {};
      m.keywords = data?.keywords ?? [];
      m.short_name = data?.short_name ?? '';
      m.modifiers = ["none"];

      return m;
    });

    console.log('Records written', newData.length);
    fs.writeFileSync("emoji.json", JSON.stringify(newData));
  }
}

const e = new Emoji();
e.buildJsonData();
