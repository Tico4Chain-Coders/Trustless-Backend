import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should login user and return name", async () => {
    const result = "UserName";
    jest.spyOn(service, "login").mockImplementation(async () => result);

    expect(await service.login("user_address", "secret_key")).toBe(result);
  });
});
