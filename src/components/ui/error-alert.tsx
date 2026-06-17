import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: string | null;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <Alert variant="destructive" size="compact">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
