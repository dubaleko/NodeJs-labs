const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const {ServerDH, ClientDH} = require('./DifHell');
const {ServerSign, ClientVerify} = require('./ESignature');

const app = express();
app.use(bodyParser.json());
let serverDH;

app.get('/', (req, res) => {
    console.log('/');
    serverDH = new ServerDH(1024, 3);
    const serverContext = serverDH.getContext();
    res.json(serverContext);
});

app.get('/resourse', (req, res) => {
    console.log('/resourse');
    let context = req.body;
    if(serverDH && context){
        const serverSecret = serverDH.getSecret(context);

        const cipher = crypto.createCipher('aes256', serverSecret.toString());
        const text = fs.readFileSync(`${__dirname}/file.txt`, { encoding: 'utf8'});
        console.log('File: ', text);
        const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

        res.json({txt: encrypted});
    }
    else {
        res.status(409).json({ msg: 'Deffi-Hellman error' });
    }
});

app.get('/signature', (req, res) => {
    console.log('/signature');
    try{
        const text = fs.createReadStream(`${__dirname}/file.txt`);

        const ss = new ServerSign();
        ss.getSignContext(text, (signContext) => {
            res.json({
                file: text,
                sign: signContext});
        });
    }
    catch(e){
        console.log('Signature error: ', e);
        res.status(409).json({ msg: 'Signature error' });
    }
});

app.listen(5000);
