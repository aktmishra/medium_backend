 import { Hono } from "hono";
import userRouter from "./routes/user";
import postRouter from "./routes/blog";
import { cors } from 'hono/cors'
 

const app = new Hono ();

app.use('/*', cors())
app.route("/api/v1/user", userRouter)
app.route("/api/v1/blog", postRouter)



export default app;
