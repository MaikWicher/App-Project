import { ProgressBar } from "@fluentui/react-components";
import { useAppStatus } from "../contexts/AppStatusContext";
import { useTranslation } from "react-i18next";

export const StatusBar = () => {
  const { status, progress, isLoading } = useAppStatus();
  const { t } = useTranslation('common');

  return (
    <div className="status-bar" style={{ display: 'flex', alignItems: 'center', padding: '0 10px', height: '25px', fontSize: '12px', background: '#0078d4', color: 'white' }}>
      <div style={{ marginRight: '10px', minWidth: '100px' }}>{t(status, { defaultValue: status })}</div>
      {isLoading && (
        <div style={{ flex: 1, paddingRight: '10px' }}>
          <ProgressBar value={progress / 100} color="success" />
        </div>
      )}
      {!isLoading && <div style={{ flex: 1 }}>{/* Spacer or additional info */}</div>}
    </div>
  );
};
