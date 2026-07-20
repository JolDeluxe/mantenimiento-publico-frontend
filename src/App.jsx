import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/routes/AppRoutes';
import { ToastContainer } from '@/components/notification/toast-container';
import { processSyncQueue } from '@/stores/sync-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App = () => {

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Volvió internet → sincronizando...');
      processSyncQueue();
    };

    window.addEventListener('online', handleOnline);

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;