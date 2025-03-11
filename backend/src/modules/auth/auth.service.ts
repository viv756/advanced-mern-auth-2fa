import { ErrorCode } from "../../common/enums/error-code-enum";
import { VerificationEnum } from "../../common/enums/verification-code.enum";
import { RegisterData } from "../../common/interface/auth.interface";
import { BadRequestException } from "../../common/utils/catch-error";
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time";
import UserModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";

export class AuthService {
  public async register(registerData: RegisterData) {
    const { name, email, password } = registerData;

    const existinguser = await UserModel.exists({
      email,
    });

    if (existinguser) {
      throw new BadRequestException("User already exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }
    const newUser = await UserModel.create({
      name,
      email,
      password,
    });
    const userId = newUser._id;

    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    return {
      user: newUser,
    };
  }
}
