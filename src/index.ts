import { Hono } from 'hono';


import { userRouter } from './routes/user';
import { Productrouter } from './routes/productss';
import { imagerouter } from './Middleeware';
import { cors } from 'hono/cors';


// Create the main Hono app
const app = new Hono<{
	Bindings:{
		DATABASE_URL : string;
		JWT_SECRET:string
	}
}>();

app.use("*",cors())
app.route('/api/v1/user',userRouter);
app.route('/api/v1/products', Productrouter);
app.route('/api/v1/images', imagerouter)
app.fire()


export default app;


