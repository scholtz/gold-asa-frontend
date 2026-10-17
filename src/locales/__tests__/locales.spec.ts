import { describe, expect, it } from 'vitest'
import en from '../en.json'
import sk from '../sk.json'
import cs from '../cs.json'
import de from '../de.json'
import es from '../es.json'
import hu from '../hu.json'
import pl from '../pl.json'
import zh from '../zh.json'

const locales = { sk, cs, de, es, hu, pl, zh } as Record<string, any>

/** `{name}` placeholders of a message */
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('trading screen translations', () => {
  // keys of other pages that are not translated everywhere yet (they fall back to English)
  const other = ['goldToken', 'listOfGoldCoins', 'listOfAllGoldCoins', 'priceList']
  const keys = Object.keys(en.trading).filter((key) => !other.includes(key))

  for (const [name, messages] of Object.entries(locales)) {
    it(`${name} has every trading key with the same placeholders`, () => {
      for (const key of keys) {
        const value = messages.trading?.[key]
        expect(value, `${name}.trading.${key}`).toBeTypeOf('string')
        expect(value.trim(), `${name}.trading.${key}`).not.toBe('')
        expect(placeholders(value), `${name}.trading.${key} placeholders`).toEqual(
          placeholders((en.trading as Record<string, string>)[key])
        )
      }
    })
  }

  it('does not use characters that vue-i18n treats specially', () => {
    for (const [name, messages] of Object.entries({ en, ...locales })) {
      for (const [key, value] of Object.entries(messages.trading as Record<string, string>)) {
        expect(value, `${name}.trading.${key}`).not.toMatch(/[|@$]/)
      }
    }
  })
})

describe('router settings translations', () => {
  const keys = ['tradingPanel', 'routerHint', 'routerFallbackHint', 'routerEndpoint']
  for (const [name, messages] of Object.entries({ en, ...locales })) {
    it(`${name} has the router settings texts`, () => {
      for (const key of keys) {
        const value = (messages as any).settings?.[key]
        expect(value, `${name}.settings.${key}`).toBeTypeOf('string')
        expect(value.trim(), `${name}.settings.${key}`).not.toBe('')
      }
      expect(placeholders((messages as any).settings.routerFallbackHint)).toEqual(['env'])
    })
  }
})
