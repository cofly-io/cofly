import { Jieba } from '@node-rs/jieba'
import { dict } from '@node-rs/jieba/dict'
import { removeStopwords, zho } from 'stopword'

let jieba: Jieba;

export function extractKeywords(query: string, expandWeak = false): string[] {
    if(!jieba) {
        jieba = Jieba.withDict(dict);
    }

    return removeStopwords(jieba.cut(query), zho);
}
