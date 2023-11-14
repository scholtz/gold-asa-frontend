import { readFileSync, writeFileSync } from 'fs'
import publishFileBuffer from './ipfs/publishFileBuffer'
import CryptoJS from 'crypto-js'

const createArc3FilesDao = async () => {
  var picture = 'logoDao480.png'
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
    name: 'ASA.Gold DAO',
    description:
      'DAO governance token for gold-backed project - ASA.Gold. Empower community members to influence project decisions through a transparent, onchain, publicly auditable process. Shape the future of gold-backed digital assets collaboratively, ensuring trust, fairness, and a stake in the success of ASA.Gold. Join the gold revolution now!',
    image: pic.url,
    image_integrity: pic.integrity,
    image_mimetype: pic.mimetype,
    external_url: `https://www.asa.gold/token/dao`,
    properties: {
      whitepaper: 'https://www.asa.gold/dao.pdf'
    }
  }

  const jsonFile = JSON.stringify(template)
  writeFileSync(`./arc0003/dao.json`, jsonFile, {
    flag: 'w'
  })
  console.log(`./arc0003/dao.json done`)

  const fileJ = readFileSync(`./arc0003/dao.json`)
  const ipfsJ = await publishFileBuffer(fileJ)
  const integrityJ = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(fileJ.toString('base64'))).toString(
    CryptoJS.enc.Base64
  )
  writeFileSync(`./arc0003/dao.ipfs`, ipfsJ, {
    flag: 'w'
  })
  writeFileSync(`./arc0003/dao.integrity`, integrityJ, {
    flag: 'w'
  })
}
export default createArc3FilesDao
