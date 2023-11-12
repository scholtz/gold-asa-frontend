import getAsaFromCache from './getAsaFromCache'
interface IInput {
  value: number
  assetId: number
}

const formatAssetPrice = (input: IInput): string => {
  const asa = getAsaFromCache({ assetId: input.assetId })
  if (asa) {
    const formatter = new Intl.NumberFormat(undefined, {
      maximumSignificantDigits: asa.params.decimals,
      minimumSignificantDigits: asa.params.decimals
    })
    return formatter.format(input.value / 10 ** asa.params.decimals) + ' ' + asa.params.name
  }
  const formatter = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 6 })
  return formatter.format(input.value)
}
export default formatAssetPrice
