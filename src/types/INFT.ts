export default interface INFT {
  name: string
  description: string
  external_url: string
  image_integrity: string
  image_mimetype: string
  properties: {
    name: string
    serialNumber: number
    network: string
    slugName: string
    author?: string
    diameter?: number
    diameterUnit?: string
    fitness: number
    form: 'coin' | 'ignot'
    weight: number
    goldWeight: number
    weightUnit: string
    issueDate?: Date
    inReservesSince?: Date
    reservesNumismaticValue?: number
    mintage?: number
    story?: string
    pictures: [
      {
        thumbnail: string
        thumbnailIntegrity: string
        url: string
        integrity: string
        mimetype: string
      }
    ]
  }
}
