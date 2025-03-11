import jwt from "jsonwebtoken";
import { ErrorCode } from "../../common/enums/error-code-enum";
import { VerificationEnum } from "../../common/enums/verification-code.enum";
import { LoginData, RegisterData } from "../../common/interface/auth.interface";
import { BadRequestException } from "../../common/utils/catch-error";
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time";
import SessionModel from "../../database/models/session.model";
import UserModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import { config } from "../../config/app.config";

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

  public async login(loginData: LoginData) {
    const { email, password, userAgent } = loginData;

    const user = await UserModel.findOne({
      email: email,
    });

    if (!user) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    // check the user enable 2fa return user=null
    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = jwt.sign({ userId: user._id, sessionId: session._id }, config.JWT.SECRET, {
      audience: ["user"],
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ sessionId: session._id }, config.JWT.REFRESH_SECRET, {
      audience: ["user"],
      expiresIn: "30d",
    });

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired:false
    };
  }
}
