import { Chain, chains } from "@/shared/constants/chains";
import { Schema, Document, model, Types } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IWallet {
  solAddress: string;
  baseAddress: string;
  solBalance: string;
  baseBalance: string;
  walletSetId: string;
  baseWalletId: string;
  solWalletId: string;
}

export interface IOrganisation extends Document {
  _id: Types.ObjectId;
  name: string;
  wallet: IWallet;
  walletBalance: string;
  entityKey: string;
  noOfEmployees: number;
  chain: String[];
  payDay: number;
  isDeleted: boolean;
  isApproved: boolean;
  admins: Types.ObjectId[];
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganisationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    walletBalance: {
      type: String,
      default: "0.00",
    },
    entityKey: {
      type: String,
      required: false,
    },
    noOfEmployees: {
      type: Number,
      default: 0,
    },
    chain: {
      type: [String],
      enum: ["SOL", "BASE"],
    },
    payDay: {
      type: Number,
      default: 25,
    },
    admins: [{ type: Types.ObjectId, ref: "users" }],
    logo: {
      type: String,
      // required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    wallet: {
      solAddress: {
        type: String,
      },
      baseAddress: {
        type: String,
      },
      solBalance: {
        type: String,
      },
      baseBalance: {
        type: String,
      },
      walletSetId: {
        type: String,
      },
      baseWalletId: {
        type: String,
      },
      solWalletId: {
        type: String,
      },
    },
  },
  { timestamps: true, versionKey: false }
);

OrganisationSchema.index({ admins: 1 }, { background: true });

OrganisationSchema.plugin(mongoosePagination);

export const OrganisationModel: Pagination<IOrganisation> = model<
  IOrganisation,
  Pagination<IOrganisation>
>("organisations", OrganisationSchema);
