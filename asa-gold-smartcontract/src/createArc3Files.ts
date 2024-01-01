import { existsSync, readFileSync, writeFileSync } from 'fs'
import publishFileBuffer from './ipfs/publishFileBuffer'
import CryptoJS from 'crypto-js'
import sharp from 'sharp'

const pad = (num: number, size: number): string => {
  const s = '000000000' + num
  return s.substring(s.length - size)
}

const createArc3Files = async (network: string, sn: number) => {
  const properties1 = {
    name: 'Gold coin 1 oz, SN ' + sn,
    slugName: 'gold-coin-1-oz-sn-' + sn,
    network: network,
    form: 'coin',
    serialNumber: sn,
    issueDate: '2023-04-01',
    inReservesSince: '2023-11-08',
    reservesNumismaticValue: 40.016179,
    mintage: 600,
    diameter: 37,
    diameterUnit: 'mm',
    weight: 31.1,
    fitness: 999.9,
    goldWeight: 31.09689,
    weightUnit: 'g',
    author: 'MgA. Martin Dašek',
    quality: 'proof',
    story:
      "The Slovaks have waited patiently for the opportunity for self-determination - like a bird of prey circling in the sky above the majestic Tatra Mountains, looking for its prey. It is no wonder that Slovak poets and revivalists of the 19th century regarded the eagle as a soulmate and that Ľudovít Štúr himself named the cultural supplement of the Slovak National Newspaper 'Orol tatránski'. Despite the unwilling attempts of the sovereign rulers, the Slovaks preserved their culture, language and character until they finally succeeded in winning their independence. The symbol of all they achieved was once again the eagle, which has always represented strength, victory, freedom and nobility, but also resurrection and new life. The bird of prey, which represents the Christian kingdom of heaven, also refers to Slovak religious tradition.",
    pictures: [
      { url: `sn-${pad(sn, 4)}-o-front.png` },
      { url: `sn-${pad(sn, 4)}-o-back.png` },
      { url: `sn-${pad(sn, 4)}-p-front.png` },
      { url: `sn-${pad(sn, 4)}-p-back.png` }
    ]
  }
  const properties2 = {
    name: 'Gold coin 1 oz, SN ' + sn,
    slugName: 'gold-coin-1-oz-sn-' + sn,
    network: network,
    form: 'coin',
    serialNumber: sn,
    issueDate: '2022-01-01',
    inReservesSince: '2023-11-08',
    reservesNumismaticValue: 33.746752,
    diameter: 37,
    diameterUnit: 'mm',
    weight: 31.1,
    fitness: 999.9,
    goldWeight: 31.09689,
    weightUnit: 'g',
    author: 'MgA. Martin Dašek',
    quality: 'stand',
    story:
      '“Wiener Philharmoniker“ is one of the most popular investment coins. Since 1989 it has been struck in the Vienna Mint in four sizes and weights (1 ounce, 1/2, 1/4 and 1/10 of an ounce). And the motif of the Vienna Philharmonic Orchestra which is considered to be one of the best music ensembles worldwide, was not chosen by coincidence. The coin is minted of the purest 24 carat gold. In 2002, the original 2000, 1000, 500 and 250 shilling coins were replaced with 100, 50, 25 and 10 euro coins. The obverse of the coins features the organ in the Golden Hall of the Musikverein in Vienna, the renowned seat of  the Vienna Philharmonic Orchestra. The reverse is decorated with various musical instruments.',
    pictures: [{ url: `sn-${pad(sn, 4)}-p-front.png` }, { url: `sn-${pad(sn, 4)}-p-back.png` }]
  }
  const properties3_12 = {
    name: 'Gold coin 1/10 oz, SN ' + sn,
    slugName: 'gold-coin-1-10-oz-sn-' + sn,
    network: network,
    form: 'coin',
    serialNumber: sn,
    issueDate: '2023-04-01',
    inReservesSince: '2023-11-08',
    reservesNumismaticValue: 3.964466,
    mintage: 200,
    diameter: 16,
    diameterUnit: 'mm',
    weight: 3.11,
    fitness: 999.9,
    goldWeight: 3.109689,
    weightUnit: 'g',
    author: 'Asamat Baltaev, DiS.',
    quality: 'stand',
    story:
      "The best-known story of how the exotic lion became the symbol of the Czech country is the tale of Bruncvík - a mythical prince who travelled to Africa where he helped the king of beasts in his battle with the dragon. However, the old chroniclers offer more plausible explanation. According to them, Emperor Frederick I Barbarossa rewarded Prince Vladislaus II with a royal crown and a new heraldic animal, which replaced the current eagle in 1158. The lion represented the virtues of chivalry, strength and courage that Vladislaus had shown during the conquest of the city of Milan in the Emperor's service. And how did the heraldic beast get its second tail? Again, heroism played a role. King Ottokar I of Bohemia helped Emperor Otto IV in his fight against the Saxon in 1204, and in return the Bohemian lion was given a second tail, which distinguished it from the beasts of other nations and gave it a unique prestige. Medieval writers, however, liked to colour their narratives, therefore, they are not a reliable source of information. However, one thing is certain - the first truly documented Bohemian lion was a symbol of the Přemyslid dynasty and appears on the equestrian seal of Vladislaus Henry from 1203. The lion was elevated to the emblem of the whole country by Ottokar II of Bohemia, the Iron and Gold King.",
    pictures: [
      { url: `sn-${pad(sn, 4)}-o-front.png` },
      { url: `sn-${pad(sn, 4)}-o-back.png` },
      { url: `sn-${pad(sn, 4)}-p-front.png` },
      { url: `sn-${pad(sn, 4)}-p-back.png` }
    ]
  }
  const properties13 = {
    name: 'Gold coin 1 oz, SN ' + sn,
    slugName: 'gold-coin-1-oz-sn-' + sn,
    network: network,
    form: 'coin',
    serialNumber: sn,
    issueDate: '2023-01-01',
    inReservesSince: '2024-01-01',
    reservesNumismaticValue: 32.651735,
    diameter: 37,
    diameterUnit: 'mm',
    weight: 31.1,
    fitness: 999.9,
    goldWeight: 31.09689,
    weightUnit: 'g',
    quality: 'stand',
    story:
      '“Wiener Philharmoniker“ is one of the most popular investment coins. Since 1989 it has been struck in the Vienna Mint in four sizes and weights (1 ounce, 1/2, 1/4 and 1/10 of an ounce). And the motif of the Vienna Philharmonic Orchestra which is considered to be one of the best music ensembles worldwide, was not chosen by coincidence. The coin is minted of the purest 24 carat gold. In 2002, the original 2000, 1000, 500 and 250 shilling coins were replaced with 100, 50, 25 and 10 euro coins. The obverse of the coins features the organ in the Golden Hall of the Musikverein in Vienna, the renowned seat of  the Vienna Philharmonic Orchestra. The reverse is decorated with various musical instruments. Gold coin with serial number XIII is special as it is the first addition to the ASA.gold reserves since the project launch. The gold coin NFT has been minted on January 1st 2024.',
    pictures: [{ url: `sn-${pad(sn, 4)}-p-front.png` }, { url: `sn-${pad(sn, 4)}-p-back.png` }]
  }
  let properties: any = properties1
  if (sn == 2) properties = properties2
  if (sn >= 3) properties = properties3_12
  if (sn == 13) properties = properties13
  var pictures = []
  for (const picture of properties.pictures) {
    const file = readFileSync(`./img/${picture.url}`)
    const ipfs = await publishFileBuffer(file)

    const integrity = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(file.toString('base64'))).toString(
      CryptoJS.enc.Base64
    )
    let mime = ''
    let ext = ''
    if (picture.url.endsWith('.jpg')) {
      mime = 'image/jpeg'
      ext = '.jpg'
    }
    if (picture.url.endsWith('.png')) {
      mime = 'image/png'
      ext = '.png'
    }
    if (!mime) throw Error('Unknown mime type for image ' + picture.url)
    let thumbnail: Buffer | undefined = undefined
    const thumbFile = `./img/${picture.url}.small${ext}`
    try {
      if (existsSync(thumbFile)) {
        thumbnail = readFileSync(thumbFile)
      }
    } catch (e) {
      console.log('thumbnail does not exists yet', e)
    }
    if (!thumbnail?.length) {
      thumbnail = await sharp(file).resize(200, 200).toBuffer()
      writeFileSync(thumbFile, thumbnail, {
        flag: 'w'
      })
    }

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
  writeFileSync(`./arc0003/${properties.network}/${properties.slugName}.json`, jsonFile, {
    flag: 'w'
  })
  console.log(`./arc0003/${properties.network}/${properties.slugName}.json done`)

  const fileJ = readFileSync(`./arc0003/${properties.network}/${properties.slugName}.json`)
  const ipfsJ = await publishFileBuffer(fileJ)
  const integrityJ = CryptoJS.SHA256(CryptoJS.enc.Base64.parse(fileJ.toString('base64'))).toString(
    CryptoJS.enc.Base64
  )
  writeFileSync(`./arc0003/${properties.network}/${properties.slugName}.ipfs`, ipfsJ, {
    flag: 'w'
  })
  writeFileSync(`./arc0003/${properties.network}/${properties.slugName}.integrity`, integrityJ, {
    flag: 'w'
  })
}
export default createArc3Files
