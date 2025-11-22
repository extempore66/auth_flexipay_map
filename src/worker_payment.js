'use strict'

const { isMainThread, parentPort, workerData, } = require('worker_threads');
const fs = require('fs');

let locallMoment = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split("T")[0];
let logger = fs.createWriteStream(`./logs/log_${locallMoment}.log`, { flags: 'a' /* 'a' for appending  */});


// Log requests
function logIt(argStrToLog){
    let locallMoment = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    if (logger.path !== `./logs/log_${locallMoment}.log`){
        logger.end();
        logger = fs.createWriteStream(`./logs/log_${locallMoment}.log`, { flags: 'a' /* 'a' for appending  */});
    }
    logger.write((new Date()).toUTCString() + ' - ' + argStrToLog + '\n'); // append string to your file
}

//console.log('inside the worker modified');

async function do_trx(argReqBody) {
    

    let retObj = argReqBody;
    console.log(`argReqBody inside the worker_payment do_trx after try: ${JSON.stringify(argReqBody)}`);
    
    try{

        let payLoad = {}
        // payLoad.amount = argReqBody.amount
        // payLoad.profile_id = "pro_Mn9xY4HTXzfUVZ14Bnjx"
        // payLoad.authentication_type = "no_three_ds"
        // payLoad.currency = "USD"
        // payLoad.confirm = true
        // payLoad.capture_method = "automatic"
        // payLoad.payment_method = "card"
        // payLoad.payment_method_data = argReqBody.payment_method_data
        // payLoad.billing = argReqBody.billing

        // const response = await fetch(`https://sandbox.hyperswitch.io/payments`, {
        //   method: "POST",
        //   body: JSON.stringify(payLoad),
        //   headers: {
        //     "Content-Type": "application/json",
        //     "api-key": "snd_SxIHhm3UbehNaRXk1LTKn6zUOkKq5hBOzZxJMOsH3is0PttY825Gx5tJU13Av1YN"
        //   }
        // });
        // const data = await response.json();

        const utcTime = Date.now() //in milliseconds
        
        //retObj = data
        
    }
    catch(workerErr){
        retObj.code = "error";
        retObj.msg = JSON.stringify(workerErr); 
        logIt(`'error in worker_payment: ${JSON.stringify(workerErr)}`);
    }
    finally {
        console.log(`in worker_payment finally: ` + JSON.stringify(retObj) );
        parentPort.postMessage( JSON.stringify(retObj) );
    }

}

do_trx(workerData.reqBody);


