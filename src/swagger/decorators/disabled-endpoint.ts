import {
  applyDecorators,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

export const DisabledEndpoint = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Este endpoint está deshabilitado",
      description: "Este endpoint no está disponible en este momento.",
    }),
    UseInterceptors({
      intercept: () => {
        throw new HttpException(
          "Este endpoint está deshabilitado",
          HttpStatus.NOT_IMPLEMENTED,
        );
      },
    }),
  );
};
