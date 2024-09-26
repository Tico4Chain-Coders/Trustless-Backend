import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController", () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should login user", async () => {
    const result = "UserName";
    jest.spyOn(service, "login").mockImplementation(async () => result);

    expect(await controller.login("user_address", "secret_key")).toBe(result);
  });
});
