const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
      }
}

async function consume() {
    try {
        const rabbit = await RabbitMQService.getInstance()
        await rabbit.consume('report', async (msg) => {
            try {
                const saleData = JSON.parse(msg.content)

                if (!saleData.products || !Array.isArray(saleData.products)) {
                    console.log("Venda Reprovada")
                    return
                }

                await updateReport(saleData.products)
                console.log("✔ VENDA PROCESSADA COM SUCESSO")
                await printReport()

            } catch (error) {
                console.log(`X ERROR TO PROCESS: ${error.response}`)
            }
        })
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}

consume()
