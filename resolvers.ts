import { type Collection, ObjectId } from 'mongodb';
import { UserModel, User } from "./types.ts";

export const addUser = async(
    body: User,
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const findResult = await usersCollection.findOne({email: body.email});

    if(findResult?.email === body.email || findResult?.tlf === body.tlf)
    {
        return new Response("El email o teléfono ya están registrados.", { status: 400 });
    }

    const idAmigos: ObjectId[] = body.amigos.map(elem => new ObjectId(elem.id));
    
    const usuario = {
        _id: new ObjectId(),
        name: body.name,
        email: body.email,
        tlf: body.tlf,
        amigos: idAmigos
    }

    const { insertedId } = await usersCollection.insertOne(usuario);

    if(insertedId)
        return new Response(JSON.stringify(usuario), { status: 404 });
    return new Response("No se ha podido añadir el nuevo user", { status: 404 });
    
};

export const fromModeltoUser = async (
    ids: ObjectId[],
    userCollection: Collection<UserModel>
): Promise<User[]> => {
    const findResult = await userCollection.find({_id : {$in : ids}}).toArray();

    const amigosUser: User[] = [];

    if(findResult && findResult.length > 0)
    {
        await Promise.all(findResult.map((elem: UserModel) => {
            const amigo:User = {
                id: elem._id.toString(),
                name: elem.name,
                email: elem.email,
                tlf: elem.tlf,
                amigos: elem.amigos
            };
            amigosUser.push(amigo);
        }))
    }
    return amigosUser;
}

export const getAllUser = async (
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const findResult = await usersCollection.find({}).toArray();

    const usuarios: User[] = [];

    if(findResult && findResult.length > 0)
    {
        await Promise.all(findResult.map(async (elem: UserModel) => {
            const amigo:User = {
                id: elem._id.toString(),
                name: elem.name,
                email: elem.email,
                tlf: elem.tlf,
                amigos: await fromModeltoUser(elem.amigos, usersCollection)
            };
            usuarios.push(amigo);
        }))
    }
    else
        return new Response("No hay usuarios", {status: 404});
    
    return new Response(JSON.stringify(usuarios), { status: 200 });
};

export const getUsersByName = async (
    nombre: string,
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const findResult = await usersCollection.find({name: nombre}).toArray();

    const usuarios: User[] = [];

    if(findResult && findResult.length > 0)
    {
        await Promise.all(findResult.map(async (elem: UserModel) => {
            const amigo:User = {
                id: elem._id.toString(),
                name: elem.name,
                email: elem.email,
                tlf: elem.tlf,
                amigos: await fromModeltoUser(elem.amigos, usersCollection)
            };
            usuarios.push(amigo);
        }))
    }
    else
        return new Response("No hay usuarios con ese nombre", {status: 404});
    
    return new Response(JSON.stringify(usuarios), { status: 200 });
};

export const getUsersByEmail = async (
    email: string,
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const findResult = await usersCollection.findOne({email: email});

    if(findResult)
    {
        return new Response(JSON.stringify({
            id: findResult._id.toString(),
            name: findResult.name,
            email: findResult.email,
            tlf: findResult.tlf,
            amigos: await fromModeltoUser(findResult.amigos, usersCollection)
        }), { status: 200 });
    }
    else
        return new Response("Persona no encontrada.", {status: 404});
};

export const borrarUser = async (
    body: User,
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const { deletedCount } = await usersCollection.deleteOne({ email: body.email });

    if(deletedCount)
        return new Response("Persona eliminada exitosamente.", { status: 200 });
    else
        return new Response("Usuario no encontrado.", { status: 404 });
};

export const actualizarUser = async (
    body: Partial<User>,
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const usuarioMod: Partial<UserModel> = {};

    const findTlf = await usersCollection.find({tlf: body.tlf}).toArray();

    if(findTlf.length > 0)
        return new Response("No puedes repetir un teléfono que ya existe", { status: 404 });

    if(body.name) usuarioMod.name = body.name;
    if(body.tlf) usuarioMod.tlf = body.tlf;
    if(body.amigos) usuarioMod.amigos = body.amigos;

    const { modifiedCount } = await usersCollection.updateOne({ email: body.email }, { $set: { ...usuarioMod } });

    if(modifiedCount)
        return new Response("Usuario modificado exitosamente.", { status: 200 });
    return new Response("Usuario no encontrado.", { status: 404 });
};