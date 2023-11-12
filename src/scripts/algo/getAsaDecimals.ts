import getAsaFromCache from './getAsaFromCache'

interface IInput {
  assetId: number
}
const getAsaDecimals = (input: IInput): number => {
  const { assetId } = input
  const asa = getAsaFromCache({ assetId })
  return asa?.params.decimals ?? 0
}
export default getAsaDecimals
