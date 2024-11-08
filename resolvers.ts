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

/*export const fromModeltoUser = async (
    ids: ObjectId[],
    userCollection: Collection<UserModel>
): Promise<Response> => {
    const findResult = await userCollection.find({_id : {$in : ids}}).toArray();

    const amigosUser: Partial<User[]> = [];

    const hola = await Promise.all(findResult.map(async (elem: UserModel) => {
        amigosUser.push({
            id: elem._id,
            name: elem.name,
            email: elem.email,
            tlf: elem.tlf
        })
    }));
    


}*/

export const getAllUser = async (
    usersCollection: Collection<UserModel>
): Promise<Response> => {
    const findResult = await usersCollection.find({}).toArray();
    
    return new Response(JSON.stringify(findResult), { status: 200 })
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

}