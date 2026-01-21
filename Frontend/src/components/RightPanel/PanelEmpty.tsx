import { useTranslation } from "react-i18next";

export const PanelEmpty = () => {
  const { t } = useTranslation();
  return (
    <aside className="right-panel empty">
      <div>➡️ {t('rightPanel.selectTab')}</div>
    </aside>
  );
};
