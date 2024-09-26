import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(
    @Body("userAddress") userAddress: string,
    @Body("name") name: string,
    @Body("email") email: string,
    @Body("secretKey") secretKey: string,
  ): Promise<number> {
    try {
      const result = await this.userService.register(
        userAddress,
        name,
        email,
        secretKey,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to interact with contract",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("login")
  async login(
    @Body("userAddress") userAddress: string,
    @Body("secretKey") secretKey: string,
  ): Promise<string> {
    try {
      const result = await this.userService.login(userAddress, secretKey);
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to interact with contract",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
