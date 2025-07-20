import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { UserModel, IUser } from "./user.model";
import { Pagination } from "mongoose-paginate-ts";

@InjectMongo("userModel", UserModel)
export class UserService extends DolphServiceHandler<Dolph> {
  userModel!: Pagination<IUser>;

  constructor() {
    super("userservice");
  }

  createUser(dto: Partial<IUser>) {
    return this.userModel.create(dto);
  }

  fetchUser(filter: any) {
    return this.userModel.findOne({ ...filter, isDeleted: false });
  }
}
