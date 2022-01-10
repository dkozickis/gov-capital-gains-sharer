import type { NextApiRequest, NextApiResponse } from 'next';
import { eTradeToEds } from '@i-just-got-paid/etrade-to-eds';
import nc from 'next-connect';
import multer from 'multer';
import { Readable } from 'stream';

const upload = multer({
  limits: {
    fileSize: 1048576,
  },
});

const handler = nc<NextApiRequest, NextApiResponse>();

handler.use(upload.single('file'));

handler.post<{ file: Express.Multer.File }>(async (req, res) => {
  const result = await eTradeToEds(Readable.from(req.file.buffer));

  res.status(200).json(result);
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
