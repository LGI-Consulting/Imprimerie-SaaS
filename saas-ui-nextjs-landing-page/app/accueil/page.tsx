import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { Page } from "@saas-ui-pro/react";

const ReceptionDashboard = () => {
  const [clients, setClients] = useState([]);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    axios.get("/api/clients") // adjust to your backend endpoint
      .then((res) => setClients(res.data))
      .catch((err) => console.error(err));
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await axios.post("/api/orders", data); // adjust to your backend endpoint
      toast({
        title: "Order created.",
        description: "The order has been submitted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
    } catch (err) {
      toast({
        title: "Error.",
        description: "Failed to submit order.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Page title="Reception Dashboard">
      <Container maxW="container.lg" py={10}>
        <Heading size="lg" mb={6}>
          New Order
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={5}>
            <FormControl isRequired>
              <FormLabel>Client</FormLabel>
              <Select placeholder="Select client" {...register("clientId")}>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Material</FormLabel>
              <Select placeholder="Select material" {...register("material")}>
                <option value="bache">Bâche</option>
                <option value="autocollant">Autocollant</option>
              </Select>
            </FormControl>

            <Flex gap={4}>
              <FormControl isRequired>
                <FormLabel>Width (m)</FormLabel>
                <Input type="number" step="0.01" {...register("width")} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Height (m)</FormLabel>
                <Input type="number" step="0.01" {...register("height")} />
              </FormControl>
            </Flex>

            <Flex gap={4}>
              <FormControl display="flex" alignItems="center">
                <Switch {...register("eyelets")} mr={2} />
                <FormLabel mb="0">Eyelets</FormLabel>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <Switch {...register("perforation")} mr={2} />
                <FormLabel mb="0">Perforation</FormLabel>
              </FormControl>
            </Flex>

            <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
              Submit Order
            </Button>
          </Stack>
        </form>
      </Container>
    </Page>
  );
};

export default ReceptionDashboard;
