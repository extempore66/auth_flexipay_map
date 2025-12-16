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

async function do_trx(workerParams) {
    

    let retObj = workerParams;
    console.log(`workerParams inside the worker_payment do_trx after try: ${JSON.stringify(workerParams)}`);
    
    try{

        const argReqBody = workerParams.request_body
        let payLoad = {}
        // payLoad.amount = argReqBody.createTransactionRequest.transactionRequest.amount
        // payLoad.creditCard_cardNumber = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardNumber
        // payLoad.creditCard_expirationDate = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.expirationDate
        // payLoad.creditCard_cardCode = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardCode
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

        const expiration_parts = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.expirationDate.split('-');
        const expiration_month = expiration_parts[1];
        const expiration_year = expiration_parts[0];

        payLoad.anoTarjetaComercio = expiration_year
        payLoad.mesTarjetaComercio = expiration_month
        payLoad.numeroTarjetaComercio = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardNumber
        if (argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardNumber[0] != '4'){
            logIt('Card type is not Visa')
        }
        payLoad.idFranquiciaComercio = "9"
        payLoad.cvv2 = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardCode
        payLoad.idCuenta = workerParams.credentials.idCuenta
        payLoad.idTipoCuenta = "345|C|Credito"
        payLoad.idTipoDocumentoComercio = "521"
        payLoad.idTipoTransaccionComercio = "339"
        payLoad.ivaPagoComercio = "0"
        payLoad.montoPagoComercio = argReqBody.createTransactionRequest.transactionRequest.amount

        const response = await fetch(`https://tran-dev.flexipay.com.co/api/transaccion/comercio-transaccion-comercio`, {
            method: "POST",
            body: JSON.stringify(payLoad),
            headers: {
            "Content-Type": "application/json",
            "apiKeyComercio": workerParams.credentials.apiKeyComercio,
            "usuarioComercio": workerParams.credentials.usuarioComercio,
            "contrasenaComercio": workerParams.credentials.contrasenaComercio,
            "terminalComercio": workerParams.credentials.terminalComercio
            }
        });
        const data = await response.json();

        //const data = payLoad

        const utcTime = Date.now() //in milliseconds
        
        retObj = data
        
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

console.log(JSON.stringify(workerData))

do_trx(workerData.reqBody);


