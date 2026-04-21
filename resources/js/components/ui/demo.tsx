import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert-1';
import {
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  Info,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';

export default function AlertDemo() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-[600px] flex-col items-center justify-center gap-5 p-10">
      <Alert appearance="outline" close={true}>
        <AlertIcon>
          <AlertCircle />
        </AlertIcon>
        <AlertTitle>This is a default alert</AlertTitle>
      </Alert>

      <Alert variant="primary" appearance="outline" close={true}>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>This is a primary alert</AlertTitle>
      </Alert>

      <Alert variant="success" appearance="outline" close={true}>
        <AlertIcon>
          <CheckCircle2 />
        </AlertIcon>
        <AlertTitle>This is a success alert</AlertTitle>
      </Alert>

      <Alert variant="destructive" appearance="outline" close={true}>
        <AlertIcon>
          <CircleAlert />
        </AlertIcon>
        <AlertTitle>This is a destructive alert</AlertTitle>
      </Alert>

      <Alert variant="info" appearance="outline" close={true}>
        <AlertIcon>
          <ShieldAlert />
        </AlertIcon>
        <AlertTitle>This is an info alert</AlertTitle>
      </Alert>

      <Alert variant="warning" appearance="outline" close={true}>
        <AlertIcon>
          <TriangleAlert />
        </AlertIcon>
        <AlertTitle>This is a warning alert</AlertTitle>
      </Alert>
    </div>
  );
}
