export interface IEmojiSupport {
  apple: boolean;
  google: boolean;
  facebook: boolean;
  windows: boolean;
  twitter: boolean;
  joy: boolean; // JoyPixels (EmojiOne)
  samsung: boolean;
  gmail: boolean;
  softbank: boolean;
  docomo: boolean;
  kddi: boolean;
}

export interface IEmojiElement {
  emoji: string;
  short_name?: string;
  keywords?: string[];
  category: string;
  sub_category?: string;
  modifiers?: string[];
  aliases: string[];
  tags: string[];
  unicode_version: string;
  ios_version: string;
  skin_tones?: boolean;
  utf16?: string;
  hex?: string | string[];
  dec?: number | number[];
  code?: string;
  shortcode?: string;
  shortcodes?: {
    github?: string,
  },
  support?: IEmojiSupport;
}

export type TEmojiArray = IEmojiElement[];
