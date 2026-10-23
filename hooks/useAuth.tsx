import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from "../config/api";


const API_URL = "http://localhost:3000/login"
const API_METHOD = 'POST'

interface AuthContextType {
	user:					({phoneNumber: string, handleName: string, jwt: string} | null)
	isAuthenticated: 		boolean
	checkPhoneLogin: 		(phoneNumber: string) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: string; } | undefined>
	checkPhoneRegister: 	(phoneNumber: string) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: string; } | undefined>
	login: 					(phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: string; } | undefined>
	register: 				(phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: string; } | undefined>
	logout:					() => void
}



const AuthContext = createContext<null | AuthContextType>(null);


export function AuthProvider({ children }: {children: ReactNode}) {

	const [user, setUser] = useState(null);

	useEffect(() => {

		AsyncStorage.getItem("user").then((value) => {
	  	
			if (value) {
				setUser(JSON.parse(value));
			}
		
		});

	}, []);

	
	// check if phone is valid and send otp if it is valid
	const checkPhoneLogin = async (phoneNumber: string) => {

		try {
			const response = await fetch(`${API_BASE_URL}/api/auth/loginSendOTP`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(phoneNumber),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || `HTTP ${response.status}`);
			}



			return { success: true };
    	} 
		catch (error) {
			if (error instanceof Error) {
    
    			console.error(error.message); 
      			return { success: false, error: error.message };
			}
			else {
				// Handle cases where something else was thrown (e.g., a string or undefined)
				console.error("An unexpected error occurred:", String(error));
			}
    	}

	}
	

	const checkPhoneRegister = async (phoneNumber: string) => {
		try {
			const response = await fetch(`${API_BASE_URL}/registerOTP`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(phoneNumber),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || `HTTP ${response.status}`);
			}



			return { success: true };
    	} 
		catch (error) {
			if (error instanceof Error) {
    
    			console.error(error.message); 
      			return { success: false, error: error.message };
			}
			else {
				// Handle cases where something else was thrown (e.g., a string or undefined)
				console.error("An unexpected error occurred:", String(error));
			}
    	}
	}


  	const login = async (phoneNumber: string, otp: string) => {
		try {
			const response = await fetch(`${API_BASE_URL}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({phoneNumber, otp}),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || `HTTP ${response.status}`);
			}

			const data = await response.json();
			setUser(data);
			await AsyncStorage.setItem("user", JSON.stringify(data));
			return { success: true };
    	} 
		catch (error) {
			if (error instanceof Error) {
    
    			console.error(error.message); 
      			return { success: false, error: error.message };
			}
			else {
				// Handle cases where something else was thrown (e.g., a string or undefined)
				console.error("An unexpected error occurred:", String(error));
			}
    	}
  	};

  	const register = async (phoneNumber: string, otp: string) => {
    	try {
     		const response = await fetch(`${API_BASE_URL}/register`, {
        	method: 'POST',
        	headers: { 'Content-Type': 'application/json' },
        	body: JSON.stringify({phoneNumber, otp}),
      	});

      	if (!response.ok) {
        	const err = await response.json();
        	throw new Error(err.error || `HTTP ${response.status}`);
      	}

      	return { success: true };
    	} 
		catch (error) {
    	  	if (error instanceof Error) {
    
    			console.error(error.message); 
      			return { success: false, error: error.message };
			}
			else {
				// Handle cases where something else was thrown (e.g., a string or undefined)
				console.error("An unexpected error occurred:", String(error));
			}
    	}
  	};

  	const logout = () => {
    	setUser(null);
    	localStorage.removeItem('user');
  	};

  	const isAuthenticated = (user !== null);

  	return (
    	<AuthContext.Provider value={{ user, checkPhoneLogin, checkPhoneRegister, login, register, logout, isAuthenticated }}>
      	{children}
    	</AuthContext.Provider>
  );
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
}
