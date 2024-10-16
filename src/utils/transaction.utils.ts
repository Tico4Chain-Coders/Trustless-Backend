import { randomBytes } from "crypto";
import * as StellarSDK from "stellar-sdk";

export function buildTransaction(
  account: StellarSDK.Account,
  operations: StellarSDK.xdr.Operation[],
  fee: string = StellarSDK.BASE_FEE,
  networkPassphrase: string = StellarSDK.Networks.TESTNET,
  timeout: number = 30,
): StellarSDK.Transaction {
  const transactionBuilder = new StellarSDK.TransactionBuilder(account, { fee, networkPassphrase })
    .setTimeout(timeout);

  operations.forEach((operation) => {
    transactionBuilder.addOperation(operation);
  });

  return transactionBuilder.build();
}

export function buildInvokeContractOperation(
  deployerContractAddress: string,
  wasmHash: string,
  operationFunc: string,
  initFunc: string,
  operations: any[]
): StellarSDK.xdr.Operation {

  const wasmHashBytes = StellarSDK.nativeToScVal(Buffer.from(wasmHash, 'hex'), {type: 'bytes'});
  const salt = StellarSDK.nativeToScVal(Buffer.from(randomBytes(32)), {type: 'bytes'})

  const operation = StellarSDK.Operation.invokeHostFunction({
    auth: [],
    func: StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSDK.xdr.InvokeContractArgs({
        contractAddress: new StellarSDK.Address(deployerContractAddress).toScAddress(),
        functionName: operationFunc,
        args: [
          StellarSDK.Address.fromString(deployerContractAddress).toScVal(), 
          wasmHashBytes,
          salt, 
          StellarSDK.nativeToScVal(initFunc, { type: 'symbol' }), 
          StellarSDK.nativeToScVal(operations, { type: 'vec' }) // Aquí usas el array operations directamente
        ]
      })
    )
  });

  return operation;
}

export async function signAndSendTransaction(
  transaction: StellarSDK.Transaction,
  keypair: StellarSDK.Keypair,
  server: StellarSDK.SorobanRpc.Server,
  prepareTransaction: boolean,
): Promise<StellarSDK.rpc.Api.GetSuccessfulTransactionResponse> {
  let response: any;

  if (prepareTransaction) {
    const preparedTransaction = await server.prepareTransaction(transaction);
    preparedTransaction.sign(keypair);
    response = await server.sendTransaction(preparedTransaction);
  } else {
    transaction.sign(keypair);
    response = await server.sendTransaction(transaction);
  }

  if (response.status === "PENDING") {
    let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;

    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      getResponse = await server.getTransaction(response.hash);
    } while (getResponse.status === "NOT_FOUND");

    if (getResponse.status === "SUCCESS") {
      return getResponse;
    } else {
      throw new Error(
        `Transaction failed: ${JSON.stringify(getResponse.resultXdr)}`,
      );
    }
  } else {
    throw new Error(`Transaction submission failed: ${response.errorResult}`);
  }
}