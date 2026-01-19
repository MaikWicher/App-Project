import { ProgressBar } from "@fluentui/react-components";
import { useAppStatus } from "../contexts/AppStatusContext";

export const StatusBar = () => {
  const { status, progress, isLoading } = useAppStatus();

  return (
    <div className="status-bar" style={{ display: 'flex', alignItems: 'center', padding: '0 10px', height: '25px', fontSize: '12px', background: '#0078d4', color: 'white' }}>
      <div style={{ marginRight: '10px', minWidth: '100px' }}>{status}</div>
      {isLoading && (
        <div style={{ flex: 1, paddingRight: '10px' }}>
          <ProgressBar value={progress / 100} color="success" />
        </div>
      )}
      {!isLoading && <div style={{ flex: 1 }}>{/* Spacer or additional info */}</div>}
    </div>
  );
};
