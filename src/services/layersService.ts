// Layers Growth SDK Service for PoquitoTalk
// Connects telemetry, app events, and RevenueCat purchase attribution to Layers

import { LayersReactNative, connectRevenueCat } from "@layers/expo";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export const LAYERS_APP_ID = "app_14732857b75e24a0";
export const LAYERS_INGEST_HOST = "https://in.layers.com";

class LayersGrowthService {
  private layersClient: LayersReactNative | null = null;
  private isInitialized = false;

  public init(): void {
    if (this.isInitialized) return;

    try {
      this.layersClient = new LayersReactNative({
        appId: LAYERS_APP_ID,
        environment: "production",
        enableDebug: __DEV__,
      });

      this.layersClient.init();
      this.isInitialized = true;
      console.log("Layers Growth SDK initialized successfully with App ID:", LAYERS_APP_ID);

      // Connect RevenueCat for automated subscription & checkout attribution
      if (Purchases) {
        try {
          const purchasesAdapter = {
            addCustomerInfoUpdateListener: (listener: any) => Purchases.addCustomerInfoUpdateListener(listener),
            getCustomerInfo: async () => {
              const info = await Purchases.getCustomerInfo();
              return { customerInfo: info as any };
            },
          };
          connectRevenueCat({ sdk: this.layersClient as any }, purchasesAdapter as any);
          console.log("Connected RevenueCat attribution to Layers SDK");
        } catch (rcErr) {
          console.warn("Layers: connectRevenueCat notice:", rcErr);
        }
      }

      // Initial app open event
      this.track("app_open", {
        platform: Platform.OS,
        app: "PoquitoTalk",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Layers SDK initialization notice:", err);
    }
  }

  public track(eventName: string, properties?: Record<string, any>): void {
    try {
      if (!this.isInitialized) {
        this.init();
      }
      this.layersClient?.track(eventName, properties || {});
    } catch (e) {
      console.warn(`Layers track notice for "${eventName}":`, e);
    }
  }

  public flush(): void {
    try {
      this.layersClient?.flush();
    } catch (e) {}
  }
}

export const layersService = new LayersGrowthService();
