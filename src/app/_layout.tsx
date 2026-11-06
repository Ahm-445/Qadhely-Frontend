import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationObserver from "../../components/NotificationObserver";
import { AuthProvider } from "../../hooks/useAuth";
import { ThemeProvider } from "../../hooks/useTheme";

export default function RootLayout() {

  	return (

		<AuthProvider>
		
			<ThemeProvider>

				<SafeAreaProvider>

					{/* US 18: opens the right group when a notification is tapped (no push on web) */}
					{Platform.OS !== "web" && <NotificationObserver />}

					<Stack screenOptions={{headerShown: false}}>

						<Stack.Screen name="Login" />
						<Stack.Screen name="Register" />
						<Stack.Screen name="Home" />
						<Stack.Screen name="CreateGroup" />
						<Stack.Screen name="group/(tabs)" />
						<Stack.Screen name="GroupMembers" />

					</Stack>

				</SafeAreaProvider>
				
			</ThemeProvider>

		</AuthProvider>
  		
	);
}
