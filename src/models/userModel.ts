import {
  prop,
  getModelForClass,
  DocumentType,
  pre,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Interface for User document
export interface User extends Base {}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@pre<User>("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
})
export class User {
  @prop({ unique: true, sparse: true })
  public userName?: string;

  @prop({ required: true, unique: true, lowercase: true })
  public email!: string;

  @prop({ required: true, select: false })
  public password!: string;

  @prop({ enum: ["user", "admin"], default: "user" })
  public role!: string;

  @prop({ select: false })
  public passwordChangedAt?: Date;

  @prop({ select: false })
  public passwordResetToken?: string;

  @prop({ select: false })
  public passwordResetExpires?: Date;

  // Instance method to check if password is correct
  async correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  // Check if user changed password after the token was issued
  changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        this.passwordChangedAt.getTime() / 1000
      );
      return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
  }

  // Create password reset token
  createPasswordResetToken(): string {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 10 minutes
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }

  public createdAt!: Date;
  public updatedAt!: Date;
}

export type UserDocument = DocumentType<User>;
export const UserModel = getModelForClass(User);
