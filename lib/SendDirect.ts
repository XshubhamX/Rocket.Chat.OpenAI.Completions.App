import {
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function getOrCreateDirectRoom(
    read: IRead,
    modify: IModify,
    usernames: Array<string>,
    creator?: IUser
) {
    let room;
    // first, let's try to get the direct room for given usernames
    try {
        room = await read.getRoomReader().getDirectByUsernames(usernames);
    } catch (error) {
        this.getLogger().log(error);
        return;
    }
    // nice, room exist already, lets return it.
    if (room) {
        return room;
    } else {
        // no room for the given users. Lets create a room now!
        // for flexibility, we might allow different creators
        // if no creator, use app user bot
        if (!creator) {
            creator = await read.getUserReader().getAppUser();
            if (!creator) {
                throw new Error("Error while getting AppUser");
            }
        }

        let roomId: string;
        // Create direct room
        const newRoom = modify
            .getCreator()
            .startRoom()
            .setType(RoomType.DIRECT_MESSAGE)
            .setCreator(creator)
            .setMembersToBeAddedByUsernames(usernames);
        roomId = await modify.getCreator().finish(newRoom);
        return await read.getRoomReader().getById(roomId);
    }
}

export async function sendDirect(
    destination: IUser,
    read: IRead,
    modify: IModify,
    message: string,
): Promise<void> {
    const messageStructure = modify.getCreator().startMessage();
    // get the appUser username
    const appUser = await read.getUserReader().getAppUser();
    if (!appUser) {
        throw new Error("Something went wrong getting App User!");
    }
    // lets use a function we created to get or create direct room
    let room = (await getOrCreateDirectRoom(read, modify, [
        destination.username,
        appUser.username,
    ])) as IRoom;
    messageStructure.setRoom(room).setText(message); // set the text message
    await modify.getCreator().finish(messageStructure); // sends the message in the room.
}
