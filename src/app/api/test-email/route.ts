import { NextResponse } from 'next/server'
import { sendQuoteEmail } from '@/lib/mailer'

export async function GET() {
  try {
    await sendQuoteEmail({
      name: 'Test Customer',
      company: 'Test Co',
      phone: '9999999999',
      email: 'test@example.com',
      message: 'This is a test quote from the website.',
      items: [{ name: 'Lion Air Impact Wrench', size: '1/2"', qty: 2, unit: 'pc' }],
      uploaded: [],
      attachment: null,
    })
    return NextResponse.json({ ok: true, message: 'Email sent successfully' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
