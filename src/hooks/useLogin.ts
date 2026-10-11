import { useState, type FormEvent } from "react";
// Hooks
import { useSession } from "./useSession";

export function useLogin() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const message = await signIn(email.trim(), password);
    if (message) setError(message);
    setSubmitting(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    handleSubmit,
  };
}
