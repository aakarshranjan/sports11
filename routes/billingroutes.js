const paypal = require('paypal-rest-sdk');

module.exports=(app)=>{
    app.post('/api/paypal', (req,res) => {
        console.log('test 1');
        const create_payment_json = {
            "intent" : "sale",
            "payer" :{
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "something",
                        "sku": "item",
                        "price": "1.00",
                        "currency": "INR",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "INR",
                    "total": "1.00"
                },
                "description": "This is payment description"
            }]
        };
        console.log('test 2');

        paypal.payment.create(create_payment_json, function(error, payment){
            console.log('test 3');
            if(error){
                throw error;
            } else{
                for(let i=0;i<payment.links.length;i++){
                    if(payment.links[i].rel === 'return_url'){
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
        console.log('test 7');
    });
    app.get('/success', (req,res) => {
        console.log('test 4');
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "INR",
                    "total": "5.00"
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
            if(error){
                console.log(error.response);
                throw error;
            } else{
                console.log("Get payment response");
                console.log(JSON.stringify(payment));
                res.send('success');
            }
        });
    });

    app.get('/cancel', (req,res)=>{
        res.send('Cancelled');
    })
}