import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { newProduct } from "../zod";
import { verify } from "hono/jwt";



export const Productrouter = new Hono<{
    Bindings:{
        DATABASE_URL : string;
		JWT_SECRET:string;
        MY_KV: KVNamespace;
	},
    Variables:{
        userId:string,
        filepath:string,
        id:string
        
    }
}>();



Productrouter.post('/blogs', async(c) => {
    
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
	}).$extends(withAccelerate());
    
	try{
        
        const data = await prisma.product.findMany({});
        console.log("sended")
		return c.json({data});
	}
	catch(err){
        return c.json({error:err})
	}
    
    
})

Productrouter.get('/product/:id', async(c) => {
    const id = c.req.param('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());


    console.log(id, "this is id");
    try{
        const data = await prisma.product.findUnique({
            where:{
                id:id
            }
        });

        return c.json(data)
    }
    catch(err){

        return c.json({err:err})
    }
})

Productrouter.use('/*', async (c, next) => {
    const jwt = c.req.header('Authorization');
	if (!jwt) {
		
		return c.json({ error: "unauthorized" });
	}
    console.log("yaha tk thk h",jwt)
	// const token = jwt.split(' ')[1];
    const token = jwt;
	const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		// c.status(401);
		return c.json({ error: "unauthorized" });
	}
    // @ts-ignore
	c.set('userId', payload.id);
	await next()
})

Productrouter.post('/new', async(c) => {

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL
	}).$extends(withAccelerate());


	const body = await c.req.json();
    const authorid = c.get("userId");

    // const filepath = c.get('filepath');
    // console.log(filepath);



	const valid = newProduct.safeParse(body);
    if(!valid.success){
        return c.json({err :"zod error" })
    }

    console.log(body)

    try{

        const new_prod = await prisma.product.create({
            data:{
                title:body.title,
                content:body.content,
                price:body.price,
               imagepath:body.image,
               desc:body.desc,
               origin:body.origin,
               color:body.color,
               size:body.size,
                author: {
                    connect: { id: authorid } // Use connect to specify the relation
                }
            }
        });
        console.log("new product added")
        return c.text( new_prod.id)
    }
    catch(err){
        return c.json({err:err})
    }
})

Productrouter.put('/update', async(c)=>{

    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL
	}).$extends(withAccelerate());


	const body = await c.req.json();


    try{

        const update_prod = await prisma.product.update({
            where:{
                id:body.id
            },
            data:{
                title:body.title,
                content:body.content,
                price:body.price,
                
                desc:body.desc,
                origin:body.origin,
                color:body.color,
                size:body.size,
            }

        })
        return c.json({prod_id :update_prod.id})
    }catch(err){
        return c.json({err:err})
    }
})


Productrouter.delete('/delete/:id',async(c)=>{
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL
	}).$extends(withAccelerate());

    
	const id = await c.req.param('id')
    
    
    try{
        
        const del_prod = await prisma.product.delete({
            where:{
                id:String(id)
            },
            select:{
                imagepath:true
            }
        })
        
        const key = del_prod.imagepath
        console.log("dlete call")
        console.log("prisma delte")

        const image = await c.env.MY_KV.get(key);
        if (!image) {
            console.log("No image found with key ")
          return c.text(`No image found with key "${key}"`, 404);
        }
      

        await c.env.MY_KV.delete(key);
        console.log("sucess delete")
        return c.json({sucess:true})
    }
    catch(err){
        return c.json({err:err})
    }


});



Productrouter.delete("/deleteall",async(c)=>{
    console.log("delte all");


    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    

    await prisma.product.deleteMany({});

    return c.text("all deleted")
})
