const axios = require('axios')

const makeConfig = (utmSource) => ({
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://localhost',
  headers: {
    'Content-Type': 'application/json'
  },
  data: JSON.stringify({
    firstName: 'Teste NLU',
    lastName: 'Duplicidade xxxxxxxx NLU',
    utmSource,
    agent: '660d4fa83cbefd9962bd1d45',
    phones: ['+5548999726910'],
    emails: [
      'xxxxxxxxx@gmail.com'
    ]
  })
})

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const sendSequentialRequests = async () => {
  try {
    const res1 = await axios.request(makeConfig('WHATSAPP'))
    console.log(`[${new Date().toISOString()}]Requisição com utmSource WHATSAPP teve sucesso:`)
    console.log(`[${new Date().toISOString()}] `,(res1.data)) 
  } catch (err) {
    console.log(`[${new Date().toISOString()}] Requisição com utmSource WHATSAPP falhou:`)
    console.log(`[${new Date().toISOString()}] `,(err.response?.data || err.message)) 
  }

  await delay(1000) // Espera 1 segundo

  try {
    const res2 = await axios.request(makeConfig('NLU'))
    console.log(`[${new Date().toISOString()}] Requisição com utmSource NLU teve sucesso:`) 
    console.log(`[${new Date().toISOString()}] `,(res2.data)) 
  } catch (err) {
    console.log(`[${new Date().toISOString()}] Requisição com utmSource NLU falhou:`)
    console.log(`[${new Date().toISOString()}] `, (err.response?.data || err.message))
  }
}

const sendParallelRequests = async () => {
  const sources = ['WHATSAPP', 'NLU']

  const requests = sources.map(async (source) => {
    try {
      const res = await axios.request(makeConfig(source))
      console.log(`[${new Date().toISOString()}] Requisição com utmSource ${source} teve sucesso:`)
      console.log(`[${new Date().toISOString()}] `, res.data)
    } catch (err) {
      console.log(`[${new Date().toISOString()}] Requisição com utmSource ${source} falhou:`)
      console.log(`[${new Date().toISOString()}] `, err.response?.data || err.message)
    }
  })

  await Promise.all(requests)
}

// sendSequentialRequests()
sendParallelRequests()
