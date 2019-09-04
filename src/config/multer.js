import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),

    //FileName possui a requisição(req), file(o arquivo) e uma função callback(cb)
    filename: (req, file, cb) => {
      //A função crypto é para evitar que haja arquivos com nomes iguais e assim um substitua o outro
      crypto.randomBytes(16, (err, res) =>{
        if(err) return cb(err);

        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  })
};
