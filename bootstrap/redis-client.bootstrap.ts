import { Module } from '@nestjs/common'
import * as redis from 'redis'
import * as dotenv from 'dotenv'
import * as ip from 'ip'
import * as bluebird from 'bluebird'
import { ClientProxyRef } from '../ms-client-proxy/client-proxy'

dotenv.config()

const cache_client_options = {
    host: process.env.REDIS_HOST || ip.address(),
    port:
        parseInt(process.env.REDIS_PORT, 10 ) || 6379,
}

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

@Module({
    providers: [
        {
            provide: ClientProxyRef.REDIS,
            useValue: {
                cache: {
                    ...cache_client_options,
                    client: redis.createClient(cache_client_options),
                },
            },
        },
    ],
    exports: [ClientProxyRef.REDIS],
})
export class RedisClientBootstrapModule {}
