import { ObjectId } from 'mongodb';

export type UserModel = {
    _id: ObjectId,
    name: string,
    email: string,
    tlf: string,
    amigos: ObjectId[]
};

export type User = {
    id: string,
    name: string,
    email: string,
    tlf: string,
    amigos: User[]
};