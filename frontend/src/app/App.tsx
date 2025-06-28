import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <div className="min-h-screen bg-gray-50">
          <AppRouter />
        </div>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;