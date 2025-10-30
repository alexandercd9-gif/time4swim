
export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body className="bg-gradient-to-br from-blue-100 via-cyan-100 to-white min-h-screen flex items-center justify-center">
				{children}
			</body>
		</html>
	);
}

