import { getDb } from '../_lib/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req,res){
  const { id } = req.query;
  if (!ObjectId.isValid(id)) return res.status(400).json({ ok:false, error:'id inválido' });

  const { db } = await getDb();
  const coll = db.collection('eventos');

  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok:false, error:'unauthorized' });
  }

  if (req.method === 'PATCH') {
    const update = {};
    for (const k of ['title','city','startsAt','endsAt','venue','url','status']) {
      if (req.body?.[k] != null) {
        update[k] = /At$/.test(k) ? new Date(req.body[k]) : req.body[k];
      }
    }
    await coll.updateOne({ _id: new ObjectId(id) }, { $set: update });
    return res.json({ ok:true });
  }

  if (req.method === 'DELETE') {
    await coll.deleteOne({ _id: new ObjectId(id) });
    return res.json({ ok:true });
  }

  res.status(405).json({ ok:false, error:'Method Not Allowed' });
}
