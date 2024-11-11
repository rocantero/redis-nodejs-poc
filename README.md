# node-redis-API
API using Node JS, Express JS, and Redis.


## API Features
```
1. Fetch data from tomorrow.io
2. Put data into cache
3. Serve cached data
```

## Getting Started

Run redis with Docker `docker compose up`
Install dependencies `npm install`
Serve `npm start`

## Dependencies
```
  1. Redis
  2. Docker
  3. NodeJS
  4. ExpressJS
```

## API Endpoints

All API endpoints return a status code of 200 for successful calls and 400 including an error object for unsuccessful calls.

```
| EndPoint                                |   Functionality                      |
| --------------------------------------- | ------------------------------------:|
| GET /test                               | Runs cron function manually          |
| GET /locations/:locationId              | Get cached location data             |
```



