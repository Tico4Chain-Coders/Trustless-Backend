import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiResponse,
} from "@nestjs/swagger";
import {
  CancelEscrow,
  CompleteEscrow,
  FundEscrow,
  InitializeEscrow,
  RefundRemainingFunds,
} from "./classes/escrow.class";
import {
  CancelEscrowDefaultValue,
  CompleteEscrowDefaultValue,
  FundEscrowDefaultValue,
  InitializeEscrowDefaultValue,
  RefundRemainingFundsDefaultValue,
} from "./default-values-in-body/escrow-default-value";

/**
 * Escrows
 */
export const ApiInitializeEscrow = () => {
  return applyDecorators(
    ApiBody({ type: InitializeEscrow, examples: InitializeEscrowDefaultValue }),
    ApiCreatedResponse({
      description: "The escrow has been successfully initialized",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: "Prices cannot be zero",
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiFundEscrow = () => {
  return applyDecorators(
    ApiBody({ type: FundEscrow, examples: FundEscrowDefaultValue }),
    ApiCreatedResponse({
      description: "The escrow has been successfully funded",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
        - Only the signer can fund the escrow\n
        - Escrow already funded\n
        - This escrow is already fully funded\n
        - The signer does not have sufficient funds\n
        - Escrow not found\n
        - Not enough allowance to fund this escrow`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiCompleteEscrow = () => {
  return applyDecorators(
    ApiBody({ type: CompleteEscrow, examples: CompleteEscrowDefaultValue }),
    ApiCreatedResponse({
      description: "The escrow has been successfully completed",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
          - Only the signer can complete the escrow\n
          - Escrow not funded\n
          - Escrow already completed\n
          - Escrow not found\n
          - The signer does not have sufficient funds`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiCancelEscrow = () => {
  return applyDecorators(
    ApiBody({ type: CancelEscrow, examples: CancelEscrowDefaultValue }),
    ApiCreatedResponse({
      description: "The escrow has been successfully canceled",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
            - Only the signer can cancel the escrow\n
            - Escrow already completed\n
            - Escrow not found\n
            - Escrow already canceled\n`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiRefundRemainingFundsEscrow = () => {
  return applyDecorators(
    ApiBody({
      type: RefundRemainingFunds,
      examples: RefundRemainingFundsDefaultValue,
    }),
    ApiCreatedResponse({
      description: "The escrow funds have been successfully refunded",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
              - Only the signer can request a fund\n
              - The escrow must be cancelled to refund the amounts\n
              - Escrow not found\n
              - The contract has no balance to repay\n`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiGetEscrowByEngagementIdEscrow = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Escrow Body...",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
                - Only the signer can request a fund\n
                - The escrow must be cancelled to refund the amounts\n
                - Escrow not found\n
                - The contract has no balance to repay\n`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

/**
 * Helpers
 */

/**
 * Users
 */
