import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

export default function AdBanner() {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", marginTop: 10 }}>
      <BannerAd
        unitId={"ca-app-pub-8451933386874185/2677906902"}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
