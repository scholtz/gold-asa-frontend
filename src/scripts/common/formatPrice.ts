interface IInput {
  value: number
  decimals: number
}

const formatPrice = (input: IInput): string => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    maximumSignificantDigits: input.decimals,
    minimumSignificantDigits: input.decimals,
    minimumFractionDigits: input.decimals,
    maximumFractionDigits: input.decimals
  })
  return formatter.format(input.value)
}
export default formatPrice
