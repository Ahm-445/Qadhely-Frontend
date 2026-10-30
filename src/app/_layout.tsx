import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "../../hooks/useAuth";
import { ThemeProvider } from "../../hooks/useTheme";

export default function RootLayout() {

  	return (

		<AuthProvider>
		
			<ThemeProvider>

				<SafeAreaProvider>

					<Stack screenOptions={{headerShown: false}}>

						<Stack.Screen name="Login" />
						<Stack.Screen name="Register" />
						<Stack.Screen name="Home" />
						<Stack.Screen name="CreateGroup" />
						<Stack.Screen name="Group" />
						<Stack.Screen name="GroupMembers" />

					</Stack>

				</SafeAreaProvider>
				
			</ThemeProvider>

		</AuthProvider>
  		
	);
}
