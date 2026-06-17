import 'dotenv/config'
import twilio from 'twilio'

const sid = process.env.TWILIO_ACCOUNT_SID
const token = process.env.TWILIO_AUTH_TOKEN

if (!sid || !token) {
    console.error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in env')
    process.exit(1)
}

const client = twilio(sid, token)

async function main() {
    try {
        const account = await client.api.accounts(sid).fetch()
        console.log('Authenticated to Twilio. Account:')
        console.log({ sid: account.sid, friendlyName: account.friendlyName, status: account.status })
        process.exit(0)
    } catch (err) {
        console.error('Twilio auth failed')
        console.error(err && err.message ? err.message : String(err))
        if (err && typeof err.code !== 'undefined') console.error('twilio error code:', err.code)
        process.exit(2)
    }
}

void main()
