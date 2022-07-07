import {
  createSmartContractPayload,
  createCoinbasePayload,
  createContractCallPayload,
  createTokenTransferPayload,
  TokenTransferPayload,
  ContractCallPayload,
  SmartContractPayload,
  CoinbasePayload,
} from './payload';

import {
  trueCV,
  falseCV,
  standardPrincipalCV,
  contractPrincipalCV,
  principalToString,
  StacksMessageType,
  COINBASE_BUFFER_LENGTH_BYTES,
} from 'micro-stacks/clarity';

import { serializeDeserialize } from './common/test-utils';
import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from 'micro-stacks/common';
import { leftPadHexToLength } from './common/utils';

test('STX token transfer payload serialization and deserialization', () => {
  const recipient = standardPrincipalCV('SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159');
  const amount = 2500000;

  const payload = createTokenTransferPayload(recipient, amount, 'memo (not being included)');

  const deserialized = serializeDeserialize(
    payload,
    StacksMessageType.Payload
  ) as TokenTransferPayload;
  expect(deserialized.payloadType).toBe(payload.payloadType);
  expect(deserialized.recipient).toEqual(recipient);
  expect(deserialized.amount.toString()).toBe(amount.toString());
});

test('STX token transfer payload (to contract addr)  serialization and deserialization', () => {
  const recipient = contractPrincipalCV(
    'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159',
    'contract-name'
  );
  const amount = 2500000;

  const payload = createTokenTransferPayload(recipient, amount, 'memo (not being included)');

  const deserialized = serializeDeserialize(
    payload,
    StacksMessageType.Payload
  ) as TokenTransferPayload;
  expect(deserialized.payloadType).toBe(payload.payloadType);
  expect(deserialized.recipient).toEqual(recipient);
  expect(deserialized.amount.toString()).toBe(amount.toString());
});

test('STX token transfer payload (with contract principal string) serialization and deserialization', () => {
  const recipient = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159.contract-name';
  const amount = 2500000;

  const payload = createTokenTransferPayload(recipient, amount, 'memo (not being included)');

  const deserialized = serializeDeserialize(
    payload,
    StacksMessageType.Payload
  ) as TokenTransferPayload;
  expect(deserialized.payloadType).toBe(payload.payloadType);
  expect(principalToString(deserialized.recipient)).toEqual(recipient);
  expect(deserialized.amount.toString()).toBe(amount.toString());
});

test('STX token transfer payload (with address principal string) serialization and deserialization', () => {
  const recipient = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
  const amount = 2500000;

  const payload = createTokenTransferPayload(recipient, amount, 'memo (not being included)');

  const deserialized = serializeDeserialize(
    payload,
    StacksMessageType.Payload
  ) as TokenTransferPayload;
  expect(deserialized.payloadType).toBe(payload.payloadType);
  expect(principalToString(deserialized.recipient)).toEqual(recipient);
  expect(deserialized.amount.toString()).toBe(amount.toString());
});

test('Contract call payload serialization and deserialization', () => {
  const contractAddress = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
  const contractName = 'contract_name';
  const functionName = 'function_name';
  const args = [trueCV(), falseCV()];

  const payload = createContractCallPayload(contractAddress, contractName, functionName, args);

  const deserialized = serializeDeserialize(
    payload,
    StacksMessageType.Payload
  ) as ContractCallPayload;
  expect(deserialized).toEqual(payload);
});

test('Smart contract payload serialization and deserialization', () => {
  const contractName = 'contract_name';
  const codeBody =
    '(define-map store ((key (buff 32))) ((value (buff 32))))' +
    '(define-public (get-value (key (buff 32)))' +
    '   (match (map-get? store ((key key)))' +
    '       entry (ok (get value entry))' +
    '       (err 0)))' +
    '(define-public (set-value (key (buff 32)) (value (buff 32)))' +
    '   (begin' +
    '       (map-set store ((key key)) ((value value)))' +
    "       (ok 'true)))";

  const payload = createSmartContractPayload(contractName, codeBody);

  const deserialized = serializeDeserialize(
    payload,
    StacksMessageType.Payload
  ) as SmartContractPayload;
  expect(deserialized.contractName.content).toBe(contractName);
  expect(deserialized.codeBody.content).toBe(codeBody);
});

test('Coinbase payload serialization and deserialization', () => {
  const coinbaseBuffer = leftPadHexToLength(
    bytesToHex(utf8ToBytes('coinbase buffer')),
    COINBASE_BUFFER_LENGTH_BYTES * 2
  );

  const buff = hexToBytes(coinbaseBuffer);

  const payload = createCoinbasePayload(buff);

  const deserialized = serializeDeserialize(payload, StacksMessageType.Payload) as CoinbasePayload;
  expect(bytesToUtf8(deserialized.coinbaseBuffer)).toBe(bytesToUtf8(buff));
});
