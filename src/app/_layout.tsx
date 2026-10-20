import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "../../hooks/useTheme";

export default function RootLayout() {

  	return (

		<ThemeProvider>

			<SafeAreaProvider>

				<Stack screenOptions={{headerShown: false}}>

					<Stack.Screen name="Login" />
					<Stack.Screen name="Register" />

				</Stack>

			</SafeAreaProvider>
			
		</ThemeProvider>
  		
	);
}
