import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputRightAddon,
  Button,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { BigNumber, ethers, utils } from "ethers";
import { useForm } from "react-hook-form";
import { without0x } from "../../utils";

const GWEI_DECIMALS = 9;
// From Ethereum's Yellow Paper https://ethereum.github.io/yellowpaper/paper.pdf
// Appendix F. Signing Transactions
const secp256k1n = BigNumber.from(
  "115792089237316195423570985008687907852837564279074904382605163141518161494337"
);

const TransactionInput = ({ onGenerated }) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      chainId: "1",
      gasPrice: "100",
      gasLimit: "21000",
      value: "0",
    },
  });

  const onSubmit = (data) => {
    // According to Ethereum's Yellow Paper Appendix F. https://ethereum.github.io/yellowpaper/paper.pdf :
    // 0 < r < secp256k1n
    // 0 < s < secp256k1n ÷ 2 + 1
    // and according to EIP-155 https://eips.ethereum.org/EIPS/eip-155 :
    // v ∈ {27, 28}
    const r = BigNumber.from(utils.hexlify(utils.randomBytes(64))).mod(
      secp256k1n
    );
    const s = BigNumber.from(utils.hexlify(utils.randomBytes(64))).mod(
      secp256k1n.div(2).add(1)
    );
    const v = BigNumber.from(Math.random() > 0.5 ? 27 : 28);

    const rHex = r.toHexString();
    const rHexPadded = ethers.utils.hexZeroPad(rHex, 32); // Ensure 32 bytes long
    const sHex = s.toHexString();
    const sHexPadded = ethers.utils.hexZeroPad(sHex, 32); // Ensure 32 bytes long

    const vHex = v.toHexString();
    const signature = `0x${without0x(rHexPadded)}${without0x(
      sHexPadded
    )}${without0x(vHex)}`;

    const txParams = {
      ...data,
      chainId: 3,
      nonce: 0, // 0 since every single use tx is assumed new
      value: BigNumber.from(data.value),
      gasLimit: BigNumber.from(data.gasLimit),
      gasPrice: BigNumber.from(data.gasPrice).mul(10 ** GWEI_DECIMALS),
    };

    try {
      const rawUnsignedTx = ethers.utils.serializeTransaction(txParams);
      const unsignedTxHash = ethers.utils.keccak256(rawUnsignedTx);
      const address = ethers.utils.recoverAddress(unsignedTxHash, signature);
      const rawTransaction = ethers.utils.serializeTransaction(
        txParams,
        signature
      );

      onGenerated({ address, rawTransaction });
    } catch (err) {
      // There's a 50% chance of having a valid address
      if (err.message.includes("invalid point")) onSubmit(data);
      else {
        toast({
          title: "An error has occurred.",
          description: err.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>chainId</FormLabel>
          <NumberInput step={1} min={1}>
            <NumberInputField
              {...register("chainId")}
              bg={"gray.100"}
              border={0}
              color={"gray.500"}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>gasPrice</FormLabel>
          <InputGroup>
            <NumberInput flex={1} step={1} min={0}>
              <NumberInputField
                {...register("gasPrice")}
                bg={"gray.100"}
                border={0}
                color={"gray.500"}
                borderTopRightRadius={0}
                borderBottomRightRadius={0}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon children="gwei" />
          </InputGroup>
        </FormControl>
        <FormControl>
          <FormLabel>gasLimit</FormLabel>
          <NumberInput step={1} min={21000}>
            <NumberInputField
              {...register("gasLimit")}
              bg={"gray.100"}
              border={0}
              color={"gray.500"}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl isInvalid={errors?.to?.message}>
          <FormLabel>to</FormLabel>
          <Input
            {...register("to", {
              validate: (value) =>
                utils.isAddress(value) || "Recipient is not a valid address",
            })}
            bg={"gray.100"}
            border={0}
            placeholder="to"
            color={"gray.500"}
            _placeholder={{
              color: "gray.500",
            }}
          />
          {errors?.to?.message && (
            <FormErrorMessage>{errors.to.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={errors?.value?.message}>
          <FormLabel>value</FormLabel>
          <InputGroup>
            <NumberInput flex={1} step={1} min={0}>
              <NumberInputField
                {...register("value", {
                  validate: (value) => {
                    try {
                      BigNumber.from(value);
                    } catch (err) {
                      return "Invalid BigNumber";
                    }
                  },
                })}
                bg={"gray.100"}
                border={0}
                color={"gray.500"}
                borderTopRightRadius={0}
                borderBottomRightRadius={0}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon children="wei" />
          </InputGroup>
          {errors?.value?.message && (
            <FormErrorMessage>{errors.value.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={errors?.data?.message}>
          <FormLabel>data</FormLabel>
          <Input
            {...register("data", {
              validate: (value) =>
                utils.isHexString(value) ||
                "Invalid data. Should be HEX prefixed by 0x",
            })}
            bg={"gray.100"}
            border={0}
            placeholder="data"
            color={"gray.500"}
            _placeholder={{
              color: "gray.500",
            }}
          />
          {errors?.data?.message && (
            <FormErrorMessage>{errors.data.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button
          type="submit"
          fontFamily="heading"
          w="full"
          size="lg"
          bgGradient="linear(to-r, red.400,pink.400)"
          color="white"
          _hover={{
            bgGradient: "linear(to-r, red.400,pink.400)",
            boxShadow: "xl",
          }}
        >
          Generate
        </Button>
      </Stack>
    </form>
  );
};

export default TransactionInput;
