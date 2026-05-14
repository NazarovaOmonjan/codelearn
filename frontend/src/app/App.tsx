import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './i18n';
import { AuthProvider } from './auth';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <LanguageProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}