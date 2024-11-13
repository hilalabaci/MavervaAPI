import User, { IUser } from "../models/User";
import { RegisterUserInput } from "./types";

export const userService = {
  getAll: async (): Promise<IUser[]> => {
    return await User.find();
  },
  getByEmail: async (email: string): Promise<IUser | null> => {
    const filter = { email: email };
    return await User.findOne(filter);
  },
  getByEmailAndPassword: async (
    email: string,
    password: string,
  ): Promise<IUser | null> => {
    const filter = { email: email, password: password };
    const user = await User.findOne(filter);
    return user;
  },
  register: async (data: RegisterUserInput): Promise<IUser | null> => {
    const user = new User({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    await user.save();

    return user;
  },
};
