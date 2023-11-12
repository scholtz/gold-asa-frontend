export default interface IProfile {
  legalEntity: string
  firstName: string
  lastName: string
  company: string
  taxId: string
  deliveryAddress: {
    street: string
    city: string
    zip: string
    country: string
  }
  residentialAddress: {
    street: string
    city: string
    zip: string
    country: string
  }
  companyAddress: {
    street: string
    city: string
    zip: string
    country: string
  }
}
