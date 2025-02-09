import { Hono } from 'hono'
import { env } from 'hono/adapter'

const app = new Hono()

app.get('/', (c) => {
   

   return c.text('Hello Hono!')
})

export default app
