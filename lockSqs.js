import { v4 as uuid } from 'uuid'
import winston from 'winston'
import { acquireLock, acquireLockWithRetry, createInstance, releaseLock, setInstance } from './lock.js'

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
})

const worker = async (name) => {
  const key = 'my-task-lock'
  const value = uuid()
  const ttl = 5000 // 5s

  logger.info(`[${name}] Trying to acquire lock`)

  const gotLock = await acquireLockWithRetry(key, value, ttl)
console.log(gotLock)
  if (!gotLock) {
    logger.warn(`[${name}] Failed to acquire lock`)
    return
  }

  logger.info(`[${name}] Acquired lock. Running task...`)

  await new Promise(res => setTimeout(res, 3000)) // simula tarefa

  const released = await releaseLock(key, value)
  logger.info(`[${name}] Released lock: ${released}`)
}

const simulate = async () => {
  const instance = await createInstance()
  setInstance(instance)
  // simula 5 workers concorrendo ao mesmo tempo
  console.log('agora vai')
  await releaseLock('my-task-lock', '123') 
  console.log('Limpo')
  const workers = Array.from({ length: 5 }, (_, i) => `worker-${i + 1}`)
  await Promise.all(workers.map(name => worker(name)))
}

simulate()
