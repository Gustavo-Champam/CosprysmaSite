import crypto from 'crypto';
import { getDb } from '../_lib/mongo';
import { getTransport } from '../_lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method Not Allowed' });

  const { email } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ ok:false, error:'email inválido' });

  const { db } = await getDb();
  const coll = db.collection('newsletter');
  await coll.createIndex({ email: 1 }, { unique: true });

  const token = crypto.randomBytes(20).toString('hex');
  const now = new Date();

  await coll.updateOne(
    { email },
    { $setOnInsert: { createdAt: now }, $set: { status: 'pending', token } },
    { upsert: true }
  );

  const confirmUrl = `${process.env.BASE_URL}/api/newsletter/confirm?token=${token}`;
  const t = getTransport();
  await t.sendMail({
    from: `Cosprysma <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Confirme sua inscrição',
    html: `<p>Confirme sua inscrição clicando no link:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`
  });

  res.json({ ok:true });
}
