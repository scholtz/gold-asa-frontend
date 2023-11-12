import { readFileSync, writeFileSync } from 'fs'
import publishFileBuffer from './ipfs/publishFileBuffer'
import CryptoJS from 'crypto-js'
import sharp from 'sharp'

const createArc3Files = async (network: string, sn: number) => {
  const properties = {
    name: 'Gold coin 1/10 oz, sn ' + sn,
    slugName: 'gold-coin-1-10-oz-sn-' + sn,
    network: network,
    form: 'coin',
    serialNumber: sn,
    issueDate: '2023-04-01',
    mintage: 200,
    diameter: 16,
    diameterUnit: 'mm',
    weight: 3.11,
    fitness: 999.9,
    goldWeight: 3.109689,
    weightUnit: 'g',
    author: 'Asamat Baltaev, DiS.',
    story:
      "The best-known story of how the exotic lion became the symbol of the Czech country is the tale of Bruncvík - a mythical prince who travelled to Africa where he helped the king of beasts in his battle with the dragon. However, the old chroniclers offer more plausible explanation. According to them, Emperor Frederick I Barbarossa rewarded Prince Vladislaus II with a royal crown and a new heraldic animal, which replaced the current eagle in 1158. The lion represented the virtues of chivalry, strength and courage that Vladislaus had shown during the conquest of the city of Milan in the Emperor's service. And how did the heraldic beast get its second tail? Again, heroism played a role. King Ottokar I of Bohemia helped Emperor Otto IV in his fight against the Saxon in 1204, and in return the Bohemian lion was given a second tail, which distinguished it from the beasts of other nations and gave it a unique prestige. Medieval writers, however, liked to colour their narratives, therefore, they are not a reliable source of information. However, one thing is certain - the first truly documented Bohemian lion was a symbol of the Přemyslid dynasty and appears on the equestrian seal of Vladislaus Henry from 1203. The lion was elevated to the emblem of the whole country by Ottokar II of Bohemia, the Iron and Gold King.",
    pictures: [{ url: 'sample-front.jpg' }, { url: 'sample-back.jpg' }]
  }

  var pictures = []
  for (const picture of properties.pictures) {
    const file = readFileSync(`./img/${picture.url}`)
    const ipfs = await publishFileBuffer(file)

    const integrity = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(file.toString('base64'))).toString(
      CryptoJS.enc.Base64
    )
    let mime = ''
    if (picture.url.endsWith('.jpg')) {
      mime = 'image/jpeg'
    }
    if (!mime) throw Error('Unknown mime type for image ' + picture.url)

    var thumbnail = await sharp(file).resize(200, 200).toBuffer()

    const thumbnailIpfs = await publishFileBuffer(thumbnail)
    const thumbnailIntegrity = CryptoJS.SHA256(
      CryptoJS.enc.Base64.parse(thumbnail.toString('base64'))
    ).toString(CryptoJS.enc.Base64)

    pictures.push({
      url: `ipfs://${ipfs}`,
      integrity: `sha256-${integrity}`,
      thumbnail: `ipfs://${thumbnailIpfs}`,
      thumbnailIntegrity: `sha256-${thumbnailIntegrity}`,
      mimetype: mime
    })
  }
  properties.pictures = pictures

  const template = {
    name: properties.name,
    description: `This is NFT representation of the real world gold coin. Owner of this NFT has right to request the delivery if it was not requested before. Serial number of this coin is ${sn}.`,
    image: pictures[0].url,
    image_integrity: pictures[0].integrity,
    image_mimetype: pictures[0].mimetype,
    external_url: `https://${network}.asa.gold/coin/${properties.slugName}`,
    properties
  }

  const jsonFile = JSON.stringify(template)
  writeFileSync(`./arc0003/${properties.slugName}.json`, jsonFile, {
    flag: 'w'
  })
  console.log(`./arc0003/${properties.slugName}.json done`)

  const fileJ = readFileSync(`./arc0003/${properties.slugName}.json`)
  const ipfsJ = await publishFileBuffer(fileJ)
  const integrityJ = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(fileJ.toString('base64'))).toString(
    CryptoJS.enc.Base64
  )
  writeFileSync(`./arc0003/${properties.slugName}.ipfs`, ipfsJ, {
    flag: 'w'
  })
  writeFileSync(`./arc0003/${properties.slugName}.integrity`, integrityJ, {
    flag: 'w'
  })
}
export default createArc3Files
