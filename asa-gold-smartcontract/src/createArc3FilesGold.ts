import { readFileSync, writeFileSync } from 'fs'
import publishFileBuffer from './ipfs/publishFileBuffer'
import CryptoJS from 'crypto-js'

const createArc3FilesGold = async () => {
  var picture = 'logo.png'
  const file = readFileSync(`./img/${picture}`)
  const ipfs = await publishFileBuffer(file)

  const integrity = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(file.toString('base64'))).toString(
    CryptoJS.enc.Base64
  )
  let mime = ''
  if (picture.endsWith('.jpg')) {
    mime = 'image/jpeg'
  }
  if (picture.endsWith('.png')) {
    mime = 'image/png'
  }
  if (!mime) throw Error('Unknown mime type for image ' + picture)

  const pic = {
    url: `ipfs://${ipfs}`,
    integrity: `sha256-${integrity}`,
    mimetype: mime
  }

  const template = {
    name: 'Gold',
    description:
      'ASA.Gold is the groundbreaking publicly auditable gold token. Backed by physical gold reserves, our onchain eshop ensures real-time audits accessible to all, guaranteeing the authenticity and value of each token. Invest with confidence in a new era of gold-backed digital assets, where trust and accountability converge seamlessly.',
    image: pic.url,
    image_integrity: pic.integrity,
    image_mimetype: pic.mimetype,
    external_url: `https://www.asa.gold/token/gold`,
    properties: {
      whitepaper: 'https://www.asa.gold/gold.pdf'
    }
  }

  const jsonFile = JSON.stringify(template)
  writeFileSync(`./arc0003/gold.json`, jsonFile, {
    flag: 'w'
  })
  console.log(`./arc0003/gold.json done`)

  const fileJ = readFileSync(`./arc0003/gold.json`)
  const ipfsJ = await publishFileBuffer(fileJ)
  const integrityJ = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(fileJ.toString('base64'))).toString(
    CryptoJS.enc.Base64
  )
  writeFileSync(`./arc0003/gold.ipfs`, ipfsJ, {
    flag: 'w'
  })
  writeFileSync(`./arc0003/gold.integrity`, integrityJ, {
    flag: 'w'
  })
}
export default createArc3FilesGold
