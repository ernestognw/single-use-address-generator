import { Heading, Box, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import Sender from "./components/sender";
import TransactionInput from "./components/transaction-input";
import MainLayout from "./layouts/main";

const App = () => {
  const [address, setAddress] = useState();
  const [rawTransaction, setRawTransaction] = useState();

  const onGenerated = ({
    address: addressToSet,
    rawTransaction: rawTransactionToSet,
  }) => {
    setAddress(addressToSet);
    setRawTransaction(rawTransactionToSet);
  };

  return (
    <MainLayout>
      <Stack spacing={{ base: 10, md: 20 }}>
        <Heading
          lineHeight={1.1}
          fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
        >
          Ethereum{" "}
          <Text
            as={"span"}
            bgGradient="linear(to-r, red.400,pink.400)"
            bgClip="text"
          >
            single-use
          </Text>{" "}
          address generatior
        </Heading>
      </Stack>
      <Stack
        bg={"gray.50"}
        rounded={"xl"}
        p={{ base: 4, sm: 6, md: 8 }}
        spacing={{ base: 8 }}
        maxW={{ lg: "lg" }}
      >
        <Stack spacing={4}>
          <Heading
            color={"gray.800"}
            lineHeight={1.1}
            fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
          >
            Craft your transaction
          </Heading>
        </Stack>
        <Box mt={10}>
          <TransactionInput onGenerated={onGenerated} />
          {address && rawTransaction && (
            <Sender address={address} rawTransaction={rawTransaction} />
          )}
        </Box>
      </Stack>
    </MainLayout>
  );
};

export default App;
