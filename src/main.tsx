import { ConfigProvider } from "antd";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#1677ff",
        colorInfo: "#1677ff",
        colorSuccess: "#52c41a",
        colorWarning: "#faad14",
        colorError: "#ff4d4f",
        colorTextBase: "#1f1f1f",
        colorBgBase: "#ffffff",
        fontFamily: "'Source Sans 3', sans-serif",
        sizeUnit: 8,
        sizeXXS: 4,
        sizeXS: 8,
        sizeSM: 16,
        sizeMD: 24,
        sizeLG: 32,
        sizeXL: 40,
        sizeXXL: 48,
        fontSize: 14,
        fontSizeSM: 14,
        fontSizeLG: 18,
        fontSizeXL: 22,
        fontSizeXS: 12,
        borderRadius: 8,
        borderRadiusSM: 4,
        borderRadiusLG: 16,
        lineHeight: 1.5,
        controlHeight: 32,
        controlHeightSM: 32,
        controlHeightLG: 32,
      },
    }}
  >
    <App />
  </ConfigProvider>,
);
