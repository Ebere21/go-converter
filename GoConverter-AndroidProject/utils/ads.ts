import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";

const interstitial = InterstitialAd.createForAdRequest("ca-app-pub-8451933386874185/1173253544", {
  requestNonPersonalizedAdsOnly: true,
});

export async function showInterstitialIfNeeded() {
  try {
    let count = await AsyncStorage.getItem("conversionCount");
    count = count ? String(parseInt(count) + 1) : "1";
    await AsyncStorage.setItem("conversionCount", count);

    if (parseInt(count) % 2 === 1) {
      interstitial.load();
      return new Promise<void>((resolve) => {
        const onLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show();
        });
        const onClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          onLoaded();
          onClosed();
          resolve();
        });
        const onError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
          onLoaded();
          onError();
          resolve();
        });
        setTimeout(() => resolve(), 4000);
      });
    }
  } catch (e) {
    // ignore
  }
}
