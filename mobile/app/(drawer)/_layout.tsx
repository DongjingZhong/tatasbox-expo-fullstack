// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";

export default function DrawerLayout() {
  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          drawerStyle: { width: 280 },
          swipeEdgeWidth: 32,
        }}
      >
        {/* Hide Home from the drawer list but keep it inside Drawer */}
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        {/* The ONLY visible item in the drawer */}
        <Drawer.Screen
          name="pricing"
          options={{ title: "Pricing", drawerLabel: "Pricing" }}
        />
      </Drawer>
    </>
  );
}
