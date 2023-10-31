import axios from 'axios'

const server = 'https://bff.asa.gold'
//const server = 'https://localhost:44394'
const bffAccount = async (arc14header: string) => {
  const ret = await axios.get(`${server}/api/v1/account`, {
    headers: {
      Authorization: arc14header
    }
  })
  return ret.data
}

const bffSendVerificationEmail = async (
  arc14header: string,
  email: string,
  terms: string,
  gdpr: string,
  hasMarketing: boolean
) => {
  const form = new FormData()
  form.append('email', email)
  form.append('terms', terms)
  form.append('gdpr', gdpr)
  form.append('marketingConsent', String(hasMarketing))
  const ret = await axios.postForm(`${server}/api/v1/send-verification-email`, form, {
    headers: {
      Authorization: arc14header
    }
  })
  return ret.data
}
const bffSendVerifyEmailCode = async (arc14header: string, code: string) => {
  const form = new FormData()
  form.append('code', code)
  const ret = await axios.postForm(`${server}/api/v1/verify-code-from-email`, form, {
    headers: {
      Authorization: arc14header
    }
  })
  return ret.data
}

export { bffAccount, bffSendVerificationEmail, bffSendVerifyEmailCode }
