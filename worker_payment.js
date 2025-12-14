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

        payLoad.anoTarjetaComercio = "2026"
        payLoad.mesTarjetaComercio = "5"
        payLoad.numeroTarjetaComercio = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardNumber
        payLoad.idFranquiciaComercio = "9|01|Visa"
        payLoad.cvv2 = argReqBody.createTransactionRequest.transactionRequest.payment.creditCard.cardCode
        payLoad.ciudadPagoComercio = "Cali Colombia"
        payLoad.codreferenciaPagoComercio = "c2b95692"
        payLoad.compradorPagoComercio = "Jane Jones"
        payLoad.descripcionPagoComercio = "Buy BTC 0.0003213"
        payLoad.emailCompraComercio = "mailto:donnak.bates@sbcglobal.net"
        payLoad.idCuenta = workerParams.credentials.idCuenta
        payLoad.idMedioPagoComercio = "353"
        payLoad.idTipoCuenta = "345|C|Credito"
        payLoad.idTipoDocumentoComercio = "521"
        payLoad.idTipoTransaccionComercio = "339|CREDIBANCO|CREDIBANCO"
        payLoad.ivaPagoComercio = "0"
        payLoad.mcc = "mcc de validacion que se llenara con datos de visa"
        payLoad.montoPagoComercio = "92.00"
        payLoad.numcuotasPagoComercio = "0"
        payLoad.numeroDocumentoCompraComercio = "9780"
        payLoad.numeroFacturaComercio = "9780"
        payLoad.telefonoCompraComercio = "8178255325"
        payLoad.valorTotalComercio = "92.00"

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


