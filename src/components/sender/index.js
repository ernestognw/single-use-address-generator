import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

const Sender = ({ address, rawTransaction }) => {
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const providerAvailable = !!window.ethereum;

  const send = async () => {
    if (!providerAvailable) return;

    setSending(true);
    try {
      await window.ethereum.request({
        method: "eth_sendRawTransaction",
        params: [rawTransaction],
      });
    } catch (err) {
      toast({
        title: "An error has occurred.",
        description: err.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    setSending(false);
  };

  return (
    <Stack spacing={4} mt={8}>
      <FormControl>
        <FormLabel htmlFor="email">Address</FormLabel>
        <Input disabled value={address} />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="email">rawTransaction</FormLabel>
        <Textarea disabled value={rawTransaction} />
      </FormControl>
      <Button
        type="submit"
        fontFamily="heading"
        w="full"
        bgGradient="linear(to-r, red.400,pink.400)"
        color="white"
        size="lg"
        disabled={!providerAvailable}
        onClick={send}
        isLoading={sending}
        _hover={{
          bgGradient: "linear(to-r, red.400,pink.400)",
          boxShadow: "xl",
        }}
      >
        {providerAvailable ? "Send it" : "There is no provider to send tx"}
      </Button>
      <Text color="gray.500" align="center">
        Remember to send funds to {address} first
      </Text>
    </Stack>
  );
};

export default Sender;
