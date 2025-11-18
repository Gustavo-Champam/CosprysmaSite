import { getDb } from '../_lib/mongo';

export default async function handler(req, res) {
  const { db } = await getDb();
  const coll = db.collection('eventos');

  if (req.method === 'GET') {
    const { city, from, to } = req.query || {};
    const q = {};
    if (city) q.city = { $regex: city, $options: 'i' };
    if (from || to) {
      q.startsAt = {};
      if (from) q.startsAt.$gte = new Date(from);
      if (to)   q.startsAt.$lte = new Date(to);
    }
    const items = await coll.find(q).sort({ startsAt: 1 }).toArray();
    return res.json(items);
  }

  if (req.method === 'POST') {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok:false, error:'unauthorized' });
    }
    const { title, city, startsAt, endsAt, venue, url, status = 'published' } = req.body || {};
    if (!title || !startsAt) return res.status(400).json({ ok:false, error:'title/startsAt obrigatórios' });
    const doc = {
      title, city: city || null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      venue: venue || null,
      url: url || null,
      status,
      createdAt: new Date()
    };
    const r = await coll.insertOne(doc);
    return res.json({ ok:true, id: r.insertedId, ...doc });
  }

  return res.status(405).json({ ok:false, error:'Method Not Allowed' });
}
