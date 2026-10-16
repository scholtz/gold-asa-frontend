// Generates src/assets/utilities.css - a small utility class layer (flex, grid, spacing, text, display).
// Run: node scripts/generate-utilities.mjs
import { writeFileSync } from 'node:fs'

const bp = { '': 0, sm: 576, md: 768, lg: 992, xl: 1200 }
const space = [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5]
const rem = (n) => (n === 0 ? '0' : `${n}rem`)
const esc = (c) => c.replace(/:/g, '\:').replace(/\./g, '\.')

/** rules per breakpoint: { bpName: string[] } */
const out = Object.fromEntries(Object.keys(bp).map((k) => [k, []]))
const add = (cls, decl) => {
  for (const b of Object.keys(bp)) {
    const name = b ? `${b}:${cls}` : cls
    out[b].push(`.${esc(name)}{${decl}}`)
  }
}

// display
for (const d of ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid-display', 'revert']) {
  const value = d === 'grid-display' ? 'grid' : d
  const cls = d === 'grid-display' ? 'd-grid' : d
  add(cls, `display:${value}`)
}
add('hidden', 'display:none')

// flex
add('flex-row', 'flex-direction:row')
add('flex-column', 'flex-direction:column')
add('flex-row-reverse', 'flex-direction:row-reverse')
add('flex-column-reverse', 'flex-direction:column-reverse')
add('flex-wrap', 'flex-wrap:wrap')
add('flex-nowrap', 'flex-wrap:nowrap')
add('flex-1', 'flex:1 1 0%')
add('flex-grow-1', 'flex-grow:1')
add('flex-shrink-0', 'flex-shrink:0')
const align = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' }
for (const [k, v] of Object.entries(align)) {
  add(`align-items-${k}`, `align-items:${v}`)
  add(`align-self-${k}`, `align-self:${v}`)
}
const justify = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' }
for (const [k, v] of Object.entries(justify)) add(`justify-content-${k}`, `justify-content:${v}`)

// spacing
space.forEach((v, i) => {
  const r = rem(v)
  add(`m-${i}`, `margin:${r}`)
  add(`p-${i}`, `padding:${r}`)
  add(`mt-${i}`, `margin-top:${r}`)
  add(`mb-${i}`, `margin-bottom:${r}`)
  add(`ml-${i}`, `margin-left:${r}`)
  add(`mr-${i}`, `margin-right:${r}`)
  add(`mx-${i}`, `margin-left:${r};margin-right:${r}`)
  add(`my-${i}`, `margin-top:${r};margin-bottom:${r}`)
  add(`pt-${i}`, `padding-top:${r}`)
  add(`pb-${i}`, `padding-bottom:${r}`)
  add(`pl-${i}`, `padding-left:${r}`)
  add(`pr-${i}`, `padding-right:${r}`)
  add(`px-${i}`, `padding-left:${r};padding-right:${r}`)
  add(`py-${i}`, `padding-top:${r};padding-bottom:${r}`)
  add(`gap-${i}`, `gap:${r}`)
})
add('m-auto', 'margin:auto')
add('mx-auto', 'margin-left:auto;margin-right:auto')
add('ml-auto', 'margin-left:auto')
add('mr-auto', 'margin-right:auto')

// sizing
add('w-full', 'width:100%')
add('h-full', 'height:100%')
add('w-auto', 'width:auto')
add('min-h-full', 'min-height:100%')
add('min-w-0', 'min-width:0')
add('h-auto', 'height:auto')
for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) add(`w-${n}`, `width:${((n / 12) * 100).toFixed(4)}%`)

// grid (12 columns)
add('grid', 'display:flex;flex-wrap:wrap')
add('grid-nogutter', 'margin:0')
add('col', 'flex-basis:0;flex-grow:1;max-width:100%;padding:.5rem')
for (let n = 1; n <= 12; n++) {
  add(`col-${n}`, `flex:0 0 auto;width:${((n / 12) * 100).toFixed(4)}%;padding:.5rem`)
  add(`col-offset-${n}`, `margin-left:${((n / 12) * 100).toFixed(4)}%`)
}
add('col-offset-0', 'margin-left:0')

// text
add('text-left', 'text-align:left')
add('text-center', 'text-align:center')
add('text-right', 'text-align:right')
add('text-xs', 'font-size:.75rem')
add('text-sm', 'font-size:.875rem')
add('text-base', 'font-size:1rem')
add('text-lg', 'font-size:1.125rem')
add('text-xl', 'font-size:1.25rem')
add('text-2xl', 'font-size:1.5rem')
add('text-3xl', 'font-size:1.875rem')
add('text-4xl', 'font-size:2.25rem')
add('font-normal', 'font-weight:400')
add('font-medium', 'font-weight:500')
add('font-semibold', 'font-weight:600')
add('font-bold', 'font-weight:700')
add('line-height-2', 'line-height:1.25')
add('line-height-3', 'line-height:1.5')
add('line-height-4', 'line-height:1.75')
add('white-space-nowrap', 'white-space:nowrap')
add('nowrap', 'white-space:nowrap')
add('uppercase', 'text-transform:uppercase')

// colour tokens (defined in tokens.css)
add('text-color', 'color:var(--ink)')
add('text-primary', 'color:var(--gold-700)')
add('text-secondary', 'color:var(--muted)')
add('text-900', 'color:var(--ink)')
add('text-800', 'color:var(--ink-soft)')
add('text-700', 'color:var(--ink-soft)')
add('text-600', 'color:var(--muted)')
add('text-500', 'color:var(--muted)')
add('text-300', 'color:var(--on-dark-muted)')
add('text-white', 'color:#fff')
add('surface-section', 'background:var(--surface)')
add('surface-card', 'background:var(--surface)')
add('surface-overlay', 'background:var(--surface)')
add('surface-ground', 'background:var(--bg)')
add('surface-border', 'border-color:var(--line)')

// borders, radius, shadow
add('border-0', 'border:0')
add('border-1', 'border:1px solid var(--line)')
add('border-solid', 'border-style:solid')
add('border-round', 'border-radius:var(--radius)')
add('border-circle', 'border-radius:50%')
add('shadow-1', 'box-shadow:var(--shadow-sm)')
add('shadow-2', 'box-shadow:var(--shadow-md)')
add('shadow-3', 'box-shadow:var(--shadow-lg)')

// position & misc
add('relative', 'position:relative')
add('absolute', 'position:absolute')
add('fixed', 'position:fixed')
add('overflow-hidden', 'overflow:hidden')
add('overflow-auto', 'overflow:auto')
add('outline-none', 'outline:none')
add('appearance-none', 'appearance:none')
add('cursor-pointer', 'cursor:pointer')
add('z-1', 'z-index:1')
add('z-2', 'z-index:2')

let css = '/* Generated by scripts/generate-utilities.mjs - do not edit by hand. */\n'
css += out[''].join('\n') + '\n'
for (const [name, min] of Object.entries(bp)) {
  if (!name) continue
  css += `@media (min-width:${min}px){\n${out[name].join('\n')}\n}\n`
}
writeFileSync(new URL('../src/assets/utilities.css', import.meta.url), css)
console.log('utilities.css', (css.length / 1024).toFixed(1), 'kB')
