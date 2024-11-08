import { MongoClient } from 'mongodb';
import { UserModel } from "./types.ts";
import { addUser, borrarUser, getAllUser } from "./resolvers.ts";

// Connection URL
const url = Deno.env.get("MONGO_URL");

if(!url)
{
  console.log("No se ha podido conectar a la URL.");
  Deno.exit(1);
}

const client = new MongoClient(url);

// Database Name  
const dbName = 'examenBackEnd';

// Use connect method to connect to the server
await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const usersCollection = db.collection<UserModel>('users');

const handler = async(
  req: Request
): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if(method === "GET")
  {
    if(path === "/personas")
    {
      return await getAllUser(usersCollection);
    }
  }
  else if(method === "POST")
  {
    if(path === "/personas")
    {
      const body = await req.json();

      if(body.id || !body.name || !body.tlf || !body.email || !body.amigos)
      {
        return new Response("bad request", { status: 400 });
      }

      return await addUser(body, usersCollection);
      
    }
  }
  else if(method === "PUT")
  {

  }
  else if(method === "DELETE")
  {
    if(path === "/personas")
    {
      const body = await req.json();

      if(!body.email) return new Response("Falta email.", { status: 400 });

      return await borrarUser(body, usersCollection);
    }
  }
  return new Response("endpoint not found", { status: 400 });
};

Deno.serve({ port: 3000 }, handler);