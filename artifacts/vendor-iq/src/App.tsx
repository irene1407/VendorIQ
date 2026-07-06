import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/Shell';

// Pages
import Dashboard from '@/pages/dashboard';
import Suppliers from '@/pages/suppliers';
import Risk from '@/pages/risk';
import Forecast from '@/pages/forecast';
import Fraud from '@/pages/fraud';
import Contracts from '@/pages/contracts';
import Graph from '@/pages/graph';
import News from '@/pages/news';
import Search from '@/pages/search';
import Monitoring from '@/pages/monitoring';
import Experiments from '@/pages/experiments';
import Simulate from '@/pages/simulate';
import Savings from '@/pages/savings';
import Alerts from '@/pages/alerts';
import Agents from '@/pages/agents';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/risk" component={Risk} />
        <Route path="/forecast" component={Forecast} />
        <Route path="/fraud" component={Fraud} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/graph" component={Graph} />
        <Route path="/news" component={News} />
        <Route path="/search" component={Search} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/experiments" component={Experiments} />
        <Route path="/simulate" component={Simulate} />
        <Route path="/savings" component={Savings} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/agents" component={Agents} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
