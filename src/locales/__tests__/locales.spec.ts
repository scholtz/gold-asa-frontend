import { describe, expect, it } from 'vitest'
import en from '../en.json'
import sk from '../sk.json'
import cs from '../cs.json'
import de from '../de.json'
import es from '../es.json'
import hu from '../hu.json'
import pl from '../pl.json'
import zh from '../zh.json'
import { aboutTimeline } from '../../views/aboutTimeline'

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
  const keys = [
    'tradingPanel',
    'routerHint',
    'routerFallbackHint',
    'routerEndpoint',
    'routerEndpointInvalid'
  ]
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

describe('about page translations', () => {
  const leaves = (value: any, prefix = ''): string[] =>
    typeof value === 'string'
      ? [prefix]
      : Object.entries(value).flatMap(([key, child]) =>
          leaves(child, `${prefix}${prefix ? '.' : ''}${key}`)
        )
  const get = (messages: any, path: string) => path.split('.').reduce((o, k) => o?.[k], messages)

  for (const [name, messages] of Object.entries(locales)) {
    it(`${name} has every about and contact text without interpolation syntax`, () => {
      for (const path of [...leaves(en.about, 'about'), ...leaves(en.contact, 'contact')].filter(
        (path) => !path.endsWith('Email')
      )) {
        const value = get(messages, path)
        expect(value, `${name}.${path}`).toBeTypeOf('string')
        expect(value.trim(), `${name}.${path}`).not.toBe('')
        expect(value, `${name}.${path}`).not.toMatch(/[|@$]/)
        expect(value, `${name}.${path}`).not.toMatch(/[{}]/)
      }
    })
  }
})

describe('about timeline', () => {
  it('has a text for every entry and no unused texts', () => {
    const used = aboutTimeline.map(([, key]) => key).sort()
    for (const [name, messages] of Object.entries({ en, ...locales })) {
      const events = (messages as any).about.events as Record<string, string>
      expect(Object.keys(events).sort(), name).toEqual(used)
    }
  })

  it('is in chronological order', () => {
    const months = aboutTimeline.map(([month]) => month)
    for (const month of months) expect(month).toMatch(/^20[0-9]{2}-(0[1-9]|1[0-2])$/)
    expect([...months].sort()).toEqual(months)
  })
})
