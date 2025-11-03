
export default function LoginLayout({ children }: { children: React.ReactNode }) {
	// Don't add any wrapper - let the login page handle its own layout
	return <>{children}</>;
}
