import { RegisterUserInput } from "./types";
import { prisma } from "../utils/prisma";

export const userService = {
  // getAll: async (): Promise<IUser[]> => {
  //   return await User.find();
  // },
  getAll: async () => {
    return await prisma.user.findMany();
  },
  // getByEmail: async (email: string): Promise<IUser | null> => {
  //   const filter = { email: email };
  //   return await User.findOne(filter);
  // },
  getByEmail: async (email: string) => {
    return await prisma.user.findUnique({
      where: { Email: email },
    });
  },
  // getByEmailAndPassword: async (
  //   email: string,
  //   password: string,
  // ): Promise<IUser | null> => {
  //   const filter = { email: email, password: password };
  //   const user = await User.findOne(filter);
  //   return user;
  // },
  getByEmailAndPassword: async (email: string, password: string) => {
    return await prisma.user.findFirst({
      where: { Email: email, Password: password },
    });
  },
  updateProfilePicture: async (userId: string, ProfilePicture: string) => {
    return await prisma.user.update({
      where: { Id: userId },
      data: { ProfilePicture },
    });
  },
  // register: async (data: RegisterUserInput): Promise<IUser | null> => {
  //   const user = new User({
  //     fullName: data.fullName,
  //     email: data.email,
  //     password: data.password,
  //   });
  register: async (data: RegisterUserInput) => {
    return await prisma.user.create({
      data: {
        FullName: data.fullName,
        Email: data.email,
        Password: data.password,
        ProfilePicture: data.profilePicture,
      },
    });
    // await user.save();
    // return user;
  },
};
