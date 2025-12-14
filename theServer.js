/*
This command creates a 4096-bit private key (domain.key) and a CSR (domain.csr) from scratch:
> openssl req -newkey rsa:4096 -nodes -keyout domain.key -out domain.csr

This command creates a new CSR (domain.csr) based on an existing private key (domain.key):
> openssl req -key domain.key -new -out domain.csr

This command creates a new CSR (domain.csr) based on an existing certificate (domain.crt) and private key (domain.key):
> openssl x509 -in domain.crt -signkey domain.key -x509 toreq -out domain.csr

This command creates a 2048-bit private key (domain.key) and a self-signed certificate (domain.crt) from scratch:
> openssl req -newkey rsa:2048 -nodes -keyout domain.key -x509 -days 365 -out domain.crt

This command creates a self-signed certificate (domain.crt) from an existing private key (domain.key):
> openssl req -key domain.key -new -x509 -days 365 -out domain.crt
*/


'use strict'

const express = require('express');
const https = require('https');
const fs = require('fs');
const { Worker } = require("worker_threads");

const app = express();
let secPort = 443;

let locallMoment = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split("T")[0];
let logger = fs.createWriteStream(`./logs/log_${locallMoment}.log`, { flags: 'a' /* 'a' for appending  */});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('htmlroot'));
app.use(express.json());
app.setMaxListeners(0); //no limits

let options = {
    key: fs.readFileSync('./certs/auth_flexipay_demo.key'),
    cert: fs.readFileSync('./certs/auth_flexipay_demo.crt'),
    //ca: fs.readFileSync('./certs/buybytoken_com.ca-bundle')
};

const credentials = fs.readFileSync('./certs/credentials');
const credentials_array = credentials.toString().split('\n');
console.log(credentials_array);

https.createServer(options, app).listen( secPort, () => {console.log(`Server listening on port ${secPort} `)}  );

//-----------------------------------------------------------------------------------------
// Payment and return functions
//-----------------------------------------------------------------------------------------

app.get("/", async (req, res) => {
  //const { items, profile_id } = req.body;
  let utc = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  let argIpAddss = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.status(200).send('UTC: ' + utc + ' / From IP: ' + argIpAddss );
});

app.post("/auth_flexi_map_and_pay", async (req, res) => {

    let retBuffer = '';
    // req.body is in the form: {"payment_id":"pay_CFL22OTSM43rKwj2Bpja","amount":6975,"payment_method_data":{"card":{"card_cvc":"123",
    // "card_number":"4242424242424242","card_exp_month":"11","card_exp_year":"28","card_holder_name":"RaquelWelch"}},
    // "billing":{"address":{"city":"Astoria","first_name":"Raquel","last_name":"Welch","line1":"15-38 Steinway St","line2":"Apt 25","state":"NY","zip":"10019"},
    // "email":"sample_email@test-domain.com"}} 

    const worker_params = {
        "credentials": {
            "apiKeyComercio": credentials_array[0],
            "usuarioComercio": credentials_array[1],
            "contrasenaComercio": credentials_array[2],
            "terminalComercio": credentials_array[3],
            "idCuenta": credentials_array[4]
        },
        "request_body": req.body
    }

    let prom = createWorker(worker_params, '', "./worker_payment");
    prom.then( function (retResults){
        retBuffer = retResults; 
        let retObj = JSON.parse(retResults);
        if (retObj.code !== "error"){
            retBuffer = JSON.stringify(retObj);
        }   
        //console.log(`Returning from login retResults / retBuffer: ` + retBuffer + ' / ' + JSON.stringify(retObj) );
    }).catch( function(error){
        retBuffer = `${error}`; // error is already in JSON format and contains all info
        //console.log(`${error}. Type of error object is: ${typeof error}`)
    }).finally( function () { 
        //console.log(`Returning from payment: ` + retBuffer );
        res.status(200).send( retBuffer );
    });

});


//---------------------------------------------------------------------
// Utility functions, create worker threads, logging, etc
//---------------------------------------------------------------------


// The most important piece: the Worker
function createWorker(argReqBody, argReqFiles = '', argWorkerFile) {
    return new Promise(function (resolve, reject) {
        let allData = '';
        const worker = new Worker(argWorkerFile, {
            workerData: {reqBody:argReqBody, reqFiles:argReqFiles },
        });
        worker.on("message", (data) => {
            //resolve(data);
            allData += data;
        });
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`);
        });
        worker.on('exit', (code) => {
            if (code !== 0){ reject(new Error(`Worker stopped with exit code ${code}`)); }
            else{ resolve(allData); }
        });
    });
}




// Log requests
function logIt(argStrToLog){
    let locallMoment = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    if (logger.path !== `./logs/log_${locallMoment}.log`){
        logger.end();
        logger = fs.createWriteStream(`./logs/log_${locallMoment}.log`, { flags: 'a' /* 'a' for appending  */});
    }
    logger.write((new Date()).toUTCString() + ' - ' + argStrToLog + '\n'); // append string to your file
}


