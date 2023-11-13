import getAsaFromCache from './getAsaFromCache'
interface IInput {
  value: number
  assetId: number
}

const formatAssetPrice = (input: IInput): string => {
  const asa = getAsaFromCache({ assetId: input.assetId })
  if (asa) {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'decimal',
      maximumSignificantDigits: asa.params.decimals,
      minimumSignificantDigits: asa.params.decimals,
      minimumFractionDigits: asa.params.decimals,
      maximumFractionDigits: asa.params.decimals
    })
    return formatter.format(input.value / 10 ** asa.params.decimals) + ' ' + asa.params.name
  }
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    maximumSignificantDigits: 6,
    minimumSignificantDigits: 6,
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  })
  return formatter.format(input.value)
}
export default formatAssetPrice
