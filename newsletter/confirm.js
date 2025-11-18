import { getDb } from '../_lib/mongo';

export default async function handler(req, res) {
  const { token } = req.query || {};
  if (!token) return res.status(400).send('token faltando');

  const { db } = await getDb();
  const coll = db.collection('newsletter');

  const r = await coll.findOneAndUpdate(
    { token },
    { $set: { status: 'confirmed', confirmedAt: new Date() }, $unset: { token: "" } },
    { returnDocument: 'after' }
  );
  if (!r.value) return res.status(400).send('token inválido');

  res.writeHead(302, { Location: '/inscricao-confirmada.html' });
  res.end();
}
