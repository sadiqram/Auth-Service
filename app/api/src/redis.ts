import {createClient} from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

//log redis errors instead of crashing the app
redisClient.on('error', (err) => {
    console.error('Redis error', err);
});

export default redisClient;