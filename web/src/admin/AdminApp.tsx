import { StaffGate } from './components/StaffGate';
import { SentinelApp } from './sentinel/SentinelApp';

export function AdminApp() {
  return (
    <StaffGate>
      <SentinelApp />
    </StaffGate>
  );
}

export default AdminApp;
