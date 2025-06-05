import redis from 'redis'

let redisInstance = null

export const setInstance = (newInstance) => {
  redisInstance = newInstance
}

let REDIS_TTL = 10000


export const getInstance = () => {
  if (!redisInstance) {
    throw new Error('Redis instance not set')
  }
  return redisInstance
}

export async function createInstance() {
  const instance = await redis.createClient({ url: 'redis://localhost:6379' })

  instance.on('connect', () => {return console.log('[Redis] Redis connected')})
  instance.on('error', (error) => console.log(error))


  return instance
}

export const acquireLock = async (key, value) => {
  const client = getInstance()

  return new Promise((resolve, reject) => {
    client.set(key, value, 'NX', 'PX', REDIS_TTL, (err, result) => {
      if (err) {
        return resolve(false)
      }

      if (result === 'OK') {
        console.log('Lock acquired')
        return resolve(true)
      }

      resolve(false)
    })
  })
}


export const releaseLock =  async (key) => {
  const client = await getInstance()
  return await client.get(key, (err, currentValue) => {
      if (err) return false
      // if (currentValue !== value) return false

      client.del(key, (delErr, delReply) => {
        if (delErr) return false
        return true
      })
    })
}

export const acquireLockWithRetry = async (
  key,
  value
) => {
  let shouldRetry = true
  while (shouldRetry) {
    try {
      const acquired = await acquireLock(key, value)
      console.log('acquired: ', acquired)
      if (acquired) {
        shouldRetry = false
        console.log('starting lock')
        return true
      }
      console.log('got blocked')

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      console.log(`Error acquiring lock on ${key}: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  return true
}