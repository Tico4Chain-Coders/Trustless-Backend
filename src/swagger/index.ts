import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiResponse,
} from "@nestjs/swagger";
import {
  CancelEscrow,
  ClaimEscrowEarnings,
  CompleteEscrow,
  FundEscrow,
  InitializeEscrow,
  RefundRemainingFunds,
} from "./classes/escrow.class";
import {
  CancelEscrowDefaultValue,
  ClaimEscrowEarningsDefaultValue,
  CompleteEscrowDefaultValue,
  FundEscrowDefaultValue,
  InitializeEscrowDefaultValue,
  RefundRemainingFundsDefaultValue,
} from "./default-values-in-body/escrow-default-value";
import { InvokeContract } from "./classes/deployer.class";
import { InvokeContractDefaultValue } from "./default-values-in-body/deployer-default-value";
import { SendTransaction, SetTrustline } from "./classes/helper.class";
import {
  SendTransactionDefaultValue,
  SetTrustlineDefaultValue,
} from "./default-values-in-body/helper-default-value";
import { ApiQuery } from "@nestjs/swagger";

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
      description:
        "unsignedTransaction: AAAAAgAAAABfQAm/gS... // XDR Hash Transaction",
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
      description:
        "unsignedTransaction: AAAAAgAAAABfQAm/gS... // XDR Hash Transaction",
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
      description:
        "unsignedTransaction: AAAAAgAAAABfQAm/gS... // XDR Hash Transaction",
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
      description:
        "unsignedTransaction: AAAAAgAAAABfQAm/gS... // XDR Hash Transaction",
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
    ApiQuery({
      name: "contractId",
      required: true,
      description: "Contract ID",
    }),
    ApiQuery({
      name: "engagementId",
      required: true,
      description: "Engagement ID",
    }),
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
export const ApiSendTransaction = () => {
  return applyDecorators(
    ApiBody({
      type: SendTransaction,
      examples: SendTransactionDefaultValue,
    }),
    ApiResponse({
      status: 200,
      description:
        "The transaction has been successfully sent to the Stellar network",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiSetTrustline = () => {
  return applyDecorators(
    ApiBody({
      type: SetTrustline,
      examples: SetTrustlineDefaultValue,
    }),
    ApiResponse({
      status: 200,
      description:
        "The trust line has been correctly defined in the USDC token",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

export const ApiClaimEscrowEarnings = () => {
  return applyDecorators(
    ApiBody({
      type: ClaimEscrowEarnings,
      examples: ClaimEscrowEarningsDefaultValue,
    }),
    ApiCreatedResponse({
      description:
        "unsignedTransaction: AAAAAgAAAABfQAm/gS... // XDR Hash Transaction",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
                - Escrow not found\n
                - Only the service provider can claim escrow earnings\n
                - The escrow has already been cancelled\n
                - The escrow must be completed to claim earnings\n
                - The escrow balance must be equal to the amount of earnings defined for the escrow\n
                - The contract does not have sufficient funds\n`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};

/**
 * Users
 */

/**
 * Deployer
 */
export const ApiInvokeContract = () => {
  return applyDecorators(
    ApiBody({ type: InvokeContract, examples: InvokeContractDefaultValue }),
    ApiCreatedResponse({
      description: "ContractId and EngagementId...",
    }),
    ApiBadRequestResponse({
      description: "Bad request",
    }),
    ApiResponse({
      status: 500,
      description: `Possible Errors:\n
                - Amount cannot be zero\n
                - Engagement ID cannot be empty\n`,
    }),
    ApiResponse({
      status: 429,
      description: "ThrottlerException: Too Many Requests",
    }),
  );
};
