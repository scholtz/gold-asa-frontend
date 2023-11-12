import { create, Options } from 'ipfs-http-client'
import getLogger from '../common/getLogger'
import IPFSConfiguration from '../interface/IPFSConfiguration'
import { Buffer } from 'buffer'

const config: IPFSConfiguration = require('../../.config/ipfs.json')
/**
 * Returns ipfs client
 *
 * @returns - IPFS client
 */
const getClient = () => {
  const logger = getLogger()
  try {
    if (!config.clientSecret) {
      logger.error('IPFS not configured')
      return null
    }
    const auth =
      'Basic ' + Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64')
    const clientOptions: Options = {
      host: config.host,
      port: config.port,
      protocol: config.protocol,
      headers: {
        authorization: auth
      }
    }
    return create(clientOptions)
  } catch (e) {
    logger.error(e)
  }
  return null
}
export default getClient
