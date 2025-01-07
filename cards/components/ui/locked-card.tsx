"use client";

import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import { PinInput } from "@/components/ui/pin-input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Field } from "@/components/ui/field";
import { Card } from "@chakra-ui/react";
import CardSkeleton from "./card-skeleton";

const PIN_LENGTH = 4;
const MIN_SLEEP_TIME = 2000;

const LockedCardContent = ({
  slug,
  preview_content,
  onSuccess,
}: {
  slug: string;
  preview_content?: string;
  onSuccess: (gift: any) => void;
}) => {
  const [pin, setPin] = useState<string[]>([]);
  const [pinString, setPinString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const disabled = pinString.length !== PIN_LENGTH || isLoading;
  const [errorText, setErrorText] = useState("");

  const onSubmit = () => {
    setIsLoading(true);
    const now = new Date();
    axios
      .post(`/api/cards/${slug}/get-info`, { code: pinString })
      .then((res) => {
        onSuccess(res.data.gift);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error) {
          setErrorText(err.response.data.error);
        } else {
          setErrorText("Something went wrong");
        }
      })
      .finally(() => {
        // unlock the card in one second
        const sleepFor = Math.max(
          MIN_SLEEP_TIME,
          MIN_SLEEP_TIME - (new Date().getTime() - now.getTime()),
        );
        setTimeout(() => {
          setIsLoading(false);
        }, sleepFor);
      });
  };

  useEffect(() => {
    setPinString(pin.join(""));
  }, [pin]);

  return (
    <Stack gap={PIN_LENGTH} align="center" justify="center">
      <Heading size="2xl">This card is locked!</Heading>
      <Text>Enter the secret to unlock it 🔑</Text>
      <Field invalid={!!errorText} errorText={errorText} alignItems="center">
        <PinInput value={pin} onValueChange={(e) => setPin(e.value)} />
      </Field>
      <Button onClick={onSubmit} type="submit" disabled={disabled}>
        {isLoading ? "Loading..." : "Open"}
      </Button>
    </Stack>
  );
};

export default LockedCardContent;
